import { beforeEach, describe, expect, it } from 'vitest';

import { type ContentFormValues } from './contentFormValues';
import { clearDraft, loadDraft, saveDraft } from './draftStorage';

const DRAFT_STORAGE_KEY = 'us-alliance:content-draft';
const SAVED_AT = new Date('2024-07-11T17:11:00+09:00');

const FIRST_VALUES: ContentFormValues = {
  categories: ['domesticStock', 'realty'],
  title: '첫 번째 글',
  body: '본문',
  linkUrl: 'https://example.com',
};

const SECOND_VALUES: ContentFormValues = {
  categories: [],
  title: '두 번째 글',
  body: '',
  linkUrl: null,
};

function storeRaw(value: unknown) {
  localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
}

describe('draftStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('임시저장한 내용과 저장 시각을 다시 불러올 수 있다', () => {
    saveDraft(FIRST_VALUES, SAVED_AT);

    expect(loadDraft()).toEqual({ values: FIRST_VALUES, savedAt: SAVED_AT });
  });

  it('임시저장한 적이 없으면 불러올 내용이 없다', () => {
    expect(loadDraft()).toBeNull();
  });

  it('다른 글을 임시저장하면 이전 임시저장을 덮어쓴다', () => {
    saveDraft(FIRST_VALUES, SAVED_AT);
    const laterSavedAt = new Date('2024-07-12T09:00:00+09:00');

    saveDraft(SECOND_VALUES, laterSavedAt);

    expect(loadDraft()).toEqual({ values: SECOND_VALUES, savedAt: laterSavedAt });
  });

  it('임시저장을 지우면 불러올 내용이 없다', () => {
    saveDraft(FIRST_VALUES, SAVED_AT);

    clearDraft();

    expect(loadDraft()).toBeNull();
  });

  it('저장된 값이 JSON이 아니면 임시저장이 없는 것으로 본다', () => {
    localStorage.setItem(DRAFT_STORAGE_KEY, 'not-json');

    expect(loadDraft()).toBeNull();
  });

  it('저장된 값에 필드가 빠져 있으면 임시저장이 없는 것으로 본다', () => {
    storeRaw({ values: { title: '제목', body: '본문', linkUrl: null }, savedAt: SAVED_AT.toISOString() });

    expect(loadDraft()).toBeNull();
  });

  it('알 수 없는 카테고리가 들어 있으면 임시저장이 없는 것으로 본다', () => {
    storeRaw({ values: { ...FIRST_VALUES, categories: ['unknown'] }, savedAt: SAVED_AT.toISOString() });

    expect(loadDraft()).toBeNull();
  });

  it('저장 시각을 해석할 수 없으면 임시저장이 없는 것으로 본다', () => {
    storeRaw({ values: FIRST_VALUES, savedAt: 'yesterday' });

    expect(loadDraft()).toBeNull();
  });
});
