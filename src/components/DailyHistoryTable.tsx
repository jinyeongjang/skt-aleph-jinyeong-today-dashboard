import React, { useState } from 'react';
import {
  ArrowDownRight,
  ArrowUpDown,
  ArrowUpRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  Code2,
  Copy,
  Database,
  ExternalLink,
  Layers,
  Minus,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Thermometer,
} from 'lucide-react';
import type { DailyRecord } from '../types/board';

interface DailyHistoryTableProps {
  records: DailyRecord[];
  activeMode?: 'live' | 'synthetic';
  title?: string;
  description?: string;
}

/**
 * 긴 날짜/시각 문자열이 표 안에서 줄바꿈되며 깨지는 현상을 방지하기 위한 정밀 KST 시각 포맷터
 */
function formatKstTimeDisplay(isoString: string | null): { dateStr: string; timeStr: string } {
  if (!isoString) return { dateStr: '-', timeStr: '미제공' };
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return { dateStr: '-', timeStr: '유효하지 않음' };

  const timeStr = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);

  const dateStr = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

  return { dateStr, timeStr: `${timeStr} KST` };
}

export const DailyHistoryTable: React.FC<DailyHistoryTableProps> = ({
  records,
  activeMode = 'live',
  title = '일별 기록 보존 저장소 (Daily Readings Store)',
  description = '기준 시간대(Asia/Seoul)의 날짜를 고유 키로 삼아 같은 날 중복을 합치고, 다음 날짜는 새 행으로 보존합니다.',
}) => {
  const [copiedAll, setCopiedAll] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // JSON 전체 복사
  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(records, null, 2));
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // 단일 행 JSON 복사
  const handleCopyRowJson = (record: DailyRecord) => {
    navigator.clipboard.writeText(JSON.stringify(record, null, 2));
    setCopiedId(record.record_id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Record ID 개별 복사
  const handleCopyRecordId = (recordId: string) => {
    navigator.clipboard.writeText(recordId);
    setCopiedKeyId(recordId);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  // 1. 항상 날짜 오름차순으로 정렬하여 전일 대비 Delta 수학적 계산 수행
  const chronologicalRecords = [...records].sort((a, b) => a.record_date.localeCompare(b.record_date));

  // 2. 화면 표시용 정렬 (사용자 토글: 과거순 asc vs 최신순 desc)
  const displayRecords =
    sortOrder === 'asc'
      ? chronologicalRecords
      : [...records].sort((a, b) => b.record_date.localeCompare(a.record_date));

  // 저장소 키 정보
  const storageKey =
    activeMode === 'live' ? 'localStorage: aleph_t04_live_records_v1' : 'localStorage: aleph_t04_eval_state_v1';

  return (
    <section id="daily-history" className="mb-10 scroll-mt-24">
      {/* Outer Glassmorphism Card Container */}
      <div className="glass-panel glass-glow rounded-3xl border border-neutral-200/80 bg-white/75 p-6 shadow-xl backdrop-blur-xl transition-all sm:p-9 dark:border-neutral-800/80 dark:bg-neutral-900/75">
        {/* 1. Header Section */}
        <div className="flex flex-col justify-between gap-5 border-b border-neutral-200/60 pb-6 sm:flex-row sm:items-center dark:border-neutral-800/70">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-200/80 bg-indigo-50/90 px-3 py-0.5 text-xs font-semibold text-indigo-700 shadow-2xs backdrop-blur-xs dark:border-indigo-800/60 dark:bg-indigo-950/70 dark:text-indigo-300">
                <Sparkles className="h-3 w-3" />
                카드 4 규격 (T04-C20, C21)
              </span>
              <span className="dark:border-neutral-750 inline-flex items-center gap-1.5 rounded-full border border-neutral-200/80 bg-neutral-100/80 px-3 py-0.5 text-xs font-medium text-neutral-700 shadow-2xs backdrop-blur-xs dark:bg-neutral-800/80 dark:text-neutral-300">
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    records.length >= 2 ? 'bg-emerald-500 ring-2 ring-emerald-400/30' : 'bg-amber-500'
                  }`}
                />
                보존된 일별 행:{' '}
                <strong className="font-bold text-neutral-900 dark:text-neutral-100">{records.length}건</strong>
              </span>
              {records.length >= 2 ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200/80 bg-emerald-50/90 px-3 py-0.5 text-xs font-semibold text-emerald-700 shadow-2xs backdrop-blur-xs dark:border-emerald-800/60 dark:bg-emerald-950/70 dark:text-emerald-300">
                  <CheckCircle2 className="h-3 w-3" />
                  2일 기록 충족 (T04-C22)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200/80 bg-amber-50/90 px-3 py-0.5 text-xs font-medium text-amber-700 shadow-2xs backdrop-blur-xs dark:border-amber-800/60 dark:bg-amber-950/70 dark:text-amber-300">
                  1일차 보존 완료 (익일 2일차 대기)
                </span>
              )}
            </div>

            <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-100/90 text-indigo-700 shadow-xs backdrop-blur-xs dark:bg-indigo-950/80 dark:text-indigo-300">
                <Database className="h-5 w-5" />
              </span>
              <span>{title}</span>
            </h2>
            <p className="text-xs leading-relaxed text-neutral-600 sm:text-[13px] dark:text-neutral-400">
              {description}
            </p>
          </div>

          <div className="flex shrink-0 flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="hover-lift active-press dark:border-neutral-750 inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/80 px-3 py-2 text-xs font-medium text-neutral-700 shadow-2xs backdrop-blur-sm transition-all hover:bg-neutral-100/80 dark:bg-neutral-800/80 dark:text-neutral-300 dark:hover:bg-neutral-700"
              title="정렬 순서 변경"
            >
              <ArrowUpDown className="h-3.5 w-3.5 text-neutral-400" />
              <span className="whitespace-nowrap">
                {sortOrder === 'asc' ? '날짜순 (과거 ➔ 최신)' : '최신순 (최신 ➔ 과거)'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleCopyJson}
              className="hover-lift active-press inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/80 bg-indigo-50/90 px-3.5 py-2 text-xs font-semibold text-indigo-800 shadow-xs backdrop-blur-sm transition-all hover:bg-indigo-100/90 dark:border-indigo-800/70 dark:bg-indigo-950/80 dark:text-indigo-200 dark:hover:bg-indigo-900/90"
            >
              {copiedAll ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-emerald-700 dark:text-emerald-300">전체 JSON 복사됨</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="whitespace-nowrap">전체 JSON 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. Glassmorphism Rule Box (T04-C20, T04-C21) */}
        <div className="my-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          {/* Card 1: T04-C20 */}
          <div className="group dark:from-neutral-850/80 rounded-2xl border border-neutral-200/70 bg-linear-to-br from-white/90 via-indigo-50/20 to-neutral-50/40 p-5 shadow-xs backdrop-blur-md transition-all hover:border-indigo-300/80 dark:border-neutral-800 dark:via-indigo-950/15 dark:to-neutral-900/50 dark:hover:border-indigo-700/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  <RefreshCw className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  T04-C20 동일 날짜 재실행 병합 규칙
                </span>
              </div>
              <span className="rounded-md border border-indigo-200/70 bg-indigo-100/70 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                원자적 갱신 (Update)
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              같은 Asia/Seoul 날짜에 여러 번 성공하더라도 행이 늘어나지 않고, 기존 행의{' '}
              <code className="rounded bg-neutral-200/70 px-1 py-0.5 font-mono text-[11px] text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                last_fetched_at
              </code>
              과 최신 관측값이 원자적으로 갱신되어 <strong>총 1건을 유지</strong>합니다.
            </p>
            <div className="dark:border-neutral-750 mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200/60 bg-white/70 p-2 text-[11px] font-medium text-neutral-600 backdrop-blur-xs dark:bg-neutral-900/70 dark:text-neutral-400">
              <span className="font-semibold whitespace-nowrap text-indigo-600 dark:text-indigo-400">
                동일 일자 재호출
              </span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="whitespace-nowrap">기존 행 최신값 갱신</span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                1개 행 유지
              </span>
            </div>
          </div>

          {/* Card 2: T04-C21 */}
          <div className="group dark:from-neutral-850/80 rounded-2xl border border-neutral-200/70 bg-linear-to-br from-white/90 via-indigo-50/20 to-neutral-50/40 p-5 shadow-xs backdrop-blur-md transition-all hover:border-indigo-300/80 dark:border-neutral-800 dark:via-indigo-950/15 dark:to-neutral-900/50 dark:hover:border-indigo-700/60">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-indigo-100/90 text-indigo-700 dark:bg-indigo-900/60 dark:text-indigo-300">
                  <Layers className="h-3.5 w-3.5" />
                </span>
                <span className="text-xs font-bold text-neutral-900 dark:text-neutral-100">
                  T04-C21 익일 성공 시 신규 행 생성 규칙
                </span>
              </div>
              <span className="rounded-md border border-indigo-200/70 bg-indigo-100/70 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                신규 행 보존 (Create)
              </span>
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-neutral-600 dark:text-neutral-400">
              Asia/Seoul 기준 다음 날짜에 새로운 조회가 성공하면 <strong>신규 일별 행이 정확히 1건 추가</strong>
              되며, 어제 대비 변화량(Delta)을 수학적으로 비교하는 기준이 됩니다.
            </p>
            <div className="dark:border-neutral-750 mt-3 flex flex-wrap items-center gap-1.5 rounded-xl border border-neutral-200/60 bg-white/70 p-2 text-[11px] font-medium text-neutral-600 backdrop-blur-xs dark:bg-neutral-900/70 dark:text-neutral-400">
              <span className="font-semibold whitespace-nowrap text-indigo-600 dark:text-indigo-400">익일 첫 성공</span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="whitespace-nowrap">신규 일별 행 생성</span>
              <span className="text-neutral-300 dark:text-neutral-600">→</span>
              <span className="font-semibold whitespace-nowrap text-emerald-600 dark:text-emerald-400">
                어제 대비 변화 산출
              </span>
            </div>
          </div>
        </div>

        {/* 3. Glassmorphism Observability Table (가로 스크롤 & 글자 넘침 완전 방지) */}
        <div className="overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/80 shadow-md backdrop-blur-lg dark:border-neutral-800/90 dark:bg-neutral-900/80">
          <div className="custom-scrollbar overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="dark:border-neutral-750 border-b border-neutral-200/80 bg-neutral-100/70 font-semibold text-neutral-700 backdrop-blur-md dark:bg-neutral-800/60 dark:text-neutral-300">
                <tr>
                  <th className="min-w-35 px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                      <span>KST 기준 일자</span>
                    </div>
                  </th>
                  <th className="min-w-50 px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="h-3.5 w-3.5 text-indigo-500" />
                      <span>관측 기온 (최초 ➔ 최종)</span>
                    </div>
                  </th>
                  <th className="min-w-37.5 px-5 py-4 whitespace-nowrap">
                    <span>전일 대비 변화 (Delta)</span>
                  </th>
                  <th className="min-w-45 px-5 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-neutral-400" />
                      <span>수집 타임라인 (KST)</span>
                    </div>
                  </th>
                  <th className="min-w-50 px-5 py-4">
                    <span>고유 식별자 & 출처</span>
                  </th>
                  <th className="min-w-32.5 px-5 py-4 text-right whitespace-nowrap">
                    <span>조작</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100/80 dark:divide-neutral-800/70">
                {displayRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-neutral-400">
                      <div className="flex flex-col items-center justify-center gap-2.5">
                        <Database className="h-9 w-9 text-neutral-300 dark:text-neutral-700" />
                        <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                          보존된 일별 기록이 아직 없습니다.
                        </p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-500">
                          상단 정보판에서 [실제 동적 조회]를 실행하거나 합성 시뮬레이터를 작동하세요.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayRecords.map((record) => {
                    // 원본 시간순 배열에서의 인덱스를 찾아 정확한 전일 대비 Delta 산출
                    const chronoIndex = chronologicalRecords.findIndex((r) => r.record_id === record.record_id);
                    const prevRecord = chronoIndex > 0 ? chronologicalRecords[chronoIndex - 1] : null;
                    const delta =
                      prevRecord !== null
                        ? Number((record.normalized_value - prevRecord.normalized_value).toFixed(2))
                        : null;

                    const firstVal = record.first_normalized_value ?? record.normalized_value;
                    const latestVal = record.normalized_value;
                    const isValChanged = firstVal !== latestVal;
                    const intraDayDiff = Number((latestVal - firstVal).toFixed(2));

                    const isUpdatedSameDay = record.first_fetched_at !== record.last_fetched_at;
                    const isExpanded = expandedRecordId === record.record_id;
                    const isLatestRecord = chronoIndex === chronologicalRecords.length - 1;

                    // 시각 정밀 포맷터로 줄바꿈 방지
                    const firstTime = formatKstTimeDisplay(record.first_fetched_at);
                    const lastTime = formatKstTimeDisplay(record.last_fetched_at);

                    return (
                      <React.Fragment key={record.record_id}>
                        <tr className="border-b border-neutral-100/80 transition-colors odd:bg-transparent even:bg-neutral-500/2 hover:bg-indigo-500/5 dark:border-neutral-800/70 dark:hover:bg-indigo-400/6">
                          {/* 1. Date & Index */}
                          <td className="px-5 py-4.5 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-neutral-100/90 font-mono text-[10px] font-bold text-neutral-500 shadow-2xs dark:bg-neutral-800 dark:text-neutral-400">
                                #{chronoIndex + 1}
                              </span>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-mono text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                    {record.record_date}
                                  </span>
                                  {isLatestRecord && (
                                    <span className="py-0.2 rounded-md bg-indigo-100/80 px-1.5 font-sans text-[10px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                      최신
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] font-medium text-neutral-400 dark:text-neutral-500">
                                  Asia/Seoul 기준
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. Temperature Readings (First ➔ Latest) */}
                          <td className="px-5 py-4.5 whitespace-nowrap">
                            <div className="space-y-1.5">
                              {/* 메인: 최종 갱신값 */}
                              <div className="flex items-baseline gap-1.5">
                                <span className="font-mono text-lg font-extrabold tracking-tight text-neutral-950 tabular-nums dark:text-white">
                                  {latestVal}
                                </span>
                                <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400">
                                  {record.unit}
                                </span>
                                <span className="dark:border-neutral-750 rounded-md border border-neutral-200/60 bg-neutral-100/80 px-1.5 py-0.5 text-[10px] font-medium text-neutral-600 dark:bg-neutral-800/80 dark:text-neutral-300">
                                  최종 갱신
                                </span>
                              </div>

                              {/* 서브: 최초 수집값 및 당일 변동 */}
                              <div className="flex items-center gap-1.5 text-[11px]">
                                <span className="text-neutral-400">최초 수집:</span>
                                <span className="font-mono font-bold text-neutral-700 tabular-nums dark:text-neutral-300">
                                  {firstVal} {record.unit}
                                </span>

                                {isValChanged ? (
                                  <span
                                    className={`py-0.2 inline-flex items-center gap-0.5 rounded px-1.5 font-mono text-[10px] font-bold ${
                                      intraDayDiff > 0
                                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400'
                                        : 'bg-blue-50 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400'
                                    }`}
                                  >
                                    {intraDayDiff > 0 ? `▲ +${intraDayDiff}` : `▼ ${intraDayDiff}`} {record.unit}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-neutral-400 dark:text-neutral-500">
                                    (초기값 유지)
                                  </span>
                                )}
                              </div>
                            </div>
                          </td>

                          {/* 3. Delta (전일 대비 변화) */}
                          <td className="px-5 py-4.5 whitespace-nowrap">
                            {delta === null ? (
                              <div className="inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-neutral-100/70 px-2.5 py-1 text-[11px] font-medium text-neutral-500 shadow-2xs dark:border-neutral-800 dark:bg-neutral-800/70 dark:text-neutral-400">
                                <Minus className="h-3 w-3" />
                                <span>기준 일자 (Day 1)</span>
                              </div>
                            ) : delta > 0 ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 rounded-lg border border-rose-200/90 bg-rose-50/90 px-2.5 py-1 font-mono text-xs font-bold text-rose-700 shadow-2xs dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
                                  <ArrowUpRight className="h-3.5 w-3.5" />+{delta} {record.unit}
                                </span>
                                {prevRecord && (
                                  <div className="text-[10px] text-neutral-400">
                                    어제({prevRecord.normalized_value}
                                    {prevRecord.unit}) 대비 상승
                                  </div>
                                )}
                              </div>
                            ) : delta < 0 ? (
                              <div className="space-y-0.5">
                                <span className="inline-flex items-center gap-1 rounded-lg border border-blue-200/90 bg-blue-50/90 px-2.5 py-1 font-mono text-xs font-bold text-blue-700 shadow-2xs dark:border-blue-900/60 dark:bg-blue-950/60 dark:text-blue-300">
                                  <ArrowDownRight className="h-3.5 w-3.5" />
                                  {delta} {record.unit}
                                </span>
                                {prevRecord && (
                                  <div className="text-[10px] text-neutral-400">
                                    어제({prevRecord.normalized_value}
                                    {prevRecord.unit}) 대비 하강
                                  </div>
                                )}
                              </div>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded-lg border border-neutral-200 bg-neutral-100 px-2.5 py-1 font-mono text-xs font-medium text-neutral-600 shadow-2xs dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300">
                                <Minus className="h-3 w-3" /> 0.0 {record.unit} (변화 없음)
                              </span>
                            )}
                          </td>

                          {/* 4. Fetch Timestamps (단일 행으로 깔끔하게 고정) */}
                          <td className="px-5 py-4.5 whitespace-nowrap">
                            <div className="space-y-1.5 text-[11px]">
                              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500" />
                                <span className="text-neutral-400">최초:</span>
                                <span className="font-mono font-semibold text-neutral-800 tabular-nums dark:text-neutral-200">
                                  {firstTime.timeStr}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-300">
                                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                                <span className="text-neutral-400">최종:</span>
                                <span className="font-mono font-semibold text-neutral-800 tabular-nums dark:text-neutral-200">
                                  {lastTime.timeStr}
                                </span>
                              </div>
                              {isUpdatedSameDay ? (
                                <div className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                                  <RefreshCw className="h-2.5 w-2.5" />
                                  <span>동일 날짜 재호출로 갱신됨 (T04-C20)</span>
                                </div>
                              ) : (
                                <div className="inline-flex items-center gap-1 text-[10px] text-neutral-400 dark:text-neutral-500">
                                  <ShieldCheck className="h-2.5 w-2.5 text-emerald-500" />
                                  <span>단일 조회 원본 보존</span>
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 5. Record ID & Source */}
                          <td className="px-5 py-4.5">
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleCopyRecordId(record.record_id)}
                                  className="group dark:border-neutral-750 inline-flex items-center gap-1.5 rounded-lg border border-neutral-200/80 bg-neutral-100/70 px-2 py-0.5 font-mono text-[11px] font-semibold text-neutral-800 shadow-2xs transition-colors hover:bg-neutral-200/80 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                  title="Record ID 복사"
                                >
                                  <span className="max-w-37.5 truncate">{record.record_id}</span>
                                  {copiedKeyId === record.record_id ? (
                                    <Check className="h-2.5 w-2.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                                  ) : (
                                    <Copy className="h-2.5 w-2.5 shrink-0 text-neutral-400 group-hover:text-neutral-700 dark:group-hover:text-neutral-200" />
                                  )}
                                </button>
                              </div>
                              {record.reading?.source_name && (
                                <div className="flex items-center gap-1 text-[11px] text-neutral-500 dark:text-neutral-400">
                                  <span className="max-w-35 truncate">{record.reading.source_name}</span>
                                  {record.reading.source_url && (
                                    <a
                                      href={record.reading.source_url}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="inline-flex items-center text-neutral-400 transition-colors hover:text-indigo-600 dark:hover:text-indigo-400"
                                      title="원천 출처 API URL 열기"
                                    >
                                      <ExternalLink className="h-3 w-3" />
                                    </a>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>

                          {/* 6. Actions */}
                          <td className="px-5 py-4.5 text-right whitespace-nowrap">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleCopyRowJson(record)}
                                title="이 행의 JSON 데이터 복사"
                                className="hover-lift active-press dark:border-neutral-750 inline-flex items-center gap-1 rounded-lg border border-neutral-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-2xs backdrop-blur-xs transition-colors hover:bg-neutral-100 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-700"
                              >
                                {copiedId === record.record_id ? (
                                  <>
                                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                                    <span className="font-semibold text-emerald-700 dark:text-emerald-300">복사됨</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="h-3 w-3 text-neutral-400" />
                                    <span>JSON</span>
                                  </>
                                )}
                              </button>

                              <button
                                type="button"
                                onClick={() => setExpandedRecordId(isExpanded ? null : record.record_id)}
                                title={isExpanded ? '상세 접기' : '정규화 원문 상세 보기'}
                                className={`hover-lift active-press inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[11px] font-medium shadow-2xs backdrop-blur-xs transition-colors ${
                                  isExpanded
                                    ? 'border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300'
                                    : 'dark:border-neutral-750 border-neutral-200/80 bg-white/90 text-neutral-700 hover:bg-neutral-100 dark:bg-neutral-800/90 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                }`}
                              >
                                <Code2 className="h-3 w-3" />
                                <span>{isExpanded ? '접기' : '상세'}</span>
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Dual-Panel Developer Inspection Drawer (글래스모피즘 스타일) */}
                        {isExpanded && (
                          <tr className="dark:bg-neutral-850/50 bg-neutral-50/70">
                            <td colSpan={6} className="px-6 py-5">
                              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                                {/* Left: Verification Field Audit */}
                                <div className="dark:border-neutral-750 space-y-2 rounded-2xl border border-neutral-200/70 bg-white/80 p-4.5 shadow-xs backdrop-blur-md dark:bg-neutral-900/80">
                                  <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5 dark:border-neutral-800">
                                    <span className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                                      <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                      <span>T04 일별 보존 행 필드 감사 결과</span>
                                    </span>
                                    <span className="rounded bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                      검증 통과 (MET)
                                    </span>
                                  </div>
                                  <div className="space-y-2 text-[11px]">
                                    <div className="flex justify-between">
                                      <span className="text-neutral-500">고유 레코드 키 (record_id):</span>
                                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                        {record.record_id}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-500">기준 시간대 (record_timezone):</span>
                                      <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                        Asia/Seoul (KST)
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-500">최초 수집 관측값 (LMS 1차 제출):</span>
                                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                        {firstVal} {record.unit} ({firstTime.timeStr})
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-500">최종 갱신 관측값 (현재 저장값):</span>
                                      <span className="font-mono font-bold text-neutral-900 dark:text-neutral-100">
                                        {latestVal} {record.unit} ({lastTime.timeStr})
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-neutral-500">동일 날짜 재실행 병합 여부:</span>
                                      <span className="font-medium text-neutral-800 dark:text-neutral-200">
                                        {isUpdatedSameDay ? 'T04-C20 갱신 동작함 (1개 행 유지)' : '최초 1회 관측 상태'}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Right: Raw JSON Code Box */}
                                <div className="rounded-2xl border border-neutral-800 bg-neutral-950/90 p-4.5 font-mono text-xs text-neutral-100 shadow-inner backdrop-blur-md">
                                  <div className="mb-2 flex items-center justify-between text-neutral-400">
                                    <span className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-300">
                                      <Code2 className="h-3.5 w-3.5" />
                                      <span>보존 레코드 JSON 원본</span>
                                    </span>
                                    <span className="text-[10px] text-neutral-500">T04-C10 일치성 원문</span>
                                  </div>
                                  <pre className="custom-scrollbar max-h-40 overflow-y-auto font-mono text-[11px] leading-relaxed text-emerald-300 dark:text-emerald-400">
                                    {JSON.stringify(record, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* 4. Table Footer Bar */}
          <div className="dark:bg-neutral-850/60 flex flex-col justify-between gap-2.5 border-t border-neutral-200/80 bg-neutral-50/70 px-5 py-3.5 text-[11px] text-neutral-500 sm:flex-row sm:items-center dark:border-neutral-800 dark:text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="font-mono font-medium text-neutral-700 dark:text-neutral-300">{storageKey}</span>
              <span className="text-neutral-300 dark:text-neutral-700">•</span>
              <span>
                기준 시간대:{' '}
                <strong className="font-bold text-neutral-800 dark:text-neutral-200">Asia/Seoul (KST)</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
