import React, { useEffect, useMemo, useState } from 'react';
import { CriteriaModal } from './components/CriteriaModal';
import { DailyHistoryTable } from './components/DailyHistoryTable';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { LiveTwoDayCompareModal } from './components/LiveTwoDayCompareModal';
import { MainBoard } from './components/MainBoard';
import { RawStoreUiCompareModal } from './components/RawStoreUiCompareModal';
import { SecurityAuditModal } from './components/SecurityAuditModal';
import { SubmissionModal } from './components/SubmissionModal';
import { SyntheticRunnerSection } from './components/SyntheticRunnerSection';
import type {
  ComparisonResult,
  DailyRecord,
  EvaluationState,
  FixtureItem,
  NormalizedReading,
  ReadingStatus,
} from './types/board';
import { comparisonFor, recordIdFor, resetEvaluationState, runFixture } from './utils/boardEngine';
import { FIXTURE_RECOVER_D2 } from './utils/fixturesData';
import { AVAILABLE_SOURCES, SEOUL_WEATHER_SOURCE } from './utils/liveSources';
import {
  loadStoredEvalState,
  loadStoredLiveRecords,
  loadStoredRawJson,
  saveStoredEvalState,
  saveStoredLiveRecords,
  saveStoredRawJson,
} from './utils/storage';

