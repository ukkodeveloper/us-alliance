import { describe, expect, it } from 'vitest';

import { type PublishOptions } from './types';
import { validatePublish } from './validatePublish';

const NOW = new Date('2026-10-15T12:00:00+09:00');
const CAN_SCHEDULE = { now: NOW, canSchedule: true };

const SEND_TO_ALL = { send: true, targetType: 'all', title: '새 글이 올라왔어요' } as const;

function options(overrides: Partial<PublishOptions> = {}): PublishOptions {
  return { visibility: 'public', scheduledAt: null, notification: { send: false }, ...overrides };
}

describe('validatePublish - 공개·비공개', () => {
  it('공개하면서 알람을 미발송으로 두면 통과한다', () => {
    expect(validatePublish(options(), CAN_SCHEDULE)).toEqual({ ok: true });
  });

  it('공개하면서 알람을 발송하고 알람 내용을 입력하면 통과한다', () => {
    expect(validatePublish(options({ notification: SEND_TO_ALL }), CAN_SCHEDULE)).toEqual({ ok: true });
  });

  it('알람을 발송하는데 알람 내용을 비우거나 공백만 입력하면 알람 내용을 입력하도록 알려준다', () => {
    for (const title of ['', '   ']) {
      expect(validatePublish(options({ notification: { ...SEND_TO_ALL, title } }), CAN_SCHEDULE)).toEqual({
        ok: false,
        errors: { notificationTitle: '알람 내용을 입력해주세요.' },
      });
    }
  });

  it('알람 내용을 50자 입력하면 통과하고 51자 입력하면 50자 이하를 요청한다', () => {
    const titleOf = (length: number) => options({ notification: { ...SEND_TO_ALL, title: 'a'.repeat(length) } });

    expect(validatePublish(titleOf(50), CAN_SCHEDULE)).toEqual({ ok: true });
    expect(validatePublish(titleOf(51), CAN_SCHEDULE)).toEqual({
      ok: false,
      errors: { notificationTitle: '알람 내용은 50자 이하로 입력해주세요.' },
    });
  });

  it('비공개로 발행하면 알람이 미발송 처리되므로 알람 내용이 비어 있어도 통과한다', () => {
    const privateWithEmptyTitle = options({ visibility: 'private', notification: { ...SEND_TO_ALL, title: '' } });

    expect(validatePublish(privateWithEmptyTitle, CAN_SCHEDULE)).toEqual({ ok: true });
  });
});

describe('validatePublish - 예약 발행', () => {
  it('예약 시간을 선택하지 않으면 필수 정보라고 알려준다', () => {
    expect(validatePublish(options({ visibility: 'scheduled' }), CAN_SCHEDULE)).toEqual({
      ok: false,
      errors: { scheduledAt: '필수 정보입니다.' },
    });
  });

  it('이미 지난 시간을 선택하면 시간을 다시 선택하도록 알려준다', () => {
    const pastOptions = options({ visibility: 'scheduled', scheduledAt: new Date('2026-10-15T11:50:00+09:00') });

    expect(validatePublish(pastOptions, CAN_SCHEDULE)).toEqual({
      ok: false,
      errors: { scheduledAt: '시간을 다시 선택해주세요.' },
    });
  });

  it('이후 시간을 선택하면 통과한다', () => {
    const futureOptions = options({ visibility: 'scheduled', scheduledAt: new Date('2026-10-15T12:10:00+09:00') });

    expect(validatePublish(futureOptions, CAN_SCHEDULE)).toEqual({ ok: true });
  });

  it('공개 발행 이력이 있는 콘텐츠는 예약 발행할 수 없다고 알려준다', () => {
    const futureOptions = options({ visibility: 'scheduled', scheduledAt: new Date('2026-10-15T12:10:00+09:00') });

    expect(validatePublish(futureOptions, { now: NOW, canSchedule: false })).toEqual({
      ok: false,
      errors: { scheduledAt: '이미 공개 발행한 콘텐츠는 예약 발행할 수 없습니다.' },
    });
  });

  it('예약 시간과 알람 내용을 모두 비우면 두 에러를 함께 알려준다', () => {
    const emptyOptions = options({ visibility: 'scheduled', notification: { ...SEND_TO_ALL, title: '' } });

    expect(validatePublish(emptyOptions, CAN_SCHEDULE)).toEqual({
      ok: false,
      errors: { scheduledAt: '필수 정보입니다.', notificationTitle: '알람 내용을 입력해주세요.' },
    });
  });
});
