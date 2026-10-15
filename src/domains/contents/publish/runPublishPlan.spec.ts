import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  changeContentStatus,
  createContentSchedule,
  deleteContentSchedule,
  updateContentSchedule,
} from '../../../api/contents';
import { ApiError } from '../../../api/http';
import {
  createNotification,
  deleteNotification,
  updateNotification,
  updateNotificationSchedule,
} from '../../../api/notifications';
import { runPublishPlan } from './runPublishPlan';

vi.mock('../../../api/contents', () => ({
  changeContentStatus: vi.fn(),
  createContentSchedule: vi.fn(),
  deleteContentSchedule: vi.fn(),
  updateContentSchedule: vi.fn(),
}));

vi.mock('../../../api/notifications', () => ({
  createNotification: vi.fn(),
  deleteNotification: vi.fn(),
  updateNotification: vi.fn(),
  updateNotificationSchedule: vi.fn(),
}));

const CONTENT_ID = 7;
const NOTIFICATION_ID = 31;
const SCHEDULED_AT_KST = '2025-12-20T10:00:00+09:00';

const API_MOCKS = {
  changeContentStatus,
  createContentSchedule,
  deleteContentSchedule,
  updateContentSchedule,
  createNotification,
  deleteNotification,
  updateNotification,
  updateNotificationSchedule,
};

function calledApisInOrder() {
  return Object.entries(API_MOCKS)
    .flatMap(([name, api]) => vi.mocked(api).mock.invocationCallOrder.map(order => ({ name, order })))
    .sort((a, b) => a.order - b.order)
    .map(({ name }) => name);
}

describe('runPublishPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('각 단계를 계획 순서대로 해당 API에 요청하고 성공을 반환한다', async () => {
    const result = await runPublishPlan(CONTENT_ID, [
      { type: 'deleteSchedule' },
      { type: 'changeStatus', status: 'private' },
      { type: 'createSchedule', publishedAt: SCHEDULED_AT_KST },
      { type: 'updateSchedule', publishedAt: SCHEDULED_AT_KST },
      { type: 'deleteNotification', notificationId: NOTIFICATION_ID },
      { type: 'createNotification', title: '새 글', targetType: 'all', scheduledAt: SCHEDULED_AT_KST },
      { type: 'updateNotification', notificationId: NOTIFICATION_ID, title: '새 글', targetType: 'member' },
      { type: 'updateNotificationSchedule', notificationId: NOTIFICATION_ID, scheduledAt: SCHEDULED_AT_KST },
    ]);

    expect(result).toEqual({ ok: true });
    expect(calledApisInOrder()).toEqual([
      'deleteContentSchedule',
      'changeContentStatus',
      'createContentSchedule',
      'updateContentSchedule',
      'deleteNotification',
      'createNotification',
      'updateNotification',
      'updateNotificationSchedule',
    ]);
    expect(deleteContentSchedule).toHaveBeenCalledWith(CONTENT_ID);
    expect(changeContentStatus).toHaveBeenCalledWith(CONTENT_ID, { status: 'private' });
    expect(createContentSchedule).toHaveBeenCalledWith(CONTENT_ID, { published_at: SCHEDULED_AT_KST });
    expect(updateContentSchedule).toHaveBeenCalledWith(CONTENT_ID, { published_at: SCHEDULED_AT_KST });
    expect(deleteNotification).toHaveBeenCalledWith(NOTIFICATION_ID);
    expect(createNotification).toHaveBeenCalledWith({
      content_id: CONTENT_ID,
      title: '새 글',
      target_type: 'all',
      scheduled_at: SCHEDULED_AT_KST,
    });
    expect(updateNotification).toHaveBeenCalledWith(NOTIFICATION_ID, { title: '새 글', target_type: 'member' });
    expect(updateNotificationSchedule).toHaveBeenCalledWith(NOTIFICATION_ID, { scheduled_at: SCHEDULED_AT_KST });
  });

  it('중간 단계가 실패하면 이후 단계를 요청하지 않고 완료한 단계 수와 에러를 반환한다', async () => {
    const conflict = new ApiError(409, '이미 알람이 있습니다.');
    vi.mocked(createNotification).mockRejectedValue(conflict);

    const result = await runPublishPlan(CONTENT_ID, [
      { type: 'changeStatus', status: 'public' },
      { type: 'createNotification', title: '새 글', targetType: 'all' },
      { type: 'deleteNotification', notificationId: NOTIFICATION_ID },
    ]);

    expect(result).toEqual({ ok: false, completedSteps: 1, error: conflict });
    expect(deleteNotification).not.toHaveBeenCalled();
  });

  it('API 에러가 아닌 예외는 그대로 던진다', async () => {
    const unexpected = new TypeError('boom');
    vi.mocked(changeContentStatus).mockRejectedValue(unexpected);

    await expect(runPublishPlan(CONTENT_ID, [{ type: 'changeStatus', status: 'public' }])).rejects.toBe(unexpected);
  });

  it('단계가 없으면 아무것도 요청하지 않고 성공한다', async () => {
    expect(await runPublishPlan(CONTENT_ID, [])).toEqual({ ok: true });
    expect(calledApisInOrder()).toEqual([]);
  });
});
