import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-neutral-200 bg-white py-10 transition-colors dark:border-neutral-800 dark:bg-neutral-900">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 text-xs text-neutral-500 sm:px-6 md:flex-row dark:text-neutral-400">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <div>
            <p className="font-bold text-neutral-800 dark:text-neutral-200">
              SKT ALEPH jinyeongjang - 오늘의 진짜 정보판 — 데이터가 안 올 때
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://github.com/jinyeongjang/skt-aleph-jinyeong-today-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="hover-lift active-press dark:border-neutral-750 flex items-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-1.5 text-xs font-semibold text-neutral-700 shadow-xs transition-colors hover:text-neutral-900 dark:bg-neutral-800/70 dark:text-neutral-300 dark:hover:text-white"
          >
            <span>GitHub</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </footer>
  );
};
