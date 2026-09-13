import React, { useEffect, useRef, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Globe2,
  Minus,
  RefreshCw,
  RotateCcw,
  Scale,
  ShieldAlert,
  Thermometer,
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
  onRefreshLive?: () => void;
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
  onRefreshLive,
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

  // 로딩 완료 후 방금 갱신됨 피드백을 표시하기 위한 상태
  const [justUpdated, setJustUpdated] = useState(false);
  const prevRefreshingRef = useRef(isRefreshing);

  useEffect(() => {
    if (prevRefreshingRef.current && !isRefreshing && status?.freshness === 'fresh') {
      setJustUpdated(true);
      const timer = setTimeout(() => setJustUpdated(false), 2600);
      return () => clearTimeout(timer);
    }
    prevRefreshingRef.current = isRefreshing;
  }, [isRefreshing, status?.freshness]);

  // 키보드 단축키 [R]로 기온 실시간 새로고침 지원
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if ((e.key === 'r' || e.key === 'R') && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        if (activeMode === 'live' && onRefreshLive && !isRefreshing) {
          onRefreshLive();
        } else if (activeMode === 'synthetic' && !isRefreshing) {
          onRetry();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeMode, onRefreshLive, onRetry, isRefreshing]);

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

      {/* Main Glass Card Wrapper with Animated Border Glow */}
      <div className="relative overflow-hidden rounded-3xl p-[1.5px] shadow-2xl shadow-blue-500/10 transition-all dark:shadow-blue-950/30">
        {/* Animated Border Light Beam (Rotating Conic Gradient) */}
        <div className="animate-border-beam pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-square w-[350%] transform-gpu bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_60deg,rgba(59,130,246,0.15)_80deg,rgba(96,165,250,0.85)_98deg,#ffffff_105deg,rgba(96,165,250,0.85)_112deg,rgba(59,130,246,0.15)_130deg,transparent_150deg,transparent_360deg)] opacity-90 dark:opacity-100" />

        {/* Soft Glowing Bloom behind border for radiant light emission */}
        <div className="animate-border-beam pointer-events-none absolute top-1/2 left-1/2 z-0 aspect-square w-[350%] transform-gpu bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0deg,transparent_75deg,rgba(59,130,246,0.4)_95deg,rgba(147,197,253,0.9)_105deg,rgba(59,130,246,0.4)_115deg,transparent_135deg,transparent_360deg)] opacity-70 blur-xs" />

        {/* Static Subtle Border Underlay so border is always visible */}
        <div className="pointer-events-none absolute inset-0 z-0 rounded-3xl border border-blue-200/60 dark:border-blue-500/25" />

        {/* Main Inner Glass Card Container with Blue Gradient & Light Sweep */}
        <div className="relative z-10 overflow-hidden rounded-[calc(1.5rem-1.5px)] bg-linear-to-br from-blue-500/10 via-white/85 to-indigo-500/10 p-6 backdrop-blur-2xl transition-all sm:p-9 dark:from-blue-950/40 dark:via-neutral-900/85 dark:to-indigo-950/40">
          {/* Top Edge Real-time Loading Stream Progress Bar */}
          {isRefreshing && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-1 overflow-hidden bg-blue-100/60 dark:bg-blue-950/60">
              <div className="animate-loading-progress h-full w-2/5 rounded-full bg-linear-to-r from-sky-400 via-blue-500 to-indigo-500 shadow-sm" />
            </div>
          )}

          {/* Subtle Ambient Blue Radial Glow Background */}
          <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl dark:bg-blue-600/15" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl dark:bg-indigo-600/15" />

          {/* 빛이 지나가는 표면 광원 효과 (Surface Light Sweep Ray) */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[calc(1.5rem-1.5px)]">
            <div className="animate-light-sweep absolute -inset-y-16 -left-1/3 w-1/3 transform-gpu bg-linear-to-r from-transparent via-white/40 to-transparent blur-md dark:via-sky-300/15" />
          </div>

          {/* Inner Content Layer */}
          <div className="relative z-10">
            {/* Card Header: Mode & Source Selector & Quick Interactive Refresh Button */}
            <div className="flex flex-col justify-between gap-4 border-b border-blue-100/80 pb-6 sm:flex-row sm:items-center dark:border-neutral-800/80">
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

              {/* Header Right: Source Selector & Interactive Fetch Button */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Live Mode Source Selector */}
                {activeMode === 'live' && (
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="source-select"
                      className="text-xs font-medium text-neutral-500 dark:text-neutral-400"
                    >
                      공개 원천:
                    </label>
                    <select
                      id="source-select"
                      value={selectedSourceId}
                      onChange={(e) => onSelectSource(e.target.value)}
                      disabled={isRefreshing}
                      className="rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 py-1.5 text-xs font-medium text-neutral-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden disabled:opacity-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200"
                    >
                      <option value="seoul-weather-temp">Open-Meteo 서울 실시간 기온 (°C)</option>
                      <option value="usd-krw-exchange">Frankfurter USD/KRW 실시간 환율 (KRW)</option>
                    </select>
                  </div>
                )}

                {/* Quick Refresh Interactive Action Button (너비 고정으로 레이아웃 밀림 방지) */}
                <button
                  type="button"
                  onClick={activeMode === 'live' ? onRefreshLive : onRetry}
                  disabled={isRefreshing}
                  className="hover-lift active-press inline-flex min-w-34 items-center justify-center gap-1.5 rounded-xl border border-blue-200/80 bg-white/85 px-3 py-1.5 text-xs font-semibold text-blue-700 shadow-xs backdrop-blur-md transition-all hover:border-blue-300 hover:bg-blue-50/80 disabled:opacity-50 dark:border-blue-800/80 dark:bg-neutral-800/85 dark:text-blue-300 dark:hover:bg-neutral-800"
                  title="기온 실시간 다시 불러오기 (단축키: R)"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''}`}
                  />
                  <span>
                    {isRefreshing
                      ? selectedSourceId === 'usd-krw-exchange'
                        ? '환율 불러오는 중...'
                        : '기온 불러오는 중...'
                      : '기온 불러오기'}
                  </span>
                  <kbd className="hidden rounded bg-neutral-200/70 px-1 py-0.5 font-mono text-[10px] text-neutral-600 sm:inline-block dark:bg-neutral-700/70 dark:text-neutral-300">
                    R
                  </kbd>
                </button>
              </div>
            </div>

            {/* Big Value Display & Delta Comparison */}
            <div className="flex flex-col justify-between gap-6 border-b border-blue-100/80 py-8 md:flex-row md:items-end dark:border-neutral-800/80">
              <div
                onClick={activeMode === 'live' && onRefreshLive && !isRefreshing ? onRefreshLive : undefined}
                className={`group relative -m-2.5 rounded-2xl p-2.5 transition-all ${
                  activeMode === 'live' && !isRefreshing
                    ? 'cursor-pointer hover:bg-white/40 dark:hover:bg-neutral-800/40'
                    : ''
                }`}
                title={activeMode === 'live' ? '클릭하여 실시간 기온 갱신 (단축키: R)' : undefined}
                role={activeMode === 'live' ? 'button' : undefined}
                tabIndex={activeMode === 'live' ? 0 : undefined}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (activeMode === 'live' && onRefreshLive && !isRefreshing) onRefreshLive();
                  }
                }}
              >
                {/* Status Badges Row (최소 높이 고정으로 수치 밀림 방지) */}
                <div className="mb-2.5 flex min-h-7.5 flex-wrap items-center gap-2">
                  <span className="text-xs font-medium tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
                    현재 관측값 (Normalized Reading)
                  </span>

                  {isRefreshing && (
                    <span className="animate-blur-in inline-flex items-center gap-2 rounded-full border border-blue-300/80 bg-blue-50/80 px-3 py-1 text-xs font-bold text-blue-700 backdrop-blur-md dark:border-blue-700/80 dark:bg-blue-950/60 dark:text-blue-300">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                      </span>
                      <span>
                        {selectedSourceId === 'usd-krw-exchange' ? '환율을 불러오는 중...' : '기온을 불러오는 중...'}
                      </span>
                    </span>
                  )}

                  {!isRefreshing && justUpdated && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-300/80 bg-emerald-50/80 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 shadow-xs backdrop-blur-md dark:border-emerald-700/80 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>최신 관측치 동기화 완료!</span>
                    </span>
                  )}

                  {isStale && !isRefreshing && (
                    <span className="rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:border-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
                      마지막 정상값 보존 중
                    </span>
                  )}
                </div>

                {/* Big Temperature / Reading Number Container with Icon and Pulse Ring */}
                <div className="relative flex items-center gap-4">
                  {/* Interactive Thermometer / Measurement Sensor Icon Container */}
                  <div
                    className={`relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/80 bg-white/70 shadow-sm backdrop-blur-md transition-all duration-300 sm:h-16 sm:w-16 dark:border-white/10 dark:bg-neutral-800/70 ${
                      isRefreshing
                        ? 'border-blue-300 bg-blue-50/90 text-blue-600 shadow-blue-400/30 dark:border-blue-600 dark:bg-blue-950/60 dark:text-blue-300'
                        : 'text-neutral-700 dark:text-neutral-200'
                    }`}
                  >
                    {isRefreshing && (
                      <span className="animate-radar-pulse pointer-events-none absolute inset-0 rounded-2xl bg-blue-400/30 dark:bg-blue-500/20" />
                    )}
                    {currentReading?.unit === '°C' ? (
                      <Thermometer
                        className={`h-7 w-7 transition-opacity sm:h-8 sm:w-8 ${
                          isRefreshing ? 'animate-thermometer-bob text-blue-600 dark:text-blue-400' : ''
                        }`}
                      />
                    ) : (
                      <Scale
                        className={`h-7 w-7 transition-transform sm:h-8 sm:w-8 ${
                          isRefreshing ? 'animate-spin text-blue-600 dark:text-blue-400' : ''
                        }`}
                      />
                    )}
                  </div>

                  {/* Value and Unit Display with Blur Loading Transition (화면 흔들림 0px) */}
                  <div className="relative flex items-center">
                    {/* 숫자와 단위 표시: 위치 이동이나 스케일 없이 오직 blur와 opacity만 처리 */}
                    <div
                      className={`flex items-baseline gap-3 transition-all duration-300 ${
                        isRefreshing ? 'pointer-events-none opacity-25 blur-[5px] select-none' : 'blur-0 opacity-100'
                      }`}
                    >
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

                    {/* 기온을 불러오는 중... Blur-in 글래스모피즘 와이드 인터랙티브 오버레이 (화면 밀림 0) */}
                    {isRefreshing && (
                      <div className="animate-blur-in pointer-events-none absolute left-0 z-20 flex items-center">
                        <div className="flex w-max items-center gap-3.5 rounded-2xl border border-blue-300/90 bg-white/95 px-6 py-3 shadow-xl shadow-blue-500/20 backdrop-blur-2xl sm:gap-4 sm:rounded-3xl sm:px-8 sm:py-3.5 dark:border-blue-600/80 dark:bg-neutral-900/95 dark:shadow-blue-950/40">
                          <span className="relative flex h-3.5 w-3.5 shrink-0">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-blue-500"></span>
                          </span>
                          <span className="text-base font-black tracking-tight text-blue-700 sm:text-lg dark:text-blue-300">
                            {selectedSourceId === 'usd-krw-exchange'
                              ? '환율을 불러오는 중...'
                              : '기온을 불러오는 중...'}
                          </span>
                          <RefreshCw className="h-4 w-4 shrink-0 animate-spin text-blue-500 dark:text-blue-400" />
                        </div>
                      </div>
                    )}

                    {/* Interactive Click Hint on Hover */}
                    {activeMode === 'live' && !isRefreshing && (
                      <span className="ml-3 hidden text-xs text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 sm:inline-block dark:text-neutral-500">
                        (클릭하여 새로고침)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 우측 델타 영역: shrink-0 추가로 좌측 오버레이에 의해 절대 밀리지 않음 */}
              <div className="flex shrink-0 flex-col items-start gap-2 md:items-end">
                <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                  어제 대비 변화 (Day-over-Day Delta)
                </span>
                {renderDelta()}
              </div>
            </div>

            {/* 6 Essential Metadata Grid (T04-C04 ~ T04-C09) */}
            <div className="grid grid-cols-1 gap-4 pt-8 text-xs sm:grid-cols-2 lg:grid-cols-3">
              {/* 1. Value & Unit */}
              <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10">
                <div
                  className={`shrink-0 rounded-xl p-2 transition-all ${
                    isRefreshing
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
                      : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                  }`}
                >
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
              <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10">
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
              <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10">
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
              <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10">
                <div
                  className={`shrink-0 rounded-xl p-2 transition-all ${
                    isRefreshing
                      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/60 dark:text-blue-400'
                      : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400'
                  }`}
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
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
              <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10">
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
              <div className="hover-lift dark:bg-neutral-850/60 flex items-start gap-3.5 rounded-2xl border border-white/80 bg-white/70 p-4 shadow-xs backdrop-blur-md dark:border-white/10">
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
        </div>
      </div>
    </section>
  );
};
