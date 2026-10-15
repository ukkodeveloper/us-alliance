import { MAX_NOTIFICATION_TITLE_LENGTH, TARGET_TYPE_LABELS, TARGET_TYPES } from '../../../api/notifications';
import { DateTimeField } from '../../../components/DateTimeField';
import { RadioGroup } from '../../../components/RadioGroup';
import { TextField } from '../../../components/TextField';
import { type NotificationFormErrors, type NotificationFormValues } from '../utils/validateNotification';

const TARGET_TYPE_OPTIONS = TARGET_TYPES.map(value => ({ value, label: TARGET_TYPE_LABELS[value] }));

type NotificationFormProps = {
  values: NotificationFormValues;
  errors: NotificationFormErrors;
  onChange: (values: NotificationFormValues) => void;
};

export function NotificationForm({ values, errors, onChange }: NotificationFormProps) {
  return (
    <form noValidate onSubmit={event => event.preventDefault()} className="flex flex-col gap-8">
      <RadioGroup
        name="targetType"
        label="대상자"
        options={TARGET_TYPE_OPTIONS}
        value={values.targetType}
        onChange={targetType => onChange({ ...values, targetType })}
      />
      <TextField
        label="제목"
        placeholder={`제목을 입력해주세요. (최대 ${MAX_NOTIFICATION_TITLE_LENGTH}자)`}
        maxLength={MAX_NOTIFICATION_TITLE_LENGTH}
        value={values.title}
        error={errors.title}
        onChange={event => onChange({ ...values, title: event.target.value })}
      />
      <DateTimeField
        label="시간"
        placeholder="날짜를 입력해주세요"
        value={values.scheduledAt}
        error={errors.scheduledAt}
        onChange={scheduledAt => onChange({ ...values, scheduledAt })}
      />
    </form>
  );
}
