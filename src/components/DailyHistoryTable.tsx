import React, { useState } from 'react';
import { Calendar, CheckCircle2, Copy, Database } from 'lucide-react';
import type { DailyRecord } from '../types/board';
import { formatKstDateTime } from '../utils/kst';

interface DailyHistoryTableProps {
  records: DailyRecord[];
  title?: string;
  description?: string;
}

export const DailyHistoryTable: React.FC<DailyHistoryTableProps> = ({
  records,
  title = '일별 기록 보존 저장소 (Daily Readings Store)',
  description = '기준 시간대(Asia/Seoul)의 날짜를 고유 키로 삼아 같은 날 중복을 합치고, 다음 날짜는 새 행으로 보존합니다.',
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(records, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="daily-history" className="mb-10 scroll-mt-24">
      <div className="glass-panel glass-glow rounded-3xl p-6 shadow-md transition-all sm:p-9">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 border-b border-neutral-100 pb-6 sm:flex-row sm:items-center dark:border-neutral-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-indigo-200 bg-indigo-100/80 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 dark:border-indigo-800/60 dark:bg-indigo-950/60 dark:text-indigo-300">
                카드 4 규격 (T04-C20, C21)
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">보존된 일별 행: {records.length}건</span>
            </div>
            <h2 className="mt-1.5 flex items-center gap-2 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-neutral-50">
              <Database className="h-5 w-5 text-indigo-500" />
              <span>{title}</span>
            </h2>
            <p className="mt-1 text-xs text-neutral-600 dark:text-neutral-400">{description}</p>
          </div>

          <button
            type="button"
            onClick={handleCopyJson}
            className="hover-lift active-press inline-flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3.5 py-2 text-xs font-semibold text-neutral-800 shadow-xs transition-colors hover:bg-neutral-100 dark:border-neutral-700/80 dark:bg-neutral-800/70 dark:text-neutral-200 dark:hover:bg-neutral-700"
          >
            {copied ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>{copied ? 'JSON 복사됨!' : '전체 JSON 복사'}</span>
          </button>
        </div>

        {/* Verification Summary Pill Box */}
        <div className="my-6 grid grid-cols-1 gap-3.5 md:grid-cols-2">
          <div className="hover-lift flex items-start gap-3.5 rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-4 shadow-xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div className="text-xs">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                T04-C20 동일 날짜 재실행 병합 규칙
              </span>
              <p className="mt-1 leading-relaxed text-neutral-600 dark:text-neutral-400">
                같은 Asia/Seoul 날짜에 여러 번 성공하더라도 기존 행의 <code>last_fetched_at</code>과 값이 원자적으로
                갱신되며, 총 행 수는 1건을 유지합니다.
              </p>
            </div>
          </div>

          <div className="hover-lift flex items-start gap-3.5 rounded-2xl border border-indigo-200/60 bg-indigo-50/40 p-4 shadow-xs dark:border-indigo-900/40 dark:bg-indigo-950/20">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-indigo-600 dark:text-indigo-400" />
            <div className="text-xs">
              <span className="font-bold text-neutral-900 dark:text-neutral-100">
                T04-C21 익일 성공 시 신규 행 생성 규칙
              </span>
              <p className="mt-1 leading-relaxed text-neutral-600 dark:text-neutral-400">
                Asia/Seoul 기준 다음 날짜에 성공 조회 시 신규 일별 행이 정확히 1건 추가되며 전일 대비 변화 계산의 기준이
                됩니다.
              </p>
            </div>
          </div>
        </div>

        {/* Records Table */}
        <div className="overflow-x-auto rounded-2xl border border-neutral-200 bg-white shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-neutral-200/80 bg-neutral-50/80 font-semibold text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/80 dark:text-neutral-300">
              <tr>
                <th className="px-4 py-3.5">#</th>
                <th className="px-4 py-3.5">고유 식별자 (Record ID)</th>
                <th className="px-4 py-3.5">KST 날짜</th>
                <th className="px-4 py-3.5">저장값 (Normalized)</th>
                <th className="px-4 py-3.5">최초 수집 시각</th>
                <th className="px-4 py-3.5">최종 갱신 시각</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 font-mono dark:divide-neutral-800">
              {records.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-neutral-400">
                    보존된 일별 기록이 없습니다. 상단에서 조회를 실행하세요.
                  </td>
                </tr>
              ) : (
                records.map((record, index) => (
                  <tr
                    key={record.record_id}
                    className="transition-colors hover:bg-neutral-50/80 dark:hover:bg-neutral-800/50"
                  >
                    <td className="px-4 py-3.5 font-sans text-neutral-400">{index + 1}</td>
                    <td className="px-4 py-3.5 font-bold text-neutral-900 dark:text-neutral-100">{record.record_id}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-neutral-100 px-2 py-0.5 font-sans font-semibold text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
                        <Calendar className="h-3 w-3 text-neutral-400" />
                        {record.record_date}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm font-bold text-indigo-600 dark:text-indigo-400">
                      {record.normalized_value} {record.unit}
                    </td>
                    <td className="px-4 py-3.5 font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                      {formatKstDateTime(record.first_fetched_at)}
                    </td>
                    <td className="px-4 py-3.5 font-sans text-[11px] text-neutral-500 dark:text-neutral-400">
                      {formatKstDateTime(record.last_fetched_at)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
