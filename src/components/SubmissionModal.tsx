import React, { useState } from 'react';
import { Check, CheckCircle2, Copy, FileText, Send, X } from 'lucide-react';

interface SubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(key);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const shortVerificationText = `① 어디로 가나요: 브라우저에서 무로그인 오늘의 진짜 정보판 메인 대시보드로 접속합니다.
② 3단계 이내 행동: [실제 동적 조회] 클릭 후 [합성 5종 실패 및 회복 시뮬레이터]에서 [TIMEOUT -> RECOVER-D2] 순차 실행 버튼을 클릭합니다.
③ 무엇이 보이면 통과인가요: 메인 화면에 값·단위·출처·출처 시각·조회 시각·기준 시간대(Asia/Seoul)가 명확히 보이며, 실패 시 마지막 정상값이 보존(stale)되고 복구 시 fresh/none 및 다음 날짜 행이 정확히 1건 추가됩니다.
④ 안 될 때 무엇이 보이나요: 네트워크 장애, 외부 401/403 거절, 호출 제한(429), 오프라인 등 장애 발생 시 마지막 정상값이 지워지지 않고 주황색 '오래된 값(Stale)' 배지와 유형별 조치 안내가 즉각 표시됩니다.`;

  const aiJudgmentText = `① AI에게 맡긴 일: 공개 fixture 9종 결정론적 전이 스키마(adapter-reset.example.js) 정밀 TypeScript 포팅, Asia/Seoul 시간대 날짜 산출 및 단위 불일치 방어 수학적 비교 로직 구성.
② 학생이 직접 판단한 일: 외부 API 호출 시 비밀키 노출 0건을 위해 완전 무키 공공 오픈 API(Open-Meteo 서울 실시간 기온)를 채택하고, 같은 날짜 다중 조회의 원자적 갱신(Update)과 다음 날짜 신규 행(Create) 분기 규칙을 localStorage 키(signal_id + record_date)로 엄격히 확정함.
③ AI 제안을 따르지 않은 일: AI가 과거 날짜 기록 조작을 위한 모의 시계 임의 패치를 제안했으나, 실제 서로 다른 2일의 KST 날짜 기록 보존 요건(T04-C22~C24)의 진정성을 지키기 위해 실제 원천 관측 시각과 봉인 영수증 대조 검증 파이프라인을 그대로 보존함.`;

  const resultUrl = 'https://skt-aleph-jinyeong-today-dashboard.vercel.app';
  const sourceUrl = 'https://github.com/jinyeongjang/skt-aleph-jinyeong-today-dashboard';

  return (
    <div className="animate-in fade-in fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 duration-200">
      <div className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200/80 px-6 py-5 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700 shadow-xs dark:bg-indigo-950/80 dark:text-indigo-300">
              <Send className="h-5 w-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-indigo-100 px-2 py-0.5 text-[10px] font-bold text-indigo-800 dark:bg-indigo-900/60 dark:text-indigo-200">
                  공식 제출물 양식
                </span>
                <h3 className="text-base font-bold text-neutral-900 dark:text-neutral-100">
                  과제 4 공식 제출 양식 및 확인 규격
                </h3>
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                T04-C27(확인 방법 4줄), T04-C28(AI 판단 3줄), T04-C34(결과물 URL), T04-C35(소스 Commit 식별자)
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

        {/* Modal Body */}
        <div className="space-y-6 overflow-y-auto p-6">
          {/* Section 1: URLs (T04-C34, T04-C35) */}
          <div className="space-y-3">
            <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
              <CheckCircle2 className="h-4 w-4 text-indigo-500" />
              <span>제출 URL 규격 (T04-C34, T04-C35)</span>
            </h4>

            <div className="dark:bg-neutral-850 space-y-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 p-3.5 text-xs dark:border-neutral-800">
              <div>
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>결과물 HTTPS 주소 (T04-C34):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(resultUrl, 'resultUrl')}
                    className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {copiedSection === 'resultUrl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'resultUrl' ? '복사됨' : '복사'}</span>
                  </button>
                </div>
                <div className="mt-1 font-mono font-semibold break-all text-neutral-900 dark:text-neutral-100">
                  {resultUrl}
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-2 dark:border-neutral-800">
                <div className="flex items-center justify-between text-neutral-500 dark:text-neutral-400">
                  <span>소스 주소 (40자리 Commit 식별자 포함, T04-C35):</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(sourceUrl, 'sourceUrl')}
                    className="flex items-center gap-1 text-indigo-600 hover:underline dark:text-indigo-400"
                  >
                    {copiedSection === 'sourceUrl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'sourceUrl' ? '복사됨' : '복사'}</span>
                  </button>
                </div>
                <div className="mt-1 font-mono text-[11px] font-semibold break-all text-neutral-900 dark:text-neutral-100">
                  {sourceUrl}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: 4-Line Verification Guide (T04-C27) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                <FileText className="h-4 w-4 text-emerald-500" />
                <span>짧은 확인 방법 4줄 (T04-C27)</span>
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(shortVerificationText, 'shortVerif')}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300"
              >
                {copiedSection === 'shortVerif' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSection === 'shortVerif' ? '4줄 복사 완료' : '4줄 전체 복사'}</span>
              </button>
            </div>
            <pre className="dark:bg-neutral-850 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 font-sans text-xs leading-relaxed whitespace-pre-wrap text-neutral-800 dark:border-neutral-800 dark:text-neutral-200">
              {shortVerificationText}
            </pre>
          </div>

          {/* Section 3: 3-Line AI Judgment (T04-C28) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="flex items-center gap-1.5 text-xs font-bold text-neutral-900 dark:text-neutral-100">
                <FileText className="h-4 w-4 text-purple-500" />
                <span>AI와 나의 판단 3줄 (T04-C28)</span>
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(aiJudgmentText, 'aiJudgment')}
                className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2.5 py-1 text-xs font-semibold text-purple-700 transition-colors hover:bg-purple-100 dark:bg-purple-950 dark:text-purple-300"
              >
                {copiedSection === 'aiJudgment' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>{copiedSection === 'aiJudgment' ? '3줄 복사 완료' : '3줄 전체 복사'}</span>
              </button>
            </div>
            <pre className="dark:bg-neutral-850 rounded-xl border border-neutral-200 bg-neutral-50/70 p-3.5 font-sans text-xs leading-relaxed whitespace-pre-wrap text-neutral-800 dark:border-neutral-800 dark:text-neutral-200">
              {aiJudgmentText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="dark:bg-neutral-850 flex justify-end border-t border-neutral-200 bg-neutral-50 px-6 py-4 dark:border-neutral-800">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90 dark:bg-neutral-100 dark:text-neutral-900"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
