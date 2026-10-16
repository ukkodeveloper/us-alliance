import { queryOptions } from '@tanstack/react-query';

import { type ErrorMessageByStatus, request } from './http';
import type { Notification, SendStatus } from './notifications';

export const CONTENT_PAGE_SIZE = 10;

export const CATEGORIES = [
  'secondaryBattery',
  'macroEconomics',
  'economicTheory',
  'domesticStock',
  'companyAnalysis',
  'safeAsset',
  'cryptoCurrency',
  'personalFinance',
  'realty',
  'investment',
  'foreignStock',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  secondaryBattery: '2차전지',
  realty: '부동산',
  investment: '투자기법',
  domesticStock: '국내주식',
  economicTheory: '경제원론',
  foreignStock: '해외주식',
  cryptoCurrency: '암호화폐',
  companyAnalysis: '기업분석',
  macroEconomics: '거시경제',
  personalFinance: '재테크',
  safeAsset: '안전자산',
};

export type ContentStatus = 'public' | 'private';

export const CONTENT_ERROR_MESSAGES: ErrorMessageByStatus = {
  403: '이 콘텐츠에 대한 권한이 없습니다.',
  404: '콘텐츠를 찾을 수 없습니다.',
};

export const PUBLISH_STATUSES = ['published', 'scheduled', 'draft'] as const;

export type PublishStatus = (typeof PUBLISH_STATUSES)[number];

export const PUBLISH_STATUS_LABELS: Record<PublishStatus, string> = {
  draft: '비공개',
  scheduled: '예약',
  published: '공개',
};

export type ContentNotificationStatus = {
  has_notification: boolean;
  send_status: SendStatus;
};

export type Content = {
  id: number;
  user_id: number;
  title: string;
  body: string;
  categories: Category[];
  link_url?: string | null;
  status: ContentStatus;
  publish_status: PublishStatus;
  published_at?: string | null;
  notification_status?: ContentNotificationStatus | null;
  created_at: string;
  updated_at: string;
};

export type ContentList = {
  contents: Content[];
  page: number;
  limit: number;
  total: number;
};

export type ContentSchedule = {
  content_id: number;
  is_scheduled: boolean;
  published_at?: string | null;
};

export type ContentListParams = {
  page: number;
  limit: number;
  category?: Category;
  publish_status?: PublishStatus;
};

export type CreateContentRequest = {
  title: string;
  body: string;
  categories: Category[];
  link_url?: string;
};

export type UpdateContentRequest = Partial<CreateContentRequest>;

export type ContentScheduleRequest = {
  published_at: string;
};

export type ChangeContentStatusRequest = {
  status: ContentStatus;
};

export function getContents({ page, limit, category, publish_status }: ContentListParams): Promise<ContentList> {
  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (category != null) {
    searchParams.set('category', category);
  }
  if (publish_status != null) {
    searchParams.set('publish_status', publish_status);
  }
  return request<ContentList>(`/api/v1/contents?${searchParams.toString()}`);
}

export function getContent(id: number): Promise<Content> {
  return request<Content>(`/api/v1/contents/${id}`);
}

export function createContent(body: CreateContentRequest): Promise<Content> {
  return request<Content>('/api/v1/contents', { method: 'POST', json: body });
}

export function updateContent(id: number, body: UpdateContentRequest): Promise<Content> {
  return request<Content>(`/api/v1/contents/${id}`, { method: 'PUT', json: body });
}

export function getContentSchedule(id: number): Promise<ContentSchedule> {
  return request<ContentSchedule>(`/api/v1/contents/${id}/schedule`);
}

export function createContentSchedule(id: number, body: ContentScheduleRequest): Promise<Content> {
  return request<Content>(`/api/v1/contents/${id}/schedule`, { method: 'POST', json: body });
}

export function updateContentSchedule(id: number, body: ContentScheduleRequest): Promise<ContentSchedule> {
  return request<ContentSchedule>(`/api/v1/contents/${id}/schedule`, { method: 'PUT', json: body });
}

export function deleteContentSchedule(id: number): Promise<ContentSchedule> {
  return request<ContentSchedule>(`/api/v1/contents/${id}/schedule`, { method: 'DELETE' });
}

export function changeContentStatus(id: number, body: ChangeContentStatusRequest): Promise<Content> {
  return request<Content>(`/api/v1/contents/${id}/status`, { method: 'PATCH', json: body });
}

export function getContentNotification(id: number): Promise<Notification | null> {
  return request<Notification | null>(`/api/v1/contents/${id}/notification`);
}

export const contentQueries = {
  list: (params: ContentListParams) =>
    queryOptions({
      queryKey: ['contents', 'list', params],
      queryFn: () => getContents(params),
    }),
  detail: (id: number) =>
    queryOptions({
      queryKey: ['contents', 'detail', id],
      queryFn: () => getContent(id),
    }),
  schedule: (id: number) =>
    queryOptions({
      queryKey: ['contents', 'detail', id, 'schedule'],
      queryFn: () => getContentSchedule(id),
    }),
  notification: (id: number) =>
    queryOptions({
      queryKey: ['contents', 'detail', id, 'notification'],
      queryFn: () => getContentNotification(id),
    }),
};
