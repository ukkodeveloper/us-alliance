import { describe, expect, it } from 'vitest';

import { type ContentFormValues } from './contentFormValues';
import { validateContent } from './validateContent';

const VALID_VALUES: ContentFormValues = {
  categories: ['domesticStock'],
  title: '오늘의 시장 정리',
  body: '코스피가 상승 마감했습니다.',
  linkUrl: null,
};

describe('validateContent', () => {
  it('아무것도 입력하지 않으면 카테고리·제목·내용 입력을 요청한다', () => {
    expect(validateContent({ categories: [], title: '', body: '', linkUrl: null })).toEqual({
      ok: false,
      errors: {
        categories: '카테고리를 1개 이상 선택해주세요.',
        title: '제목을 입력해주세요.',
        body: '내용을 입력해주세요.',
      },
    });
  });

  it('카테고리 1개와 제목·내용을 입력하면 통과한다', () => {
    expect(validateContent(VALID_VALUES)).toEqual({ ok: true });
  });

  it('카테고리를 3개 선택하면 통과한다', () => {
    expect(validateContent({ ...VALID_VALUES, categories: ['domesticStock', 'foreignStock', 'realty'] })).toEqual({
      ok: true,
    });
  });

  it('카테고리를 4개 선택하면 최대 3개까지라고 알려준다', () => {
    expect(
      validateContent({ ...VALID_VALUES, categories: ['domesticStock', 'foreignStock', 'realty', 'investment'] })
    ).toEqual({ ok: false, errors: { categories: '카테고리는 최대 3개까지 선택할 수 있습니다.' } });
  });

  it('제목에 공백만 입력하면 제목 입력을 요청한다', () => {
    expect(validateContent({ ...VALID_VALUES, title: '   ' })).toEqual({
      ok: false,
      errors: { title: '제목을 입력해주세요.' },
    });
  });

  it('제목을 50자 입력하면 통과한다', () => {
    expect(validateContent({ ...VALID_VALUES, title: 'a'.repeat(50) })).toEqual({ ok: true });
  });

  it('제목을 51자 입력하면 50자 이하를 요청한다', () => {
    expect(validateContent({ ...VALID_VALUES, title: 'a'.repeat(51) })).toEqual({
      ok: false,
      errors: { title: '제목은 50자 이하로 입력해주세요.' },
    });
  });

  it('내용에 공백만 입력하면 내용 입력을 요청한다', () => {
    expect(validateContent({ ...VALID_VALUES, body: '\n  ' })).toEqual({
      ok: false,
      errors: { body: '내용을 입력해주세요.' },
    });
  });

  it('내용을 500자 입력하면 통과하고 501자는 500자 이하를 요청한다', () => {
    expect(validateContent({ ...VALID_VALUES, body: 'a'.repeat(500) })).toEqual({ ok: true });
    expect(validateContent({ ...VALID_VALUES, body: 'a'.repeat(501) })).toEqual({
      ok: false,
      errors: { body: '내용은 500자 이하로 입력해주세요.' },
    });
  });

  it('https 링크가 삽입되어 있으면 통과한다', () => {
    expect(validateContent({ ...VALID_VALUES, linkUrl: 'https://example.com' })).toEqual({ ok: true });
  });

  it('javascript: 링크가 들어 있으면 http·https만 허용한다고 알려준다', () => {
    expect(validateContent({ ...VALID_VALUES, linkUrl: 'javascript:alert(1)' })).toEqual({
      ok: false,
      errors: { linkUrl: 'http 또는 https로 시작하는 링크만 삽입할 수 있습니다.' },
    });
  });
});
