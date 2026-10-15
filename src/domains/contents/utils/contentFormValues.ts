import {
  type Category,
  type Content,
  type CreateContentRequest,
  type UpdateContentRequest,
} from '../../../api/contents';

export type ContentFormValues = {
  categories: Category[];
  title: string;
  body: string;
  linkUrl: string | null;
};

export const EMPTY_CONTENT_FORM_VALUES: ContentFormValues = {
  categories: [],
  title: '',
  body: '',
  linkUrl: null,
};

export function toContentFormValues({ categories, title, body, link_url }: Content): ContentFormValues {
  return {
    categories,
    title,
    body,
    linkUrl: link_url != null && link_url !== '' ? link_url : null,
  };
}

export function toContentRequest({ categories, title, body, linkUrl }: ContentFormValues): CreateContentRequest {
  const request = { title: title.trim(), body: body.trim(), categories };
  if (linkUrl == null) {
    return request;
  }
  return { ...request, link_url: linkUrl };
}

export function toUpdateContentRequest(values: ContentFormValues): UpdateContentRequest {
  return { ...toContentRequest(values), link_url: values.linkUrl ?? '' };
}

export function isEmptyContentForm({ categories, title, body, linkUrl }: ContentFormValues) {
  return categories.length === 0 && title.trim() === '' && body.trim() === '' && linkUrl == null;
}
