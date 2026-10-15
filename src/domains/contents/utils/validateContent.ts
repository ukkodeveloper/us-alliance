import { type ContentFormValues } from './contentFormValues';
import { isValidLinkUrl } from './isValidLinkUrl';

export type ContentField = keyof ContentFormValues;

export type ContentFormErrors = Partial<Record<ContentField, string>>;

export type ContentValidationResult = { ok: true } | { ok: false; errors: ContentFormErrors };

export const MAX_CATEGORY_COUNT = 3;
export const MAX_TITLE_LENGTH = 50;
export const MAX_BODY_LENGTH = 500;

export function validateContent({ categories, title, body, linkUrl }: ContentFormValues): ContentValidationResult {
  const errors: ContentFormErrors = {};

  if (categories.length === 0) {
    errors.categories = '카테고리를 1개 이상 선택해주세요.';
  } else if (categories.length > MAX_CATEGORY_COUNT) {
    errors.categories = `카테고리는 최대 ${MAX_CATEGORY_COUNT}개까지 선택할 수 있습니다.`;
  }

  if (title.trim() === '') {
    errors.title = '제목을 입력해주세요.';
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `제목은 ${MAX_TITLE_LENGTH}자 이하로 입력해주세요.`;
  }

  if (body.trim() === '') {
    errors.body = '내용을 입력해주세요.';
  } else if (body.length > MAX_BODY_LENGTH) {
    errors.body = `내용은 ${MAX_BODY_LENGTH}자 이하로 입력해주세요.`;
  }

  if (linkUrl != null && !isValidLinkUrl(linkUrl)) {
    errors.linkUrl = 'http 또는 https로 시작하는 링크만 삽입할 수 있습니다.';
  }

  if (Object.keys(errors).length === 0) {
    return { ok: true };
  }
  return { ok: false, errors };
}
