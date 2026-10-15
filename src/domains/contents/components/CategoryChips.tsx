import { CATEGORIES, type Category, CATEGORY_LABELS } from '../../../api/contents';
import { Checkbox } from '../../../components/Checkbox';
import { MAX_CATEGORY_COUNT } from '../utils/validateContent';

type CategoryChipsProps = {
  selected: Category[];
  error?: string;
  onChange: (categories: Category[]) => void;
};

export function CategoryChips({ selected, error, onChange }: CategoryChipsProps) {
  const isFull = selected.length >= MAX_CATEGORY_COUNT;

  function handleToggle(category: Category) {
    if (selected.includes(category)) {
      onChange(selected.filter(selectedCategory => selectedCategory !== category));
      return;
    }
    onChange([...selected, category]);
  }

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-gray-900">카테고리</legend>
      <p className="text-xs text-gray-500">
        카테고리를 선택하여 발행할 커뮤니티 글 분야를 선택해 보세요 (최대{MAX_CATEGORY_COUNT}개)
      </p>
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(category => {
          const isChecked = selected.includes(category);
          return (
            <Checkbox
              key={category}
              variant="chip"
              label={CATEGORY_LABELS[category]}
              checked={isChecked}
              disabled={!isChecked && isFull}
              onChange={() => handleToggle(category)}
            />
          );
        })}
      </div>
      {error != null && <p className="text-xs text-danger">{error}</p>}
    </fieldset>
  );
}
