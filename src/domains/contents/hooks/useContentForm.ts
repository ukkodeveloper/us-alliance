import { useState } from 'react';

import { type ContentFormValues } from '../utils/contentFormValues';
import { validateContent } from '../utils/validateContent';

export function useContentForm(initialValues: ContentFormValues) {
  const [values, setValues] = useState(initialValues);
  const [isSubmitAttempted, setIsSubmitAttempted] = useState(false);

  const validation = validateContent(values);
  const errors = isSubmitAttempted && !validation.ok ? validation.errors : {};

  function validate() {
    setIsSubmitAttempted(true);
    return validation.ok;
  }

  return { values, errors, setValues, validate };
}
