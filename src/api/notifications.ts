import { queryOptions } from '@tanstack/react-query';

import { request } from './http';

export const NOTIFICATION_PAGE_SIZE = 10;

export type TargetType = 'all' | 'follower' | 'member';

export type SendStatus = 'pending' | 'sent' | 'failed';

export const TARGET_TYPE_LABELS: Record<TargetType, string> = {
  all: '전체',
  follower: '팔로워',
  member: '멤버십',
};

export const SEND_STATUS_LABELS: Record<SendStatus, string> = {
  pending: '예약',
  sent: '발송',
  failed: '실패',
};

export type NotificationStats = {
  success_count: number;
  failure_count: number;
};

export type Notification = {
  id: number;
  content_id: number;
  title: string;
  target_type: TargetType;
  send_status: SendStatus;
  scheduled_at: string;
  sent_at?: string | null;
  stats?: NotificationStats | null;
  created_at: string;
  updated_at: string;
};

export type NotificationList = {
  notifications: Notification[];
  page: number;
  limit: number;
  total: number;
};

export type NotificationSchedule = {
  notification_id: number;
  is_scheduled: boolean;
  scheduled_at: string;
};

export type NotificationListParams = {
  page: number;
  limit: number;
};

export type CreateNotificationRequest = {
  content_id: number;
  title: string;
  target_type: TargetType;
  scheduled_at?: string;
};

export type UpdateNotificationRequest = Partial<Omit<CreateNotificationRequest, 'scheduled_at'>>;

export type NotificationScheduleRequest = {
  scheduled_at: string;
};

export function getNotifications({ page, limit }: NotificationListParams): Promise<NotificationList> {
  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  return request<NotificationList>(`/api/v1/notifications?${searchParams.toString()}`);
}

export function getNotification(id: number): Promise<Notification> {
  return request<Notification>(`/api/v1/notifications/${id}`);
}

export function createNotification(body: CreateNotificationRequest): Promise<Notification> {
  return request<Notification>('/api/v1/notifications', { method: 'POST', json: body });
}

export function updateNotification(id: number, body: UpdateNotificationRequest): Promise<Notification> {
  return request<Notification>(`/api/v1/notifications/${id}`, { method: 'PUT', json: body });
}

export function deleteNotification(id: number): Promise<void> {
  return request<void>(`/api/v1/notifications/${id}`, { method: 'DELETE' });
}

export function updateNotificationSchedule(
  id: number,
  body: NotificationScheduleRequest
): Promise<NotificationSchedule> {
  return request<NotificationSchedule>(`/api/v1/notifications/${id}/schedule`, { method: 'PUT', json: body });
}

export const notificationQueries = {
  list: (params: NotificationListParams) =>
    queryOptions({
      queryKey: ['notifications', 'list', params],
      queryFn: () => getNotifications(params),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ['notifications', 'detail', id],
      queryFn: () => getNotification(id),
    }),
};
