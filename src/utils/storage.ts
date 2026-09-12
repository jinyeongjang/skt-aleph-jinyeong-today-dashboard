import type { DailyRecord, EvaluationState } from '../types/board';
import { resetEvaluationState } from './boardEngine';
import { getInitialTwoDayLiveRecords } from './liveSources';

export const STORAGE_KEY_EVAL_STATE = 'aleph_t04_eval_state_v1';
export const STORAGE_KEY_LIVE_RECORDS = 'aleph_t04_live_records_v1';
export const STORAGE_KEY_LAST_RAW_JSON = 'aleph_t04_last_raw_json_v1';

export function loadStoredEvalState(): EvaluationState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_EVAL_STATE);
    if (!raw) return resetEvaluationState();
    const parsed = JSON.parse(raw);
    if (parsed && parsed.schema_version === 'aleph-t04-evaluation-state-v1') {
      return parsed;
    }
  } catch (err) {
    console.warn('EvaluationState 복구 실패, 기본값으로 리셋합니다:', err);
  }
  return resetEvaluationState();
}

export function saveStoredEvalState(state: EvaluationState): void {
  try {
    localStorage.setItem(STORAGE_KEY_EVAL_STATE, JSON.stringify(state));
  } catch (err) {
    console.error('EvaluationState 저장 실패:', err);
  }
}

export function loadStoredLiveRecords(): DailyRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LIVE_RECORDS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('LiveRecords 복구 실패:', err);
  }
  // 초기 서로 다른 2일 기록 시드
  const initial = getInitialTwoDayLiveRecords();
  saveStoredLiveRecords(initial);
  return initial;
}

export function saveStoredLiveRecords(records: DailyRecord[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_LIVE_RECORDS, JSON.stringify(records));
  } catch (err) {
    console.error('LiveRecords 저장 실패:', err);
  }
}

export function loadStoredRawJson(): unknown {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LAST_RAW_JSON);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return null;
}

export function saveStoredRawJson(rawJson: unknown): void {
  try {
    localStorage.setItem(STORAGE_KEY_LAST_RAW_JSON, JSON.stringify(rawJson));
  } catch (err) {
    console.error('RawJson 저장 실패:', err);
  }
}
