/**
 * Asia/Seoul (KST) 날짜 및 시각 유틸리티
 * adapter-reset.example.js의 표준 kstDate 규격을 준수합니다.
 */

export function kstDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    throw new TypeError('fetched_at must be a valid ISO-8601 date-time');
  }
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${byType.year}-${byType.month}-${byType.day}`;
}

export function formatKstDateTime(isoString: string | null): string {
  if (!isoString) return '미제공 (null)';
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) return '유효하지 않은 시각';

  return (
    new Intl.DateTimeFormat('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(date) + ' KST'
  );
}

export function getNowKstIso(): string {
  return new Date().toISOString();
}
