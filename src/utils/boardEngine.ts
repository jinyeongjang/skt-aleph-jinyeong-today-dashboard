import type {
  ComparisonResult,
  DailyRecord,
  ErrorCodeType,
  EvaluationState,
  FixtureItem,
  NormalizedReading,
  ReadingStatus,
} from '../types/board';
import { kstDate } from './kst';

export const NORMALIZED_KEYS = Object.freeze([
  'signal_id',
  'normalized_value',
  'unit',
  'source_name',
  'source_url',
  'source_time',
  'fetched_at',
  'record_timezone',
  'record_date',
]);

export const ERROR_CODES: readonly ErrorCodeType[] = Object.freeze([
  'timeout',
  'auth',
  'rate_limit',
  'offline',
  'schema_error',
]);

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

export function validateNormalizedReading(reading: any): reading is NormalizedReading {
  if (!reading || typeof reading !== 'object' || Array.isArray(reading)) {
    throw new TypeError('normalized reading must be an object');
  }

  const actualKeys = Object.keys(reading).sort();
  const expectedKeys = [...NORMALIZED_KEYS].sort();
  if (actualKeys.length !== expectedKeys.length || actualKeys.some((key, index) => key !== expectedKeys[index])) {
    throw new TypeError(`normalized reading keys must be exactly: ${NORMALIZED_KEYS.join(', ')}`);
  }

  if (!/^[a-z0-9][a-z0-9._-]*$/.test(reading.signal_id) || reading.signal_id.length > 100) {
    throw new TypeError('signal_id is invalid');
  }
  if (typeof reading.normalized_value !== 'number' || !Number.isFinite(reading.normalized_value)) {
    throw new TypeError('normalized_value must be a finite number');
  }
  for (const field of ['unit', 'source_name']) {
    if (typeof reading[field] !== 'string' || reading[field].trim() === '') {
      throw new TypeError(`${field} must be a non-empty string`);
    }
  }

  let sourceUrl: URL;
  try {
    sourceUrl = new URL(reading.source_url);
  } catch {
    throw new TypeError('source_url must be an absolute URL');
  }
  if (sourceUrl.protocol !== 'https:') {
    throw new TypeError('source_url must use HTTPS');
  }

  if (reading.source_time !== null && Number.isNaN(new Date(reading.source_time).getTime())) {
    throw new TypeError('source_time must be a valid date-time or null');
  }
  if (Number.isNaN(new Date(reading.fetched_at).getTime())) {
    throw new TypeError('fetched_at must be a valid date-time');
  }
  if (reading.record_timezone !== 'Asia/Seoul') {
    throw new TypeError('record_timezone must be Asia/Seoul');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(reading.record_date) || reading.record_date !== kstDate(reading.fetched_at)) {
    throw new TypeError('record_date must be the Asia/Seoul date derived from fetched_at');
  }

  return true;
}

export function validateStatus(status: any): status is ReadingStatus {
  if (!status || typeof status !== 'object' || Array.isArray(status)) return false;
  if (status.freshness === 'fresh') return status.error_code === 'none';
  if (status.freshness === 'stale') return ERROR_CODES.includes(status.error_code);
  return false;
}

export function resetEvaluationState(): EvaluationState {
  return {
    schema_version: 'aleph-t04-evaluation-state-v1',
    daily_readings: [],
    current_reading: null,
    status: null,
    last_delta: null,
    last_comparison: {
      state: 'insufficient',
      direction: null,
      magnitude: null,
      unit: null,
    },
    last_run: null,
    sequence: 0,
  };
}

export function recordIdFor(reading: NormalizedReading): string {
  return `demo-${reading.signal_id}-${reading.record_date}`;
}

