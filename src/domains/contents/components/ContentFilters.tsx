import {
  CATEGORIES,
  type Category,
  CATEGORY_LABELS,
  PUBLISH_STATUS_LABELS,
  type PublishStatus,
} from '../../../api/contents';

const PUBLISH_STATUS_OPTIONS: PublishStatus[] = ['published', 'scheduled', 'draft'];

const SELECT_CLASS_NAME = 'h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700';

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
      <label>
        <span className="sr-only">카테고리</span>
        <select
          value={category ?? ''}
          onChange={event => onCategoryChange(CATEGORIES.find(option => option === event.target.value))}
          className={SELECT_CLASS_NAME}
        >
          <option value="">전체 카테고리</option>
          {CATEGORIES.map(option => (
            <option key={option} value={option}>
              {CATEGORY_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span className="sr-only">상태</span>
        <select
          value={publishStatus ?? ''}
          onChange={event =>
            onPublishStatusChange(PUBLISH_STATUS_OPTIONS.find(option => option === event.target.value))
          }
          className={SELECT_CLASS_NAME}
        >
          <option value="">전체 상태</option>
          {PUBLISH_STATUS_OPTIONS.map(option => (
            <option key={option} value={option}>
              {PUBLISH_STATUS_LABELS[option]}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
