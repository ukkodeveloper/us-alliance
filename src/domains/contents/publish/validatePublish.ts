import { MAX_NOTIFICATION_TITLE_LENGTH } from '../../../api/notifications';
import { type PublishOptions } from './types';

export type PublishField = 'scheduledAt' | 'notificationTitle';

export type PublishFormErrors = Partial<Record<PublishField, string>>;

export type PublishValidationResult = { ok: true } | { ok: false; errors: PublishFormErrors };

type PublishValidationContext = {
  now: Date;
  canSchedule: boolean;
};

export function validatePublish(
  { visibility, scheduledAt, notification }: PublishOptions,
  { now, canSchedule }: PublishValidationContext
): PublishValidationResult {
  const errors: PublishFormErrors = {};

  if (visibility === 'scheduled') {
    if (!canSchedule) {
      errors.scheduledAt = '이미 공개 발행한 콘텐츠는 예약 발행할 수 없습니다.';
    } else if (scheduledAt == null) {
      errors.scheduledAt = '필수 정보입니다.';
    } else if (scheduledAt.getTime() < now.getTime()) {
      errors.scheduledAt = '시간을 다시 선택해주세요.';
    }
  }

  if (visibility !== 'private' && notification.send) {
    if (notification.title.trim() === '') {
      errors.notificationTitle = '알람 내용을 입력해주세요.';
    } else if (notification.title.length > MAX_NOTIFICATION_TITLE_LENGTH) {
      errors.notificationTitle = `알람 내용은 ${MAX_NOTIFICATION_TITLE_LENGTH}자 이하로 입력해주세요.`;
    }
  }

  if (Object.keys(errors).length === 0) {
    return { ok: true };
  }
  return { ok: false, errors };
}
