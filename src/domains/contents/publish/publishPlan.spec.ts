import { describe, expect, it } from 'vitest';

import { type Notification } from '../../../api/notifications';
import { createPublishPlan, hasBeenPublished, toInitialVisibility } from './publishPlan';
import { type PublishOptions, type PublishServerState } from './types';

const CONTENT_ID = 7;
const NOTIFICATION_ID = 31;
const SCHEDULED_AT = new Date('2025-12-20T01:00:00Z');
const SCHEDULED_AT_KST = '2025-12-20T10:00:00+09:00';
const OTHER_SCHEDULED_AT_KST = '2025-12-21T10:00:00+09:00';
const PAST_PUBLISHED_AT = '2025-11-01T09:00:00+09:00';

const SEND_TO_ALL = { send: true, targetType: 'all', title: '새 글이 올라왔어요' } as const;

function serverState(overrides: Partial<PublishServerState> = {}): PublishServerState {
  return {
    contentId: CONTENT_ID,
    status: 'private',
    isScheduled: false,
    publishedAt: null,
    notification: null,
    ...overrides,
  };
}

function notification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: NOTIFICATION_ID,
    content_id: CONTENT_ID,
    title: SEND_TO_ALL.title,
    target_type: SEND_TO_ALL.targetType,
    send_status: 'pending',
    scheduled_at: SCHEDULED_AT_KST,
    created_at: '2025-12-01T09:00:00+09:00',
    updated_at: '2025-12-01T09:00:00+09:00',
    ...overrides,
  };
}

function options(overrides: Partial<PublishOptions> = {}): PublishOptions {
  return { visibility: 'public', scheduledAt: null, notification: { send: false }, ...overrides };
}

const SCHEDULED_STATE = serverState({ isScheduled: true, publishedAt: SCHEDULED_AT_KST });
const PUBLIC_STATE = serverState({ status: 'public', publishedAt: PAST_PUBLISHED_AT });

describe('hasBeenPublished', () => {
  it('발행일이 있고 예약 대기 중이 아니면 공개발행 이력이 있다고 본다', () => {
    expect(hasBeenPublished(PUBLIC_STATE)).toBe(true);
    expect(hasBeenPublished(serverState({ publishedAt: PAST_PUBLISHED_AT }))).toBe(true);
  });

  it('예약 대기 중인 발행일은 공개발행 이력으로 보지 않는다', () => {
    expect(hasBeenPublished(SCHEDULED_STATE)).toBe(false);
  });

  it('한 번도 발행하지 않은 콘텐츠는 이력이 없다', () => {
    expect(hasBeenPublished(serverState())).toBe(false);
  });
});

describe('toInitialVisibility', () => {
  it('공개 콘텐츠는 공개 옵션이 선택된다', () => {
    expect(toInitialVisibility(PUBLIC_STATE)).toBe('public');
  });

  it('비공개이면서 예약된 발행 일정이 있으면 예약 발행 옵션이 선택된다', () => {
    expect(toInitialVisibility(SCHEDULED_STATE)).toBe('scheduled');
  });

  it('비공개이고 예약 일정이 없으면 비공개 옵션이 선택된다', () => {
    expect(toInitialVisibility(serverState())).toBe('private');
  });
});

