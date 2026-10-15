import { useState } from 'react';

import { type TargetType } from '../../../api/notifications';
import { hasBeenPublished, toInitialVisibility } from './publishPlan';
import { type PublishOptions, type PublishServerState, type PublishVisibility } from './types';
import { validatePublish } from './validatePublish';

export type PublishFormValues = {
  visibility: PublishVisibility;
  scheduledAt: Date | null;
  sendNotification: boolean;
  targetType: TargetType;
  notificationTitle: string;
  isContentTitleUsed: boolean;
};

export function usePublishOptions(serverState: PublishServerState) {
  const [values, setValues] = useState(() => toInitialValues(serverState));
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const canSchedule = !hasBeenPublished(serverState);
  const options = toPublishOptions(values);
  const validation = validatePublish(options, { now: new Date(), canSchedule });
  const errors = isSubmitAttempted && !validation.ok ? validation.errors : {};

  function validate() {
    setIsSubmitAttempted(true);
    return validation.ok;
  }

  return { values, options, errors, canSchedule, setValues, validate };
}

function isFirstPublish({ status, isScheduled, publishedAt }: PublishServerState) {
  return status === 'private' && !isScheduled && publishedAt == null;
}

function toInitialValues(serverState: PublishServerState): PublishFormValues {
  const { isScheduled, publishedAt, notification } = serverState;

  return {
    visibility: isFirstPublish(serverState) ? 'public' : toInitialVisibility(serverState),
    scheduledAt: isScheduled && publishedAt != null ? new Date(publishedAt) : null,
    sendNotification: isFirstPublish(serverState) || notification != null,
    targetType: notification?.target_type ?? 'all',
    notificationTitle: notification?.title ?? '',
    isContentTitleUsed: false,
  };
}

function toPublishOptions({
  visibility,
  scheduledAt,
  sendNotification,
  targetType,
  notificationTitle,
}: PublishFormValues): PublishOptions {
  return {
    visibility,
    scheduledAt,
    notification: sendNotification ? { send: true, targetType, title: notificationTitle.trim() } : { send: false },
  };
}
