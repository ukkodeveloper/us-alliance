import { format, parseISO } from 'date-fns';

const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export function formatListDate(iso: string) {
  return format(parseISO(iso), 'yy.MM.dd HH:mm');
}

export function formatDateTime(iso: string) {
  return format(parseISO(iso), 'yyyy.MM.dd HH:mm');
}

export function formatKoreanDateTime(date: Date) {
  return format(date, 'yyyy년 MM월 dd일 HH시 mm분');
}

export function toKstIsoString(date: Date) {
  const kstWallClock = new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 16);
  return `${kstWallClock}:00+09:00`;
}
