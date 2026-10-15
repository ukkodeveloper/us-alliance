import { type Notification } from '../../../api/notifications';
import { toKstIsoString } from '../../../utils/date';
import {
  type NotificationOption,
  type PublishOptions,
  type PublishServerState,
  type PublishStep,
  type PublishVisibility,
} from './types';

export function isNotificationLocked(notification: Notification | null) {
  return notification != null && notification.send_status !== 'pending';
}

export function hasBeenPublished(state: PublishServerState) {
  return state.publishedAt != null && !state.isScheduled;
}

export function toInitialVisibility(state: PublishServerState): PublishVisibility {
  if (state.status === 'public') {
    return 'public';
  }
  return state.isScheduled ? 'scheduled' : 'private';
}

export function createPublishPlan(state: PublishServerState, options: PublishOptions): PublishStep[] {
  const { visibility, scheduledAt, notification } = options;

  switch (visibility) {
    case 'public':
      return [
        ...planPublicContent(state),
        ...planNotification(state.notification, notification, keptNotificationSendAt(state)),
      ];
    case 'private':
      return [...planPrivateContent(state), ...planNotification(state.notification, { send: false }, null)];
    case 'scheduled': {
      if (scheduledAt == null || hasBeenPublished(state)) {
        return [];
      }
      const publishedAt = toKstIsoString(scheduledAt);
      return [
        ...planScheduledContent(state, publishedAt),
        ...planNotification(state.notification, notification, publishedAt),
      ];
    }
    default: {
      const unhandled: never = visibility;
      throw new Error(`처리하지 않은 공개 옵션입니다: ${String(unhandled)}`);
    }
  }
}

function isAlreadyPublic(state: PublishServerState) {
  return state.status === 'public' && !state.isScheduled;
}

function keptNotificationSendAt(state: PublishServerState) {
  return isAlreadyPublic(state) ? (state.notification?.scheduled_at ?? null) : null;
}

function planPublicContent(state: PublishServerState): PublishStep[] {
  if (isAlreadyPublic(state)) {
    return [];
  }
  return [{ type: 'changeStatus', status: 'public' }];
}

function planPrivateContent(state: PublishServerState): PublishStep[] {
  const steps: PublishStep[] = [];
  if (state.isScheduled) {
    steps.push({ type: 'deleteSchedule' });
  }
  if (state.status === 'public') {
    steps.push({ type: 'changeStatus', status: 'private' });
  }
  return steps;
}

function planScheduledContent(state: PublishServerState, publishedAt: string): PublishStep[] {
  const steps: PublishStep[] = [];
  if (state.status === 'public') {
    steps.push({ type: 'changeStatus', status: 'private' });
  }
  if (!state.isScheduled) {
    steps.push({ type: 'createSchedule', publishedAt });
  } else if (!isSameTime(state.publishedAt, publishedAt)) {
    steps.push({ type: 'updateSchedule', publishedAt });
  }
  return steps;
}

function planNotification(
  existing: Notification | null,
  option: NotificationOption,
  sendAt: string | null
): PublishStep[] {
  if (isNotificationLocked(existing)) {
    return [];
  }

  if (!option.send) {
    return existing == null ? [] : [{ type: 'deleteNotification', notificationId: existing.id }];
  }

  const { title, targetType } = option;
  const createStep: PublishStep =
    sendAt == null
      ? { type: 'createNotification', title, targetType }
      : { type: 'createNotification', title, targetType, scheduledAt: sendAt };

  if (existing == null) {
    return [createStep];
  }

  if (sendAt == null) {
    return [{ type: 'deleteNotification', notificationId: existing.id }, createStep];
  }

  const steps: PublishStep[] = [];
  if (existing.title !== title || existing.target_type !== targetType) {
    steps.push({ type: 'updateNotification', notificationId: existing.id, title, targetType });
  }
  if (!isSameTime(existing.scheduled_at, sendAt)) {
    steps.push({ type: 'updateNotificationSchedule', notificationId: existing.id, scheduledAt: sendAt });
  }
  return steps;
}

function isSameTime(serverIso: string | null, requestIso: string) {
  return serverIso != null && Date.parse(serverIso) === Date.parse(requestIso);
}
