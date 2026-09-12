import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Clock,
  ExternalLink,
  Globe2,
  Minus,
  RefreshCw,
  RotateCcw,
  Scale,
  ShieldAlert,
  WifiOff,
} from 'lucide-react';
import type { ComparisonResult, NormalizedReading, ReadingStatus } from '../types/board';
import { formatKstDateTime } from '../utils/kst';
import NumberFlow from '@number-flow/react';

interface MainBoardProps {
  currentReading: NormalizedReading | null;
  status: ReadingStatus | null;
  comparison: ComparisonResult;
  lastDelta: number | null;
  onRetry: () => void;
  isRefreshing: boolean;
  activeMode: 'live' | 'synthetic';
  selectedSourceId: string;
  onSelectSource: (sourceId: string) => void;
}

export const MainBoard: React.FC<MainBoardProps> = ({
  currentReading,
  status,
  comparison,
  lastDelta,
  onRetry,
  isRefreshing,
  activeMode,
  selectedSourceId,
  onSelectSource,
}) => {
  const isStale = status?.freshness === 'stale';
  const errorCode = status?.error_code || 'none';

  const targetValue = currentReading?.normalized_value ?? 0;
  const targetDelta = lastDelta !== null ? Math.abs(lastDelta) : 0;

  // 페이지 진입 즉시 0에서 목표값으로 NumberFlow 애니메이션이 발동하도록 상태 관리
  const [animatedValue, setAnimatedValue] = useState<number>(0);
  const [animatedDelta, setAnimatedDelta] = useState<number>(0);

  useEffect(() => {
    // 마운트 및 값 갱신 시 다음 애니메이션 프레임에서 목표값으로 부드럽게 전이
    const frameId = requestAnimationFrame(() => {
      setAnimatedValue(targetValue);
      setAnimatedDelta(targetDelta);
    });
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, targetDelta]);

  // 어제 대비 변화값 텍스트 및 스타일 계산
  const renderDelta = () => {
    if (comparison.state === 'insufficient') {
      return (
        <div className="flex items-center gap-1.5 rounded-md bg-neutral-100 px-2.5 py-1 text-xs text-neutral-500 dark:bg-neutral-800/80 dark:text-neutral-400">
          <Minus className="h-3.5 w-3.5" />
          <span>전일 기록 없음 (첫째 날 관측)</span>
        </div>
      );
    }
    if (comparison.state === 'unit_mismatch') {
      return (
        <div className="flex items-center gap-1.5 rounded-md bg-amber-50 px-2.5 py-1 text-xs text-amber-600 dark:bg-amber-950/40 dark:text-amber-400">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span>단위 불일치로 전일 대비 계산 불가</span>
        </div>
      );
    }

    if (comparison.direction === 'increase') {
      return (
        <div className="flex items-center gap-1.5 rounded-md border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600 shadow-xs dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-400">
          <ArrowUpRight className="h-4 w-4 text-rose-500" />
          <span className="inline-flex items-center gap-0.5">
            어제 대비 +
            <NumberFlow
              value={animatedDelta}
              trend={1}
              spinTiming={{ duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />{' '}
            {comparison.unit} 증가
          </span>
        </div>
      );
    }
    if (comparison.direction === 'decrease') {
      return (
        <div className="flex items-center gap-1.5 rounded-md border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 shadow-xs dark:border-blue-900 dark:bg-blue-950/50 dark:text-blue-400">
          <ArrowDownRight className="h-4 w-4 text-blue-500" />
          <span className="inline-flex items-center gap-0.5">
            어제 대비 -
            <NumberFlow
              value={animatedDelta}
              trend={-1}
              spinTiming={{ duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
            />{' '}
            {comparison.unit} 감소
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center gap-1.5 rounded-md border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-600 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-400">
        <Minus className="h-4 w-4 text-neutral-400" />
        <span>어제와 동일 (변동 0.0 {comparison.unit})</span>
      </div>
    );
  };

  // 오류 설명 안내 메시지
  const renderErrorGuide = () => {
    if (!isStale) return null;

    let icon = <AlertCircle className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />;
    let title = '오래된 값 (Stale)';
    let detail = '데이터 갱신 중 문제가 발생하여 직전 정상값을 유지하고 있습니다.';

    if (errorCode === 'timeout') {
      icon = <Clock className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />;
      title = '외부 응답 지연 (Timeout: 1500ms 초과)';
      detail =
        '외부 원천 서버의 응답이 제한시간 내에 도착하지 못했습니다. 사용자의 마지막 정상값 105는 안전하게 보존되었습니다.';
    } else if (errorCode === 'auth') {
      icon = <ShieldAlert className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />;
      title = '외부 원천 401/403 거절 (Auth Rejected)';
      detail =
        '외부 데이터 제공처에서 인증을 거절했습니다. ※ 참고: 본 웹 제품의 로그인이 아니며, 외부 API 공급자의 인증 거절 상태입니다.';
    } else if (errorCode === 'rate_limit') {
      icon = <Scale className="h-5 w-5 shrink-0 text-amber-600 dark:text-amber-400" />;
      title = '외부 원천 호출 한도 초과 (Rate Limited: 429)';
      detail =
        '외부 제공처의 요청 한도가 소진되었습니다. 관측된 Retry-After 헤더(60초) 규격에 따라 재시도할 수 있습니다.';
    } else if (errorCode === 'offline') {
      icon = <WifiOff className="h-5 w-5 shrink-0 text-red-600 dark:text-red-400" />;
      title = '오프라인 상태 (Offline)';
      detail =
        '네트워크 연결이 끊겨 신규 값을 수집할 수 없습니다. 오프라인 중에도 이전 정상값이 안전하게 화면에 보존됩니다.';
    } else if (errorCode === 'schema_error') {
      icon = <AlertTriangle className="h-5 w-5 shrink-0 text-rose-600 dark:text-rose-400" />;
      title = '외부 응답 형식 변경 (Schema Break)';
      detail =
        '외부 원천의 응답 데이터 타입이 기대값(숫자)과 일치하지 않아 파싱을 안전하게 중단하고 기존 정상값을 보존했습니다.';
    }

    return (
      <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm transition-all dark:border-amber-800 dark:bg-amber-950/50">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3.5">
            <div className="shrink-0 rounded-xl bg-amber-100 p-2 text-amber-800 dark:bg-amber-900/60 dark:text-amber-200">
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-amber-200/90 px-2 py-0.5 text-[11px] font-bold tracking-wider text-amber-950 uppercase dark:bg-amber-900/90 dark:text-amber-200">
                  {errorCode}
                </span>
                <h3 className="text-sm font-bold text-neutral-900 dark:text-neutral-100">{title}</h3>
              </div>
              <p className="mt-1 text-xs leading-relaxed text-neutral-700 dark:text-neutral-300">{detail}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onRetry}
              disabled={isRefreshing}
              className="hover-lift active-press inline-flex items-center gap-1.5 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>다시 시도</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section id="board" className="mb-10 scroll-mt-24">
      {/* Top Banner for Failure (if stale) */}
      {renderErrorGuide()}

      {/* Main Glass Card Container */}
      <div className="glass-panel glass-glow rounded-3xl p-6 shadow-md transition-all sm:p-9">
        {/* Card Header: Mode & Source Selector */}
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950/60 dark:text-blue-300">
                {activeMode === 'live' ? '실제 비개인 공개 원천' : 'ALEPH 결정론적 합성 Fixture'}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                기준 시간대: {currentReading?.record_timezone || 'Asia/Seoul'}
              </span>
            </div>
            <h2 className="mt-1.5 text-xl font-black tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
              {currentReading?.source_name || '실시간 정보판 관측소'}
            </h2>
          </div>

          {/* Live Mode Source Selector */}
          {activeMode === 'live' && (
            <div className="flex items-center gap-2">
              <label htmlFor="source-select" className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                공개 원천:
              </label>
              <select
                id="source-select"
                value={selectedSourceId}
                onChange={(e) => onSelectSource(e.target.value)}
                className="rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
              >
                <option value="seoul-weather-temp">Open-Meteo 서울 실시간 기온 (°C)</option>
                <option value="usd-krw-exchange">Frankfurter USD/KRW 실시간 환율 (KRW)</option>
              </select>
            </div>
          )}
        </div>

        {/* Big Value Display & Delta Comparison */}
        <div className="flex flex-col justify-between gap-6 border-b border-neutral-100 py-8 md:flex-row md:items-end dark:border-neutral-800">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                현재 관측값 (Normalized Reading)
              </span>
              {isStale && (
                <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                  마지막 정상값 보존 중
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-black tracking-tight text-neutral-900 tabular-nums sm:text-6xl md:text-7xl dark:text-white">
                {currentReading !== null ? (
                  <NumberFlow
                    value={animatedValue}
                    trend={1}
                    spinTiming={{ duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                ) : (
                  '---'
                )}
              </span>
              <span className="text-xl font-bold text-neutral-500 sm:text-2xl dark:text-neutral-400">
                {currentReading?.unit || ''}
              </span>
            </div>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
              어제 대비 변화 (Day-over-Day Delta)
            </span>
            {renderDelta()}
          </div>
        </div>

        {/* 6 Essential Metadata Grid (T04-C04 ~ T04-C09) */}
        <div className="grid grid-cols-1 gap-4 pt-8 text-xs sm:grid-cols-2 lg:grid-cols-3">
          {/* 1. Value & Unit */}
          <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 shadow-xs dark:border-neutral-800">
            <div className="shrink-0 rounded-xl bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400">
              <Scale className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                값 및 측정 단위 (T04-C04, C05)
              </span>
              <span className="mt-1 block text-base font-bold text-neutral-900 dark:text-neutral-100">
                {currentReading !== null ? (
                  <NumberFlow
                    value={animatedValue}
                    trend={1}
                    spinTiming={{ duration: 700, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }}
                  />
                ) : (
                  '---'
                )}{' '}
                {currentReading?.unit ?? ''}
              </span>
            </div>
          </div>

          {/* 2. Source Name & URL */}
          <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 shadow-xs dark:border-neutral-800">
            <div className="shrink-0 rounded-xl bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <ExternalLink className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <span className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                출처 및 HTTPS URL (T04-C06)
              </span>
              {currentReading?.source_url ? (
                <a
                  href={currentReading.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 block truncate text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                  title={currentReading.source_url}
                >
                  {currentReading.source_name}
                </a>
              ) : (
                <span className="mt-1 block text-xs font-semibold text-neutral-400">---</span>
              )}
            </div>
          </div>

          {/* 3. Source Time (원천 관측 시각) */}
          <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 shadow-xs dark:border-neutral-800">
            <div className="shrink-0 rounded-xl bg-amber-50 p-2 text-amber-600 dark:bg-amber-950/60 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                출처 관측 시각 (T04-C07)
              </span>
              <span className="mt-1 block text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {formatKstDateTime(currentReading?.source_time ?? null)}
              </span>
            </div>
          </div>

          {/* 4. Fetched At (수집 시각) */}
          <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 shadow-xs dark:border-neutral-800">
            <div className="shrink-0 rounded-xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <RefreshCw className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                조회/수집 시각 (T04-C08)
              </span>
              <span className="mt-1 block text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {currentReading ? formatKstDateTime(currentReading.fetched_at) : '---'}
              </span>
            </div>
          </div>

          {/* 5. Timezone */}
          <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 shadow-xs dark:border-neutral-800">
            <div className="shrink-0 rounded-xl bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/60 dark:text-teal-400">
              <Globe2 className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                기준 시간대 (T04-C09)
              </span>
              <span className="mt-1 block text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                {currentReading?.record_timezone || 'Asia/Seoul'} (KST, UTC+9)
              </span>
            </div>
          </div>

          {/* 6. Record Date (Derived Asia/Seoul Date) */}
          <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 shadow-xs dark:border-neutral-800">
            <div className="shrink-0 rounded-xl bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Calendar className="h-4 w-4" />
            </div>
            <div>
              <span className="block text-[11px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                일별 고유 키 날짜 (record_date)
              </span>
              <span className="mt-1 block text-xs font-bold text-neutral-900 dark:text-neutral-100">
                {currentReading?.record_date || '---'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