describe('createPublishPlan - 공개', () => {
  it('비공개 콘텐츠를 공개하면 상태만 public으로 바꾼다', () => {
    expect(createPublishPlan(serverState(), options({ visibility: 'public' }))).toEqual([
      { type: 'changeStatus', status: 'public' },
    ]);
  });

  it('이미 공개된 콘텐츠를 그대로 공개로 두면 상태 변경을 호출하지 않는다', () => {
    expect(createPublishPlan(PUBLIC_STATE, options({ visibility: 'public' }))).toEqual([]);
  });

  it('예약 발행 콘텐츠를 공개로 바꾸면 일정 삭제 없이 상태 변경만 호출한다 (서버가 일정을 정리)', () => {
    expect(createPublishPlan(SCHEDULED_STATE, options({ visibility: 'public' }))).toEqual([
      { type: 'changeStatus', status: 'public' },
    ]);
  });

  it('공개하면서 알람을 발송하면 상태 변경 뒤에 즉시 발송 알람을 만든다', () => {
    expect(createPublishPlan(serverState(), options({ visibility: 'public', notification: SEND_TO_ALL }))).toEqual([
      { type: 'changeStatus', status: 'public' },
      { type: 'createNotification', title: SEND_TO_ALL.title, targetType: 'all' },
    ]);
  });

  it('예약 알람이 있는 콘텐츠를 즉시 공개하며 알람을 발송하면 예약 알람을 지우고 즉시 발송 알람을 새로 만든다', () => {
    const state = serverState({ ...SCHEDULED_STATE, notification: notification() });

    expect(createPublishPlan(state, options({ visibility: 'public', notification: SEND_TO_ALL }))).toEqual([
      { type: 'changeStatus', status: 'public' },
      { type: 'deleteNotification', notificationId: NOTIFICATION_ID },
      { type: 'createNotification', title: SEND_TO_ALL.title, targetType: 'all' },
    ]);
  });

  it('이미 공개된 콘텐츠의 예약 알람은 그대로 두고 즉시 발송하지 않는다', () => {
    const state = serverState({ ...PUBLIC_STATE, notification: notification() });

    expect(createPublishPlan(state, options({ visibility: 'public', notification: SEND_TO_ALL }))).toEqual([]);
  });

  it('이미 공개된 콘텐츠의 예약 알람 제목을 바꾸면 예약 시각은 유지하고 내용만 수정한다', () => {
    const state = serverState({ ...PUBLIC_STATE, notification: notification() });
    const changedTitle = { ...SEND_TO_ALL, title: '제목을 바꿨어요' };

    expect(createPublishPlan(state, options({ visibility: 'public', notification: changedTitle }))).toEqual([
      { type: 'updateNotification', notificationId: NOTIFICATION_ID, title: changedTitle.title, targetType: 'all' },
    ]);
  });
});

describe('createPublishPlan - 비공개', () => {
  it('공개 콘텐츠를 비공개로 바꾸면 상태만 private으로 바꾼다', () => {
    expect(createPublishPlan(PUBLIC_STATE, options({ visibility: 'private' }))).toEqual([
      { type: 'changeStatus', status: 'private' },
    ]);
  });

  it('예약 발행 콘텐츠를 비공개로 바꾸면 발행 일정만 삭제한다 (일정이 남으면 예약 시각에 공개됨)', () => {
    expect(createPublishPlan(SCHEDULED_STATE, options({ visibility: 'private' }))).toEqual([
      { type: 'deleteSchedule' },
    ]);
  });

  it('이미 비공개인 콘텐츠를 비공개로 두면 아무것도 호출하지 않는다', () => {
    expect(createPublishPlan(serverState(), options({ visibility: 'private' }))).toEqual([]);
  });

  it('비공개로 바꾸면 알람 옵션과 관계없이 예약 알람을 삭제한다', () => {
    const state = serverState({ ...SCHEDULED_STATE, notification: notification() });

    expect(createPublishPlan(state, options({ visibility: 'private', notification: SEND_TO_ALL }))).toEqual([
      { type: 'deleteSchedule' },
      { type: 'deleteNotification', notificationId: NOTIFICATION_ID },
    ]);
  });
});

