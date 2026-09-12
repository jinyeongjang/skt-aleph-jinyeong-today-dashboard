import React, { useState } from 'react';
import { CheckCircle2, Play, RotateCcw, Sparkles, Zap } from 'lucide-react';
import type { EvaluationState, FixtureItem } from '../types/board';
import {
  ALL_FIXTURES,
  FAILURE_FIXTURES,
  FIXTURE_NORMAL_D1_A,
  FIXTURE_NORMAL_D1_B,
  FIXTURE_NORMAL_D2,
  FIXTURE_RECOVER_D2,
  FIXTURE_TIMEOUT,
} from '../utils/fixturesData';

interface SyntheticRunnerSectionProps {
  evalState: EvaluationState;
  onExecuteFixture: (fixture: FixtureItem) => void;
  onResetEvalState: () => void;
  onApplyState: (newState: EvaluationState) => void;
}

export const SyntheticRunnerSection: React.FC<SyntheticRunnerSectionProps> = ({
  evalState,
  onExecuteFixture,
  onResetEvalState,
}) => {
  const [activeTab, setActiveTab] = useState<'sequences' | 'individual'>('sequences');
  const [lastScenarioResult, setLastScenarioResult] = useState<string | null>(null);

  // 1. 성공 시퀀스 실행 (D1-A -> D1-B -> D2)
  const runSuccessSequence = () => {
    onResetEvalState();
    setTimeout(() => {
      onExecuteFixture(FIXTURE_NORMAL_D1_A);
      setTimeout(() => {
        onExecuteFixture(FIXTURE_NORMAL_D1_B);
        setTimeout(() => {
          onExecuteFixture(FIXTURE_NORMAL_D2);
          setLastScenarioResult(
            '성공 시퀀스 완주: D1-A(100) -> D1-B(105, 동일행 갱신) -> D2(120, 익일 신규행 추가, delta +15)',
          );
        }, 300);
      }, 300);
    }, 100);
  };

  // 2. 실패 시퀀스 실행 (D1-A -> D1-B -> 선택한 실패 Fixture)
  const runFailureSequence = (failureFixture: FixtureItem) => {
    onResetEvalState();
    setTimeout(() => {
      onExecuteFixture(FIXTURE_NORMAL_D1_A);
      setTimeout(() => {
        onExecuteFixture(FIXTURE_NORMAL_D1_B);
        setTimeout(() => {
          onExecuteFixture(failureFixture);
          setLastScenarioResult(
            `실패 시퀀스 완주: ${failureFixture.fixture_id} 재생 -> 마지막 정상값 105 보존, stale/${failureFixture.expected.error_code} 상태`,
          );
        }, 300);
      }, 300);
    }, 100);
  };

  // 3. 복구 시퀀스 실행 (D1-A -> D1-B -> TIMEOUT -> RECOVER-D2)
  const runRecoverySequence = () => {
    onResetEvalState();
    setTimeout(() => {
      onExecuteFixture(FIXTURE_NORMAL_D1_A);
      setTimeout(() => {
        onExecuteFixture(FIXTURE_NORMAL_D1_B);
        setTimeout(() => {
          onExecuteFixture(FIXTURE_TIMEOUT);
          setTimeout(() => {
            onExecuteFixture(FIXTURE_RECOVER_D2);
            setLastScenarioResult(
              '복구 시퀀스 완주 (T04-C19): TIMEOUT 장애 후 RECOVER-D2 재생 -> fresh/none 복구 및 익일 신규 행 정확히 1건 추가 (총 2행, 120pt, delta 15)',
            );
          }, 400);
        }, 300);
      }, 300);
    }, 100);
  };

  // 현재 상태가 Fixture의 Expected 조건을 충족하는지 검증
  const checkCurrentCompliance = (fixture: FixtureItem) => {
    if (evalState.last_run?.fixture_id !== fixture.fixture_id) return null;
    const isFreshnessMatch = evalState.status?.freshness === fixture.expected.freshness;
    const isErrorMatch = evalState.status?.error_code === fixture.expected.error_code;
    const isRowMatch = evalState.daily_readings.length === fixture.expected.row_count;
    const isStoredMatch = evalState.current_reading?.normalized_value === fixture.expected.stored_value;

    const allMatch = isFreshnessMatch && isErrorMatch && isRowMatch && isStoredMatch;
    return { allMatch, isFreshnessMatch, isErrorMatch, isRowMatch, isStoredMatch };
  };

  return (
    <section id="synthetic-runner" className="mb-10 scroll-mt-24">
      <div className="glass-panel glass-glow rounded-3xl p-6 shadow-md transition-all sm:p-9">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-purple-200 bg-purple-100/80 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:border-purple-800/60 dark:bg-purple-950/60 dark:text-purple-300">
                카드 3 & 4 검증기
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                assets/t04-real-information-board 9종 fixture 내장
              </span>
            </div>
            <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
              <span>합성 9종 Fixture 시뮬레이터 & 상태 전이 검사</span>
              <Sparkles className="h-5 w-5 text-purple-500" />
            </h2>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
              느림·인증거절·호출제한·오프라인·형식변경 5종 실패와 오류 뒤 회복, 하루 한 줄 규칙을 결정론적으로
              재생합니다.
            </p>
          </div>

          {/* Reset Button */}
          <button
            type="button"
            onClick={onResetEvalState}
            className="hover-lift active-press inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-xs transition-colors hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-700"
            title="합성 상태 초기화 (Reset)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>상태 초기화 (Reset)</span>
          </button>
        </div>

        {/* Tab Selector */}
        <div className="my-6 inline-flex items-center rounded-xl border border-neutral-200/80 bg-neutral-100/80 p-1 text-xs font-medium dark:border-neutral-800 dark:bg-neutral-800/70">
          <button
            type="button"
            onClick={() => setActiveTab('sequences')}
            className={`hover-lift active-press rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'sequences'
                ? 'bg-purple-600 font-bold text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            공식 시퀀스 시나리오 (권장)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('individual')}
            className={`hover-lift active-press rounded-lg px-3.5 py-1.5 transition-all ${
              activeTab === 'individual'
                ? 'bg-purple-600 font-bold text-white shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            개별 Fixture 9종 목록
          </button>
        </div>

        {/* Scenario Result Toast Banner */}
        {lastScenarioResult && (
          <div className="mb-6 flex items-center justify-between rounded-2xl border border-purple-200 bg-purple-50 p-4 text-xs text-purple-900 shadow-xs dark:border-purple-800 dark:bg-purple-950/60 dark:text-purple-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
              <span className="leading-relaxed font-medium">{lastScenarioResult}</span>
            </div>
            <button
              type="button"
              onClick={() => setLastScenarioResult(null)}
              className="ml-3 shrink-0 text-xs font-semibold text-purple-600 hover:underline dark:text-purple-400"
            >
              닫기
            </button>
          </div>
        )}

        {/* Tab 1: Recommended Sequences */}
        {activeTab === 'sequences' && (
          <div className="space-y-4">
            {/* 1. Success Sequence */}
            <div className="hover-lift flex flex-col justify-between gap-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/50 p-5 shadow-xs transition-all md:flex-row md:items-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800 dark:bg-emerald-900/70 dark:text-emerald-200">
                    성공 시퀀스
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    D1-A ➔ D1-B (동일 날짜 갱신) ➔ D2 (익일 행 추가)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  T04-C20(같은 날짜 1건 병합) 및 T04-C21(익일 2행 +15pt 생성)을 순차적으로 검증합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={runSuccessSequence}
                className="hover-lift active-press inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-emerald-700"
              >
                <Play className="h-3.5 w-3.5" />
                <span>성공 시퀀스 1-클릭 실행</span>
              </button>
            </div>

            {/* 2. Recovery Sequence (C19) */}
            <div className="hover-lift flex flex-col justify-between gap-4 rounded-2xl border border-blue-200/80 bg-blue-50/50 p-5 shadow-xs transition-all md:flex-row md:items-center dark:border-blue-900/60 dark:bg-blue-950/30">
              <div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-bold text-blue-800 dark:bg-blue-900/70 dark:text-blue-200">
                    회복 시퀀스 (T04-C19 핵심)
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">
                    D1-A ➔ D1-B ➔ TIMEOUT (장애) ➔ RECOVER-D2 (회복)
                  </h3>
                </div>
                <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">
                  Timeout 장애 상태(stale/timeout, 105 보존)에서 다시 시도(RECOVER-D2)를 실행하여 fresh/none 복구 및
                  익일 신규 행 1건 추가를 확인합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={runRecoverySequence}
                className="hover-lift active-press inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-blue-700"
              >
                <Zap className="h-3.5 w-3.5" />
                <span>회복 시퀀스 1-클릭 실행 (C19)</span>
              </button>
            </div>

            {/* 3. 5 Failure Sequences */}
            <div className="rounded-2xl border border-amber-200/80 bg-amber-50/50 p-5 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/30">
              <div className="mb-4">
                <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-800 dark:bg-amber-900/70 dark:text-amber-200">
                  실패 5종 시퀀스 (T04-C12 ~ C18)
                </span>
                <h3 className="mt-1.5 text-sm font-bold text-neutral-900 dark:text-neutral-100">
                  D1-A ➔ D1-B 직후 각 실패 재현 (마지막 정상값 105 보존 & Stale 배지)
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {FAILURE_FIXTURES.map((fixture) => (
                  <button
                    key={fixture.fixture_id}
                    type="button"
                    onClick={() => runFailureSequence(fixture)}
                    className="hover-lift active-press dark:border-neutral-750 dark:bg-neutral-850/80 flex items-center justify-between rounded-xl border border-neutral-200/80 bg-white/80 p-3.5 text-left shadow-xs transition-all hover:border-amber-400 dark:hover:border-amber-500"
                  >
                    <div>
                      <span className="block text-xs font-bold text-neutral-900 dark:text-neutral-100">
                        {fixture.fixture_id}
                      </span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                        {fixture.expected.error_code}
                      </span>
                    </div>
                    <Play className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Individual 9 Fixtures */}
        {activeTab === 'individual' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {ALL_FIXTURES.map((fixture) => {
              const compliance = checkCurrentCompliance(fixture);
              const isCurrentlyActive = evalState.last_run?.fixture_id === fixture.fixture_id;

              return (
                <div
                  key={fixture.fixture_id}
                  className={`hover-lift rounded-2xl border p-5 shadow-xs transition-all ${
                    isCurrentlyActive
                      ? 'border-purple-500 bg-purple-50/60 ring-2 ring-purple-400/40 dark:bg-purple-950/40'
                      : 'dark:bg-neutral-850/60 border-neutral-200/80 bg-white/70 dark:border-neutral-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                      {fixture.fixture_id}
                    </span>
                    {compliance && (
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold ${
                          compliance.allMatch
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {compliance.allMatch ? 'MATCH PASS' : 'MISMATCH'}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 line-clamp-2 text-[11px] leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {fixture.description_ko}
                  </p>

                  <div className="mt-4 space-y-1.5 border-t border-neutral-100 pt-3 text-[11px] text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                    <div className="flex justify-between">
                      <span>기대 신선도:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {fixture.expected.freshness} / {fixture.expected.error_code}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>기대 행 수 / 값:</span>
                      <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                        {fixture.expected.row_count}행 / {fixture.expected.stored_value}pt
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onExecuteFixture(fixture)}
                    className="hover-lift active-press mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-neutral-900 px-3 py-2 text-xs font-semibold text-white transition-all hover:bg-neutral-800 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-200"
                  >
                    <Play className="h-3 w-3" />
                    <span>이 Fixture 단독 실행</span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
