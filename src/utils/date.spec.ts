import { describe, expect, it } from 'vitest';

import { formatDateTime, formatListDate, toKstIsoString } from './date';

const LOCAL_DECEMBER_20_0905 = new Date(2025, 11, 20, 9, 5);

describe('formatListDate', () => {
  it('콘텐츠 공개일자를 yy.MM.dd HH:mm 형식으로 보여준다', () => {
    expect(formatListDate(LOCAL_DECEMBER_20_0905.toISOString())).toBe('25.12.20 09:05');
  });
});

describe('formatDateTime', () => {
  it('알람 발송 날짜를 yyyy.MM.dd HH:mm 형식으로 보여준다', () => {
    expect(formatDateTime(LOCAL_DECEMBER_20_0905.toISOString())).toBe('2025.12.20 09:05');
  });
});

describe('toKstIsoString', () => {
  it('선택한 시각을 KST 오프셋이 붙은 ISO 문자열로 보낸다', () => {
    expect(toKstIsoString(new Date('2025-12-20T01:00:00Z'))).toBe('2025-12-20T10:00:00+09:00');
  });

  it('UTC로는 전날인 시각도 KST 날짜로 바꿔 보낸다', () => {
    expect(toKstIsoString(new Date('2025-12-19T15:30:00Z'))).toBe('2025-12-20T00:30:00+09:00');
  });

  it('UTC 연말 자정 직전은 KST 새해 날짜로 보낸다', () => {
    expect(toKstIsoString(new Date('2025-12-31T15:00:00Z'))).toBe('2026-01-01T00:00:00+09:00');
  });

  it('초 단위는 버리고 분 단위까지만 보낸다', () => {
    expect(toKstIsoString(new Date('2025-12-20T01:00:45.123Z'))).toBe('2025-12-20T10:00:00+09:00');
  });
});