describe('createPublishPlan - 예약 발행', () => {
  const scheduledOptions = options({ visibility: 'scheduled', scheduledAt: SCHEDULED_AT });

  it('비공개 콘텐츠를 예약 발행하면 KST 시각으로 발행 일정을 만든다', () => {
    expect(createPublishPlan(serverState(), scheduledOptions)).toEqual([
      { type: 'createSchedule', publishedAt: SCHEDULED_AT_KST },
    ]);
  });

  it('발행 이력 없이 공개 상태인 콘텐츠를 예약 발행하면 먼저 비공개로 바꾼 뒤 일정을 만든다', () => {
    expect(createPublishPlan(serverState({ status: 'public' }), scheduledOptions)).toEqual([
      { type: 'changeStatus', status: 'private' },
      { type: 'createSchedule', publishedAt: SCHEDULED_AT_KST },
    ]);
  });

  it('예약 발행 콘텐츠의 시각을 바꾸면 일정을 수정한다', () => {
    const state = serverState({ isScheduled: true, publishedAt: OTHER_SCHEDULED_AT_KST });

    expect(createPublishPlan(state, scheduledOptions)).toEqual([
      { type: 'updateSchedule', publishedAt: SCHEDULED_AT_KST },
    ]);
  });

  it('예약 시각이 서버와 같으면 일정을 다시 요청하지 않는다', () => {
    const state = serverState({ isScheduled: true, publishedAt: '2025-12-20T01:00:00Z' });

    expect(createPublishPlan(state, scheduledOptions)).toEqual([]);
  });

  it('공개발행 이력이 있는 콘텐츠는 예약 발행을 요청해도 아무것도 호출하지 않는다', () => {
    expect(createPublishPlan(PUBLIC_STATE, { ...scheduledOptions, notification: SEND_TO_ALL })).toEqual([]);
  });

  it('예약 시각이 없으면 아무것도 호출하지 않는다', () => {
    expect(createPublishPlan(serverState(), options({ visibility: 'scheduled', notification: SEND_TO_ALL }))).toEqual(
      []
    );
  });

  it('예약 발행하면서 알람을 발송하면 발행 시각에 맞춰 예약 알람을 만든다', () => {
    expect(createPublishPlan(serverState(), { ...scheduledOptions, notification: SEND_TO_ALL })).toEqual([
      { type: 'createSchedule', publishedAt: SCHEDULED_AT_KST },
      { type: 'createNotification', title: SEND_TO_ALL.title, targetType: 'all', scheduledAt: SCHEDULED_AT_KST },
    ]);
  });

  it('예약 알람의 제목·대상과 발행 시각을 바꾸면 알람 내용과 발송 시각을 각각 수정한다', () => {
    const state = serverState({
      isScheduled: true,
      publishedAt: OTHER_SCHEDULED_AT_KST,
      notification: notification({ title: '이전 제목', target_type: 'follower', scheduled_at: OTHER_SCHEDULED_AT_KST }),
    });

    expect(createPublishPlan(state, { ...scheduledOptions, notification: SEND_TO_ALL })).toEqual([
      { type: 'updateSchedule', publishedAt: SCHEDULED_AT_KST },
      { type: 'updateNotification', notificationId: NOTIFICATION_ID, title: SEND_TO_ALL.title, targetType: 'all' },
      { type: 'updateNotificationSchedule', notificationId: NOTIFICATION_ID, scheduledAt: SCHEDULED_AT_KST },
    ]);
  });

  it('예약 알람의 시각이 그대로면 발송 시각은 수정하지 않는다', () => {
    const state = serverState({ ...SCHEDULED_STATE, notification: notification({ title: '이전 제목' }) });

    expect(createPublishPlan(state, { ...scheduledOptions, notification: SEND_TO_ALL })).toEqual([
      { type: 'updateNotification', notificationId: NOTIFICATION_ID, title: SEND_TO_ALL.title, targetType: 'all' },
    ]);
  });

  it('예약 알람을 미발송으로 바꾸면 알람을 삭제한다', () => {
    const state = serverState({ ...SCHEDULED_STATE, notification: notification() });

    expect(createPublishPlan(state, scheduledOptions)).toEqual([
      { type: 'deleteNotification', notificationId: NOTIFICATION_ID },
    ]);
  });
});

describe('createPublishPlan - 발송이 끝난 알람', () => {
  it.each(['sent', 'failed'] as const)('알람이 이미 %s 상태면 알람 옵션을 바꿔도 알람 단계를 만들지 않는다', status => {
    const state = serverState({ ...PUBLIC_STATE, notification: notification({ send_status: status }) });

    expect(createPublishPlan(state, options({ visibility: 'public', notification: { send: false } }))).toEqual([]);
    expect(createPublishPlan(state, options({ visibility: 'private', notification: SEND_TO_ALL }))).toEqual([
      { type: 'changeStatus', status: 'private' },
    ]);
  });
});

describe('createPublishPlan - 재시도', () => {
  it('상태 변경은 성공하고 알람 생성이 실패한 뒤 서버 상태로 다시 계획하면 남은 알람 생성만 수행한다', () => {
    const publishWithNotification = options({ visibility: 'public', notification: SEND_TO_ALL });
    const stateAfterStatusChanged = serverState({ status: 'public', publishedAt: SCHEDULED_AT_KST });

    expect(createPublishPlan(serverState(), publishWithNotification).map(step => step.type)).toEqual([
      'changeStatus',
      'createNotification',
    ]);
    expect(createPublishPlan(stateAfterStatusChanged, publishWithNotification)).toEqual([
      { type: 'createNotification', title: SEND_TO_ALL.title, targetType: 'all' },
    ]);
  });

  it('예약 일정 생성 후 예약 알람 생성이 실패하면 다시 계획할 때 알람 생성만 남는다', () => {
    const scheduleWithNotification = options({
      visibility: 'scheduled',
      scheduledAt: SCHEDULED_AT,
      notification: SEND_TO_ALL,
    });

    expect(createPublishPlan(SCHEDULED_STATE, scheduleWithNotification)).toEqual([
      { type: 'createNotification', title: SEND_TO_ALL.title, targetType: 'all', scheduledAt: SCHEDULED_AT_KST },
    ]);
  });
});
