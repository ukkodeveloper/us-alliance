import { type ChangeEvent, type ReactNode } from 'react';

import {
  CATEGORIES,
  type Category,
  CATEGORY_LABELS,
  PUBLISH_STATUS_LABELS,
  PUBLISH_STATUSES,
  type PublishStatus,
} from '../../../api/contents';

type ContentFiltersProps = {
  category?: Category;
  publishStatus?: PublishStatus;
  onCategoryChange: (category: Category | undefined) => void;
  onPublishStatusChange: (publishStatus: PublishStatus | undefined) => void;
};

export function ContentFilters({
  category,
  publishStatus,
  onCategoryChange,
  onPublishStatusChange,
}: ContentFiltersProps) {
  return (
    <div className="flex flex-wrap justify-end gap-2">
      <FilterSelect
        label="카테고리"
        value={category ?? ''}
        onChange={event => onCategoryChange(CATEGORIES.find(option => option === event.target.value))}
      >
        <option value="">전체 카테고리</option>
        {CATEGORIES.map(option => (
          <option key={option} value={option}>
            {CATEGORY_LABELS[option]}
          </option>
        ))}
      </FilterSelect>
      <FilterSelect
        label="상태"
        value={publishStatus ?? ''}
        onChange={event => onPublishStatusChange(PUBLISH_STATUSES.find(option => option === event.target.value))}
      >
        <option value="">전체 상태</option>
        {PUBLISH_STATUSES.map(option => (
          <option key={option} value={option}>
            {PUBLISH_STATUS_LABELS[option]}
          </option>
        ))}
      </FilterSelect>
    </div>
  );
}

type FilterSelectProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  children: ReactNode;
};

function FilterSelect({ label, value, onChange, children }: FilterSelectProps) {
  return (
    <label className="relative">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={onChange}
        className="h-9 appearance-none rounded-lg border border-gray-200 bg-white pr-9 pl-3 text-sm text-gray-700"
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-gray-500"
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </label>
  );
}