export function comparisonFor(rows: DailyRecord[], current: NormalizedReading): ComparisonResult {
  const previous = rows
    .filter((row) => row.signal_id === current.signal_id && row.record_date < current.record_date)
    .sort((left, right) => right.record_date.localeCompare(left.record_date))[0];

  if (!previous) {
    return { state: 'insufficient', direction: null, magnitude: null, unit: null };
  }
  if (previous.unit !== current.unit) {
    return { state: 'unit_mismatch', direction: null, magnitude: null, unit: null };
  }
  const signed = current.normalized_value - previous.normalized_value;
  // 부동소수점 오차 방지: 0.000001 단위 반올림
  const roundedDiff = Math.round(signed * 10000) / 10000;

  return {
    state: 'comparable',
    direction: roundedDiff > 0 ? 'increase' : roundedDiff < 0 ? 'decrease' : 'unchanged',
    magnitude: Math.abs(roundedDiff),
    unit: current.unit,
  };
}

export function applySuccessfulReading(
  inputState: EvaluationState,
  reading: NormalizedReading,
  runMeta: { fixture_id?: string | null; virtual_now?: string | null } = {},
): EvaluationState {
  validateNormalizedReading(reading);
  const state = clone(inputState);
  const existingIndex = state.daily_readings.findIndex(
    (row) => row.signal_id === reading.signal_id && row.record_date === reading.record_date,
  );
  const existing = existingIndex >= 0 ? state.daily_readings[existingIndex] : null;
  const row: DailyRecord = {
    record_id: existing ? existing.record_id : recordIdFor(reading),
    signal_id: reading.signal_id,
    record_date: reading.record_date,
    first_normalized_value: existing
      ? (existing.first_normalized_value ?? existing.normalized_value)
      : reading.normalized_value,
    normalized_value: reading.normalized_value,
    unit: reading.unit,
    first_fetched_at: existing ? existing.first_fetched_at : reading.fetched_at,
    last_fetched_at: reading.fetched_at,
    reading: clone(reading),
  };

  if (existingIndex >= 0) {
    state.daily_readings[existingIndex] = row;
  } else {
    state.daily_readings.push(row);
  }
  state.daily_readings.sort((left, right) => left.record_date.localeCompare(right.record_date));

  state.current_reading = clone(reading);
  state.status = { freshness: 'fresh', error_code: 'none' };
  state.last_comparison = comparisonFor(state.daily_readings, reading);
  state.last_delta = state.last_comparison.magnitude;
  state.sequence += 1;
  state.last_run = {
    fixture_id: runMeta.fixture_id || null,
    virtual_now: runMeta.virtual_now || reading.fetched_at,
    outcome: 'success',
    error_code: 'none',
    retry_after_seconds: null,
  };
  return state;
}

export function applyError(
  inputState: EvaluationState,
  errorCode: ErrorCodeType,
  runMeta: {
    fixture_id?: string | null;
    virtual_now?: string | null;
    retry_after_seconds?: number | null;
  } = {},
): EvaluationState {
  if (!ERROR_CODES.includes(errorCode)) {
    throw new TypeError(`unsupported error code: ${errorCode}`);
  }
  const state = clone(inputState);
  state.status = { freshness: 'stale', error_code: errorCode };
  state.sequence += 1;
  state.last_run = {
    fixture_id: runMeta.fixture_id || null,
    virtual_now: runMeta.virtual_now || null,
    outcome: 'error',
    error_code: errorCode,
    retry_after_seconds: runMeta.retry_after_seconds ?? null,
  };
  return state;
}

export function runFixture(inputState: EvaluationState, fixture: FixtureItem): EvaluationState {
  const meta = {
    fixture_id: fixture.fixture_id,
    virtual_now: fixture.virtual_now,
    retry_after_seconds: fixture.transport.headers['retry-after']
      ? Number(fixture.transport.headers['retry-after'])
      : null,
  };

  if (fixture.transport.mode === 'timeout') return applyError(inputState, 'timeout', meta);
  if (fixture.transport.mode === 'offline') return applyError(inputState, 'offline', meta);
  if (fixture.transport.status === 401 || fixture.transport.status === 403) {
    return applyError(inputState, 'auth', meta);
  }
  if (fixture.transport.status === 429) return applyError(inputState, 'rate_limit', meta);
  if (fixture.transport.status && fixture.transport.status >= 200 && fixture.transport.status < 300) {
    try {
      return applySuccessfulReading(inputState, fixture.payload, meta);
    } catch {
      return applyError(inputState, 'schema_error', meta);
    }
  }
  return applyError(inputState, 'schema_error', meta);
}
