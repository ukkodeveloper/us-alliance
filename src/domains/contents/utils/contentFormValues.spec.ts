import { describe, expect, it } from 'vitest';

import { type Content } from '../../../api/contents';
import {
  EMPTY_CONTENT_FORM_VALUES,
  isEmptyContentForm,
  toContentFormValues,
  toContentRequest,
  toUpdateContentRequest,
} from './contentFormValues';

const CONTENT: Content = {
  id: 1,
  user_id: 1,
  title: '오늘의 시장 정리',
  body: '코스피가 상승 마감했습니다.',
  categories: ['domesticStock'],
  link_url: 'https://example.com',
  status: 'public',
  publish_status: 'published',
  created_at: '2026-10-15T00:00:00Z',
  updated_at: '2026-10-15T00:00:00Z',
};

describe('contentFormValues', () => {
  it('수정할 콘텐츠를 열면 저장된 카테고리·제목·내용·링크가 채워진다', () => {
    expect(toContentFormValues(CONTENT)).toEqual({
      categories: ['domesticStock'],
      title: '오늘의 시장 정리',
      body: '코스피가 상승 마감했습니다.',
      linkUrl: 'https://example.com',
    });
  });

  it('링크가 빈 문자열인 콘텐츠를 열면 삽입된 링크가 없는 상태가 된다', () => {
    expect(toContentFormValues({ ...CONTENT, link_url: '' }).linkUrl).toBeNull();
  });

  it('링크를 삽입하지 않고 저장하면 요청에서 link_url을 뺀다', () => {
    expect(toContentRequest({ ...toContentFormValues(CONTENT), linkUrl: null })).toEqual({
      title: '오늘의 시장 정리',
      body: '코스피가 상승 마감했습니다.',
      categories: ['domesticStock'],
    });
  });

  it('링크를 삽입하고 저장하면 요청에 link_url을 담는다', () => {
    expect(toContentRequest(toContentFormValues(CONTENT)).link_url).toBe('https://example.com');
  });

  it('수정할 때 링크를 지우면 link_url을 빈 문자열로 보내 서버의 링크를 지운다', () => {
    expect(toUpdateContentRequest({ ...toContentFormValues(CONTENT), linkUrl: null }).link_url).toBe('');
  });

  it('공백만 입력한 폼은 빈 폼으로 본다', () => {
    expect(isEmptyContentForm({ ...EMPTY_CONTENT_FORM_VALUES, title: '  ', body: '\n' })).toBe(true);
  });

  it('카테고리만 선택해도 빈 폼이 아니다', () => {
    expect(isEmptyContentForm({ ...EMPTY_CONTENT_FORM_VALUES, categories: ['realty'] })).toBe(false);
  });
});
