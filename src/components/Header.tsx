import React from 'react';
import {
  Activity,
  AlertTriangle,
  FileCode2,
  GitCompare,
  ListChecks,
  Moon,
  Radio,
  RefreshCw,
  RotateCcw,
  Send,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import type { ReadingStatus } from '../types/board';

interface HeaderProps {
  status: ReadingStatus | null;
  activeMode: 'live' | 'synthetic';
  onModeChange: (mode: 'live' | 'synthetic') => void;
  onRefreshLive: () => void;
  isRefreshing: boolean;
  onOpenCriteria: () => void;
  onOpenTwoDayCompare: () => void;
  onOpenRawStoreUi: () => void;
  onOpenSecurity: () => void;
  onOpenSubmission: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeMode,
  onModeChange,
  onRefreshLive,
  isRefreshing,
  onOpenCriteria,
  onOpenTwoDayCompare,
  onOpenRawStoreUi,
  onOpenSecurity,
  onOpenSubmission,
  isDark,
  onToggleTheme,
}) => {
  const isFresh = status?.freshness === 'fresh';
  const isStale = status?.freshness === 'stale';

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-neutral-200/70 bg-white/75 shadow-xs backdrop-blur-xl transition-all dark:border-neutral-800/70 dark:bg-neutral-950/75 dark:shadow-neutral-950/40">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between gap-3 px-4 sm:px-6">
        {/* Left: Project Title & Freshness Badge */}
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-neutral-900/90 text-white shadow-xs backdrop-blur-xs dark:bg-neutral-100/90 dark:text-neutral-900">
              <Activity className="h-4 w-4" />
            </div>
            <div className="hidden sm:block">
              <h1 className="flex items-center gap-2 text-sm font-bold tracking-tight text-neutral-900 dark:text-neutral-100">
                SKT-ALEPH 오늘의 진짜 정보판
                <span className="hidden text-xs font-normal text-neutral-500 lg:inline dark:text-neutral-400">
                  데이터가 안 올 때
                </span>
              </h1>
            </div>
          </div>

          {/* Freshness Status Pill with Glassmorphism */}
          <div className="flex items-center transition-all">
            {isFresh && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/70 bg-emerald-50/70 px-2.5 py-1 text-xs font-semibold text-emerald-700 backdrop-blur-md dark:border-emerald-800/60 dark:bg-emerald-950/40 dark:text-emerald-300">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
                </span>
                <span>신선 (Fresh)</span>
              </span>
            )}
            {isStale && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/70 bg-amber-50/70 px-2.5 py-1 text-xs font-semibold text-amber-800 backdrop-blur-md dark:border-amber-700/60 dark:bg-amber-950/50 dark:text-amber-300">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                <span>오래된 값 (Stale: {status.error_code})</span>
              </span>
            )}
            {!status && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200/70 bg-neutral-100/70 px-2.5 py-1 text-xs font-medium text-neutral-600 backdrop-blur-md dark:border-neutral-700/60 dark:bg-neutral-800/50 dark:text-neutral-300">
                <Activity className="h-3.5 w-3.5 text-neutral-400" />
                <span>대기 중</span>
              </span>
            )}
          </div>
        </div>

        {/* Center: Mode Toggle with Glassmorphism */}
        <div className="dark:bg-neutral-850/60 flex items-center rounded-2xl border border-neutral-200/70 bg-neutral-100/60 p-1 text-xs font-medium backdrop-blur-md dark:border-neutral-800/70">
          <button
            type="button"
            onClick={() => onModeChange('live')}
            className={`hover-lift active-press flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
              activeMode === 'live'
                ? 'bg-white/90 font-bold text-neutral-900 shadow-xs backdrop-blur-xs dark:bg-neutral-900/90 dark:text-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <Radio className="h-3.5 w-3.5 text-blue-500" />
            <span>실제 원천</span>
          </button>
          <button
            type="button"
            onClick={() => onModeChange('synthetic')}
            className={`hover-lift active-press flex items-center gap-1.5 rounded-xl px-3 py-1.5 transition-all ${
              activeMode === 'synthetic'
                ? 'bg-white/90 font-bold text-neutral-900 shadow-xs backdrop-blur-xs dark:bg-neutral-900/90 dark:text-neutral-100'
                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 text-purple-500" />
            <span>합성 Fixture</span>
          </button>
        </div>

        {/* Right: Modals & Tool Buttons with Glassmorphism */}
        <div className="flex items-center gap-1.5">
          {activeMode === 'live' && (
            <button
              type="button"
              onClick={onRefreshLive}
              disabled={isRefreshing}
              className="hover-lift active-press inline-flex min-w-[34px] items-center justify-center gap-1.5 rounded-xl bg-neutral-900/90 px-3 py-1.5 text-xs font-semibold text-white shadow-xs backdrop-blur-sm transition-all hover:bg-neutral-800 disabled:opacity-50 md:min-w-[98px] dark:bg-neutral-100/90 dark:text-neutral-900 dark:hover:bg-neutral-200"
              title="실제 공개 원천 동적 조회"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">{isRefreshing ? '불러오는 중...' : '실시간 조회'}</span>
            </button>
          )}

          {/* Raw / Store / UI Modal */}
          <button
            type="button"
            onClick={onOpenRawStoreUi}
            className="hover-lift active-press dark:bg-neutral-850/50 rounded-xl border border-neutral-200/70 bg-white/60 p-2 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
            title="원자료·저장값·화면값 3단 일치 대조 (T04-C10)"
          >
            <FileCode2 className="h-4 w-4" />
          </button>

          {/* 2-Day Compare Modal */}
          <button
            type="button"
            onClick={onOpenTwoDayCompare}
            className="hover-lift active-press dark:bg-neutral-850/50 rounded-xl border border-neutral-200/70 bg-white/60 p-2 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
            title="실제 서로 다른 2일 대조 및 재계산 (T04-C22~C24)"
          >
            <GitCompare className="h-4 w-4" />
          </button>

          {/* Security & Secret Plaintext Audit */}
          <button
            type="button"
            onClick={onOpenSecurity}
            className="hover-lift active-press dark:bg-neutral-850/50 rounded-xl border border-neutral-200/70 bg-white/60 p-2 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
            title="비밀키 0건 & 개인정보 0건 감사 (T04-C11, C25)"
          >
            <ShieldCheck className="h-4 w-4" />
          </button>

          {/* Criteria Checklist */}
          <button
            type="button"
            onClick={onOpenCriteria}
            className="hover-lift active-press dark:bg-neutral-850/50 rounded-xl border border-neutral-200/70 bg-white/60 p-2 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
            title="35개 통과 기준 체크리스트 (T04-C01~C35)"
          >
            <ListChecks className="h-4 w-4" />
          </button>

          {/* Submission Modal */}
          <button
            type="button"
            onClick={onOpenSubmission}
            className="hover-lift active-press dark:bg-neutral-850/50 rounded-xl border border-neutral-200/70 bg-white/60 p-2 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
            title="짧은 확인 방법 4줄 & AI 판단 3줄 (T04-C27, C28)"
          >
            <Send className="h-4 w-4" />
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="hover-lift active-press dark:bg-neutral-850/50 rounded-xl border border-neutral-200/70 bg-white/60 p-2 text-neutral-700 shadow-xs backdrop-blur-md transition-all hover:border-neutral-300 hover:bg-white/90 dark:border-neutral-800/70 dark:text-neutral-300 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/80"
            title="다크/라이트 모드 전환"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
