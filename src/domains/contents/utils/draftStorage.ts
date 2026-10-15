import { CATEGORIES, type Category } from '../../../api/contents';
import { type ContentFormValues } from './contentFormValues';

type Draft = {
  values: ContentFormValues;
  savedAt: Date;
};

const DRAFT_STORAGE_KEY = 'us-alliance:content-draft';

export function saveDraft(values: ContentFormValues, savedAt = new Date()): void {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ values, savedAt: savedAt.toISOString() }));
}

export function loadDraft(): Draft | null {
  const storedValue = localStorage.getItem(DRAFT_STORAGE_KEY);
  if (storedValue == null) {
    return null;
  }

  try {
    const parsed: unknown = JSON.parse(storedValue);
    if (!isStoredDraft(parsed)) {
      return null;
    }
    const savedAt = new Date(parsed.savedAt);
    return Number.isNaN(savedAt.getTime()) ? null : { values: parsed.values, savedAt };
  } catch {
    return null;
  }
}

export function clearDraft(): void {
  localStorage.removeItem(DRAFT_STORAGE_KEY);
}

function isStoredDraft(value: unknown): value is { values: ContentFormValues; savedAt: string } {
  return (
    typeof value === 'object' &&
    value != null &&
    'savedAt' in value &&
    typeof value.savedAt === 'string' &&
    'values' in value &&
    isContentFormValues(value.values)
  );
}

function isContentFormValues(value: unknown): value is ContentFormValues {
  return (
    typeof value === 'object' &&
    value != null &&
    'categories' in value &&
    Array.isArray(value.categories) &&
    value.categories.every(isCategory) &&
    'title' in value &&
    typeof value.title === 'string' &&
    'body' in value &&
    typeof value.body === 'string' &&
    'linkUrl' in value &&
    (value.linkUrl === null || typeof value.linkUrl === 'string')
  );
}

function isCategory(value: unknown): value is Category {
  return CATEGORIES.some(category => category === value);
}
