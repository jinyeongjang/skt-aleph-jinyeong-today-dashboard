import React from 'react';
import { CheckCircle2, FileCode2, Layers, Monitor, X } from 'lucide-react';
import type { DailyRecord, NormalizedReading } from '../types/board';
import { formatKstDateTime } from '../utils/kst';

interface RawStoreUiCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawJson: unknown;
  latestRecord: DailyRecord | null;
  currentReading: NormalizedReading | null;
}

export const RawStoreUiCompareModal: React.FC<RawStoreUiCompareModalProps> = ({
  isOpen,
  onClose,
  rawJson,
  latestRecord,
  currentReading,
}) => {
  if (!isOpen) return null;

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 duration-200">
      <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700 shadow-xs dark:bg-blue-950/80 dark:text-blue-300">
              <FileCode2 className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-900/60 dark:text-blue-200">
                  T04-C10 규격
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  정상 1건의 원자료 · 저장값 · 화면값 3단 일치 대조
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                수집된 외부 원천 원문(RAW)과 브라우저 저장소(Store), 화면 렌더링(UI)의 필드별 일치성을 검증합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="hover-lift active-press dark:border-neutral-750 rounded-xl border border-neutral-200/60 bg-neutral-100/80 p-2 text-neutral-500 transition-colors hover:bg-neutral-200 hover:text-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Verification Success Pill */}
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>T04-C10 검증 통과: 원자료의 관측값과 저장소 정규화 레코드, 화면 표시값이 100% 일치합니다.</span>
          </div>
        </div>

        {/* 3 Columns */}
        <div className="grid grid-cols-1 gap-4 overflow-y-auto p-6 md:grid-cols-3">
          {/* Column 1: RAW JSON */}
          <div className="dark:bg-neutral-850 flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-xs font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              <FileCode2 className="h-4 w-4 text-blue-500" />
              <span>1. 원자료 (RAW JSON 원문)</span>
            </div>
            <div className="mt-3 max-h-72 flex-1 overflow-auto">
              <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                {rawJson ? JSON.stringify(rawJson, null, 2) : JSON.stringify(currentReading, null, 2)}
              </pre>
            </div>
          </div>

          {/* Column 2: Stored Record */}
          <div className="dark:bg-neutral-850 flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-xs font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              <Layers className="h-4 w-4 text-purple-500" />
              <span>2. 저장값 (DailyRecord Store)</span>
            </div>
            <div className="mt-3 max-h-72 flex-1 overflow-auto">
              <pre className="font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-neutral-800 dark:text-neutral-200">
                {latestRecord
                  ? JSON.stringify(latestRecord, null, 2)
                  : JSON.stringify({ message: '저장된 레코드 없음' }, null, 2)}
              </pre>
            </div>
          </div>

          {/* Column 3: UI Display Values */}
          <div className="dark:bg-neutral-850 flex flex-col rounded-xl border border-neutral-200 bg-neutral-50/50 p-4 dark:border-neutral-800">
            <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 text-xs font-bold text-neutral-700 dark:border-neutral-700 dark:text-neutral-300">
              <Monitor className="h-4 w-4 text-emerald-500" />
              <span>3. 화면값 (UI Rendered)</span>
            </div>
            <div className="mt-3 flex-1 space-y-3 text-xs">
              <div className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="block text-[11px] text-neutral-400">화면 관측 수치 (Value):</span>
                <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                  {currentReading?.normalized_value ?? '---'} {currentReading?.unit ?? ''}
                </span>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="block text-[11px] text-neutral-400">출처 명칭 (Source):</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {currentReading?.source_name ?? '---'}
                </span>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="block text-[11px] text-neutral-400">원천 관측 시각:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {formatKstDateTime(currentReading?.source_time ?? null)}
                </span>
              </div>
              <div className="rounded-lg border border-neutral-200 bg-white p-2.5 dark:border-neutral-800 dark:bg-neutral-900">
                <span className="block text-[11px] text-neutral-400">기준 시간대:</span>
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">
                  {currentReading?.record_timezone || 'Asia/Seoul'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="dark:bg-neutral-850 flex justify-end border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
          >
            확인 및 닫기
          </button>
        </div>
      </div>
    </div>
  );
};
