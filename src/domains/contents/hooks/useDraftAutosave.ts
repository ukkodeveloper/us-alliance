import { useEffect, useEffectEvent, useRef, useState } from 'react';

import { type ContentFormValues, isEmptyContentForm } from '../utils/contentFormValues';
import { saveDraft } from '../utils/draftStorage';

export const AUTOSAVE_INTERVAL_MS = 30_000;

type DraftAutosaveOptions = {
  enabled: boolean;
};

export function useDraftAutosave(values: ContentFormValues, { enabled }: DraftAutosaveOptions) {
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const lastSavedValuesRef = useRef(values);

  function persist(valuesToSave: ContentFormValues) {
    const savedAt = new Date();
    saveDraft(valuesToSave, savedAt);
    lastSavedValuesRef.current = valuesToSave;
    setLastSavedAt(savedAt);
  }

  function saveNow() {
    if (isEmptyContentForm(values)) {
      return false;
    }
    persist(values);
    return true;
  }

  const autosaveIfChanged = useEffectEvent(() => {
    if (isSameContentForm(values, lastSavedValuesRef.current) || isEmptyContentForm(values)) {
      return;
    }
    persist(values);
  });

  useEffect(
    function autosaveDraftPeriodically() {
      if (!enabled) {
        return;
      }
      const intervalId = setInterval(autosaveIfChanged, AUTOSAVE_INTERVAL_MS);
      return () => clearInterval(intervalId);
    },
    [enabled]
  );

  return { lastSavedAt, saveNow };
}

function isSameContentForm(a: ContentFormValues, b: ContentFormValues) {
  return (
    a.title === b.title &&
    a.body === b.body &&
    a.linkUrl === b.linkUrl &&
    a.categories.length === b.categories.length &&
    a.categories.every((category, index) => category === b.categories[index])
  );
}
