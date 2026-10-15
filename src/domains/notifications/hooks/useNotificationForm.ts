import { useState } from 'react';

import { type NotificationFormValues, validateNotification } from '../utils/validateNotification';

const INITIAL_VALUES: NotificationFormValues = { targetType: 'all', title: '', scheduledAt: null };

export function useNotificationForm() {
  const [values, setValues] = useState(INITIAL_VALUES);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const validation = validateNotification(values);
  const errors = isSubmitAttempted && !validation.ok ? validation.errors : {};
  const isDirty =
    values.targetType !== INITIAL_VALUES.targetType ||
    values.title !== INITIAL_VALUES.title ||
    values.scheduledAt !== INITIAL_VALUES.scheduledAt;

  function validate() {
    setIsSubmitAttempted(true);
    return validation.ok;
  }

  return { values, errors, isDirty, setValues, validate };
}
