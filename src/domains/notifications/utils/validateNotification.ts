import { type TargetType } from '../../../api/notifications';

export type NotificationFormValues = {
  targetType: TargetType;
  title: string;
  scheduledAt: Date | null;
};

export type NotificationField = keyof NotificationFormValues;

export type NotificationFormErrors = Partial<Record<NotificationField, string>>;

export type NotificationValidationResult = { ok: true } | { ok: false; errors: NotificationFormErrors };

export const MAX_NOTIFICATION_TITLE_LENGTH = 50;

const REQUIRED_MESSAGE = '필수 정보입니다.';

export function validateNotification(
  { title, scheduledAt }: NotificationFormValues,
  now = new Date()
): NotificationValidationResult {
  const errors: NotificationFormErrors = {};

  if (title.trim() === '') {
    errors.title = REQUIRED_MESSAGE;
  } else if (title.length > MAX_NOTIFICATION_TITLE_LENGTH) {
    errors.title = `제목은 ${MAX_NOTIFICATION_TITLE_LENGTH}자 이하로 입력해주세요.`;
  }

  if (scheduledAt == null) {
    errors.scheduledAt = REQUIRED_MESSAGE;
  } else if (scheduledAt.getTime() < now.getTime()) {
    errors.scheduledAt = '시간을 다시 선택해주세요.';
  }

  if (Object.keys(errors).length === 0) {
    return { ok: true };
  }
  return { ok: false, errors };
}
