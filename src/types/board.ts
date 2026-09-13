export type FreshnessType = 'fresh' | 'stale';

export type ErrorCodeType = 'none' | 'timeout' | 'auth' | 'rate_limit' | 'offline' | 'schema_error';

export interface ReadingStatus {
  freshness: FreshnessType;
  error_code: ErrorCodeType;
}

export interface NormalizedReading {
  signal_id: string;
  normalized_value: number;
  unit: string;
  source_name: string;
  source_url: string;
  source_time: string | null;
  fetched_at: string;
  record_timezone: 'Asia/Seoul';
  record_date: string;
}

export interface DailyRecord {
  record_id: string;
  signal_id: string;
  record_date: string;
  first_normalized_value?: number; // 최초 수집 시점의 값 (LMS 1차 기록 보존 및 T04-C20 추적)
  normalized_value: number; // 최종 갱신값
  unit: string;
  first_fetched_at: string;
  last_fetched_at: string;
  reading: NormalizedReading;
}

export interface ComparisonResult {
  state: 'insufficient' | 'unit_mismatch' | 'comparable';
  direction: 'increase' | 'decrease' | 'unchanged' | null;
  magnitude: number | null;
  unit: string | null;
}

export interface LastRunInfo {
  fixture_id: string | null;
  virtual_now: string | null;
  outcome: 'success' | 'error';
  error_code: ErrorCodeType;
  retry_after_seconds: number | null;
}

export interface EvaluationState {
  schema_version: 'aleph-t04-evaluation-state-v1';
  daily_readings: DailyRecord[];
  current_reading: NormalizedReading | null;
  status: ReadingStatus | null;
  last_delta: number | null;
  last_comparison: ComparisonResult;
  last_run: LastRunInfo | null;
  sequence: number;
}

export interface FixtureTransport {
  mode: 'http' | 'timeout' | 'offline';
  status: number | null;
  delay_ms: number;
  deadline_ms: number;
  headers: Record<string, string>;
}

export interface FixtureExpected {
  freshness: FreshnessType;
  error_code: ErrorCodeType;
  row_count: number;
  stored_value: number;
  delta: number | null;
  preserve_last_good: boolean;
  record_date?: string;
  same_record_id_as?: string;
}

export interface FixtureItem {
  fixture_id: string;
  contract_version: string;
  description_ko: string;
  virtual_now: string;
  transport: FixtureTransport;
  payload: any;
  expected: FixtureExpected;
}