export const App: React.FC = () => {
  // 모드: 'live' (실제 공개 원천) vs 'synthetic' (합성 fixture)
  const [activeMode, setActiveMode] = useState<'live' | 'synthetic'>('live');

  // 테마 상태
  const [isDark, setIsDark] = useState<boolean>(() => {
    return (
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Live 모드 상태
  const [liveRecords, setLiveRecords] = useState<DailyRecord[]>(() => loadStoredLiveRecords());
  const [liveRawJson, setLiveRawJson] = useState<unknown>(() => loadStoredRawJson());
  const [selectedSourceId, setSelectedSourceId] = useState<string>('seoul-weather-temp');
  const [liveStatus, setLiveStatus] = useState<ReadingStatus>({
    freshness: 'fresh',
    error_code: 'none',
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  // 최신 라이브 레코드
  const latestLiveRecord = useMemo(() => {
    if (liveRecords.length === 0) return null;
    const sorted = [...liveRecords].sort((a, b) => b.record_date.localeCompare(a.record_date));
    return sorted[0];
  }, [liveRecords]);

  const [liveCurrentReading, setLiveCurrentReading] = useState<NormalizedReading | null>(() => {
    const initialList = loadStoredLiveRecords();
    if (initialList.length > 0) {
      const sorted = [...initialList].sort((a, b) => b.record_date.localeCompare(a.record_date));
      return sorted[0].reading;
    }
    return null;
  });

  // Live 전일 대비 계산
  const liveComparison: ComparisonResult = useMemo(() => {
    if (!liveCurrentReading) {
      return { state: 'insufficient', direction: null, magnitude: null, unit: null };
    }
    return comparisonFor(liveRecords, liveCurrentReading);
  }, [liveRecords, liveCurrentReading]);

  // Synthetic 모드 상태
  const [evalState, setEvalState] = useState<EvaluationState>(() => loadStoredEvalState());

  // Synthetic 변경 시 자동 저장
  const updateEvalState = (newState: EvaluationState) => {
    setEvalState(newState);
    saveStoredEvalState(newState);
  };

  // 모달 상태
  const [isCriteriaOpen, setIsCriteriaOpen] = useState(false);
  const [isTwoDayCompareOpen, setIsTwoDayCompareOpen] = useState(false);
  const [isRawStoreUiOpen, setIsRawStoreUiOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isSubmissionOpen, setIsSubmissionOpen] = useState(false);

  // 실제 공개 원천 실시간 조회 (Live Fetch)
  const handleRefreshLive = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    const sourceDef = AVAILABLE_SOURCES.find((s) => s.id === selectedSourceId) || SEOUL_WEATHER_SOURCE;
    const minInteractiveDelay = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const [{ reading, rawJson }] = await Promise.all([sourceDef.fetchAndNormalize(), minInteractiveDelay]);
      setLiveRawJson(rawJson);
      saveStoredRawJson(rawJson);

      // 일별 기록 저장 (같은 날짜면 원자적 갱신, 다음 날짜면 새 행)
      setLiveRecords((prev) => {
        const next = [...prev];
        const existingIdx = next.findIndex(
          (r) => r.signal_id === reading.signal_id && r.record_date === reading.record_date,
        );
        const existing = existingIdx >= 0 ? next[existingIdx] : null;

        const newRow: DailyRecord = {
          record_id: existing ? existing.record_id : recordIdFor(reading),
          signal_id: reading.signal_id,
          record_date: reading.record_date,
          normalized_value: reading.normalized_value,
          unit: reading.unit,
          first_fetched_at: existing ? existing.first_fetched_at : reading.fetched_at,
          last_fetched_at: reading.fetched_at,
          reading,
        };

        if (existingIdx >= 0) {
          next[existingIdx] = newRow;
        } else {
          next.push(newRow);
        }
        next.sort((a, b) => a.record_date.localeCompare(b.record_date));
        saveStoredLiveRecords(next);
        return next;
      });

      setLiveCurrentReading(reading);
      setLiveStatus({ freshness: 'fresh', error_code: 'none' });
    } catch (err: unknown) {
      console.warn('Live fetch 실패, 마지막 정상값을 유지하며 stale로 전환합니다:', err);
      // 어떤 실패에도 마지막 정상값은 유지하고 stale 표시!
      const errorMsg = err instanceof Error ? err.message : String(err || '');
      const errorCode = errorMsg.includes('Failed to fetch')
        ? 'offline'
        : errorMsg.includes('401') || errorMsg.includes('403')
          ? 'auth'
          : errorMsg.includes('429')
            ? 'rate_limit'
            : 'timeout';

      setLiveStatus({ freshness: 'stale', error_code: errorCode });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Live 모드 출처 변경
  const handleSelectSource = async (sourceId: string) => {
    setSelectedSourceId(sourceId);
    setIsRefreshing(true);
    const sourceDef = AVAILABLE_SOURCES.find((s) => s.id === sourceId) || SEOUL_WEATHER_SOURCE;
    const minInteractiveDelay = new Promise((resolve) => setTimeout(resolve, 800));

    try {
      const [{ reading, rawJson }] = await Promise.all([sourceDef.fetchAndNormalize(), minInteractiveDelay]);
      setLiveRawJson(rawJson);
      saveStoredRawJson(rawJson);
      setLiveCurrentReading(reading);
      setLiveStatus({ freshness: 'fresh', error_code: 'none' });
    } catch (err: unknown) {
      console.warn('원천 조회 실패:', err);
      setLiveStatus({ freshness: 'stale', error_code: 'offline' });
    } finally {
      setIsRefreshing(false);
    }
  };

  // Fixture 실행
  const handleExecuteFixture = (fixture: FixtureItem) => {
    const nextState = runFixture(evalState, fixture);
    updateEvalState(nextState);
  };

  // 합성 상태 초기화
  const handleResetEvalState = () => {
    const fresh = resetEvaluationState();
    updateEvalState(fresh);
  };

  // 장애 상태에서 다시 시도 (Retry) 행동
  const handleRetry = () => {
    if (activeMode === 'live') {
      handleRefreshLive();
    } else {
      // 합성 모드에서는 C19 규격에 따라 RECOVER_D2 재생
      handleExecuteFixture(FIXTURE_RECOVER_D2);
    }
  };

  // 2일 기록 재설정
  const handleResetTwoDays = (newRecords: DailyRecord[]) => {
    setLiveRecords(newRecords);
    saveStoredLiveRecords(newRecords);
    if (newRecords.length > 0) {
      const sorted = [...newRecords].sort((a, b) => b.record_date.localeCompare(a.record_date));
      setLiveCurrentReading(sorted[0].reading);
      setLiveStatus({ freshness: 'fresh', error_code: 'none' });
    }
  };

  return (
    <div className="bg-ambient-pattern flex min-h-screen flex-col overflow-x-clip bg-neutral-50 font-sans text-neutral-900 transition-colors dark:bg-neutral-950 dark:text-neutral-100">
      {/* 1. Header (Fixed top, pt-20 main offset) */}
      <Header
        status={activeMode === 'live' ? liveStatus : evalState.status}
        activeMode={activeMode}
        onModeChange={setActiveMode}
        onRefreshLive={handleRefreshLive}
        isRefreshing={isRefreshing}
        onOpenCriteria={() => setIsCriteriaOpen(true)}
        onOpenTwoDayCompare={() => setIsTwoDayCompareOpen(true)}
        onOpenRawStoreUi={() => setIsRawStoreUiOpen(true)}
        onOpenSecurity={() => setIsSecurityOpen(true)}
        onOpenSubmission={() => setIsSubmissionOpen(true)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
      />

      {/* 2. Main Container (pt-20 sm:pt-24 for fixed header) */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 pt-20 pb-16 sm:px-6 sm:pt-24">
        {/* Main Board (Value, Unit, Source, Source Time, Fetched At, Timezone, Delta) */}
        <MainBoard
          currentReading={activeMode === 'live' ? liveCurrentReading : evalState.current_reading}
          status={activeMode === 'live' ? liveStatus : evalState.status}
          comparison={activeMode === 'live' ? liveComparison : evalState.last_comparison}
          lastDelta={activeMode === 'live' ? liveComparison.magnitude : evalState.last_delta}
          onRetry={handleRetry}
          onRefreshLive={handleRefreshLive}
          isRefreshing={isRefreshing}
          activeMode={activeMode}
          selectedSourceId={selectedSourceId}
          onSelectSource={handleSelectSource}
        />

        {/* Synthetic Runner Section (Visible when in Synthetic Mode) */}
        {activeMode === 'synthetic' && (
          <SyntheticRunnerSection
            evalState={evalState}
            onExecuteFixture={handleExecuteFixture}
            onResetEvalState={handleResetEvalState}
            onApplyState={updateEvalState}
          />
        )}

        {/* Daily Readings Table (Card 4) */}
        <DailyHistoryTable
          records={activeMode === 'live' ? liveRecords : evalState.daily_readings}
          title={
            activeMode === 'live'
              ? '실제 공개 원천 일별 기록 보존 저장소 (Live Store)'
              : '합성 결정론적 일별 기록 보존 저장소 (Synthetic Store)'
          }
          description={
            activeMode === 'live'
              ? '실제 비개인 공개 원천(Open-Meteo)에서 수집된 일별 관측값입니다. 같은 KST 날짜는 1건으로 갱신되며, 익일은 새 행으로 생성됩니다.'
              : '합성 fixture(D1-A, D1-B, D2, RECOVER-D2)의 실행 결과가 보존되는 저장소입니다.'
          }
        />
      </main>

      {/* 3. Footer */}
      <Footer />

      {/* 4. Modals */}
      <CriteriaModal isOpen={isCriteriaOpen} onClose={() => setIsCriteriaOpen(false)} />
      <LiveTwoDayCompareModal
        isOpen={isTwoDayCompareOpen}
        onClose={() => setIsTwoDayCompareOpen(false)}
        liveRecords={liveRecords}
        onResetTwoDays={handleResetTwoDays}
      />
      <RawStoreUiCompareModal
        isOpen={isRawStoreUiOpen}
        onClose={() => setIsRawStoreUiOpen(false)}
        rawJson={liveRawJson}
        latestRecord={latestLiveRecord}
        currentReading={liveCurrentReading}
      />
      <SecurityAuditModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <SubmissionModal isOpen={isSubmissionOpen} onClose={() => setIsSubmissionOpen(false)} />
    </div>
  );
};

export default App;
