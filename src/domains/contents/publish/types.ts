import { type ContentStatus } from '../../../api/contents';
import { type Notification, type TargetType } from '../../../api/notifications';

export type PublishVisibility = 'public' | 'private' | 'scheduled';

export type NotificationOption = { send: false } | { send: true; targetType: TargetType; title: string };

export type PublishOptions = {
  visibility: PublishVisibility;
  scheduledAt: Date | null;
  notification: NotificationOption;
};

export type PublishServerState = {
  contentId: number;
  status: ContentStatus;
  isScheduled: boolean;
  publishedAt: string | null;
  notification: Notification | null;
};

export type PublishStep =
  | { type: 'deleteSchedule' }
  | { type: 'changeStatus'; status: ContentStatus }
  | { type: 'createSchedule'; publishedAt: string }
  | { type: 'updateSchedule'; publishedAt: string }
  | { type: 'createNotification'; title: string; targetType: TargetType; scheduledAt?: string }
  | { type: 'updateNotification'; notificationId: number; title: string; targetType: TargetType }
  | { type: 'updateNotificationSchedule'; notificationId: number; scheduledAt: string }
  | { type: 'deleteNotification'; notificationId: number };
