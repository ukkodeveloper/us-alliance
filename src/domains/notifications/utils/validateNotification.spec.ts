import { describe, expect, it } from 'vitest';

import { type NotificationFormValues, validateNotification } from './validateNotification';

const NOW = new Date('2026-10-15T12:00:00+09:00');

const VALID_VALUES: NotificationFormValues = {
  targetType: 'all',
  title: '오늘의 시장 정리 알림',
  scheduledAt: new Date('2026-10-15T13:00:00+09:00'),
};

describe('validateNotification', () => {
  it('제목과 시간을 비워 두면 둘 다 필수 정보라고 알려준다', () => {
    expect(validateNotification({ targetType: 'all', title: '', scheduledAt: null }, NOW)).toEqual({
      ok: false,
      errors: { title: '필수 정보입니다.', scheduledAt: '필수 정보입니다.' },
    });
  });

  it('제목과 이후 시간을 입력하면 통과한다', () => {
    expect(validateNotification(VALID_VALUES, NOW)).toEqual({ ok: true });
  });

  it('제목에 공백만 입력하면 필수 정보라고 알려준다', () => {
    expect(validateNotification({ ...VALID_VALUES, title: '   ' }, NOW)).toEqual({
      ok: false,
      errors: { title: '필수 정보입니다.' },
    });
  });

  it('제목을 50자 입력하면 통과한다', () => {
    expect(validateNotification({ ...VALID_VALUES, title: 'a'.repeat(50) }, NOW)).toEqual({ ok: true });
  });

  it('제목을 51자 입력하면 50자 이하를 요청한다', () => {
    expect(validateNotification({ ...VALID_VALUES, title: 'a'.repeat(51) }, NOW)).toEqual({
      ok: false,
      errors: { title: '제목은 50자 이하로 입력해주세요.' },
    });
  });

  it('이미 지난 시간을 선택하면 시간을 다시 선택하도록 알려준다', () => {
    expect(validateNotification({ ...VALID_VALUES, scheduledAt: new Date('2026-10-15T11:50:00+09:00') }, NOW)).toEqual({
      ok: false,
      errors: { scheduledAt: '시간을 다시 선택해주세요.' },
    });
  });
});
