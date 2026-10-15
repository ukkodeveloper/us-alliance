import { Textarea } from '../../../components/Textarea';
import { TextField } from '../../../components/TextField';
import { type ContentFormValues } from '../utils/contentFormValues';
import { type ContentFormErrors, MAX_BODY_LENGTH, MAX_TITLE_LENGTH } from '../utils/validateContent';
import { CategoryChips } from './CategoryChips';
import { LinkField } from './LinkField';

type ContentFormProps = {
  values: ContentFormValues;
  errors: ContentFormErrors;
  onChange: (values: ContentFormValues) => void;
};

export function ContentForm({ values, errors, onChange }: ContentFormProps) {
  return (
    <form noValidate onSubmit={event => event.preventDefault()} className="flex flex-col gap-8">
      <CategoryChips
        selected={values.categories}
        error={errors.categories}
        onChange={categories => onChange({ ...values, categories })}
      />
      <hr className="border-gray-100" />
      <div className="flex flex-col gap-6">
        <TextField
          label="제목"
          placeholder={`제목을 입력해주세요. (최대 ${MAX_TITLE_LENGTH}자)`}
          maxLength={MAX_TITLE_LENGTH}
          value={values.title}
          error={errors.title}
          onChange={event => onChange({ ...values, title: event.target.value })}
        />
        <Textarea
          label="내용"
          placeholder={`내용을 입력해주세요 (최대 ${MAX_BODY_LENGTH}자)`}
          maxLength={MAX_BODY_LENGTH}
          value={values.body}
          error={errors.body}
          onChange={event => onChange({ ...values, body: event.target.value })}
        />
      </div>
      <hr className="border-gray-100" />
      <LinkField
        linkUrl={values.linkUrl}
        error={errors.linkUrl}
        onLinkUrlChange={linkUrl => onChange({ ...values, linkUrl })}
      />
    </form>
  );
}
