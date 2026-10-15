import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { type ContentFormValues } from '../utils/contentFormValues';
import { clearDraft, loadDraft } from '../utils/draftStorage';
import { AUTOSAVE_INTERVAL_MS, useDraftAutosave } from './useDraftAutosave';

const EMPTY_VALUES: ContentFormValues = { categories: [], title: '', body: '', linkUrl: null };
const TYPED_VALUES: ContentFormValues = { categories: ['realty'], title: '작성 중인 글', body: '본문', linkUrl: null };

function renderAutosave(initialValues: ContentFormValues, enabled = true) {
  return renderHook(({ values }) => useDraftAutosave(values, { enabled }), { initialProps: { values: initialValues } });
}

function waitAutosaveInterval() {
  act(() => {
    vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS);
  });
}

describe('useDraftAutosave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('작성 내용이 바뀌면 30초 뒤에 자동으로 임시저장된다', () => {
    const { result, rerender } = renderAutosave(EMPTY_VALUES);
    rerender({ values: TYPED_VALUES });

    act(() => {
      vi.advanceTimersByTime(AUTOSAVE_INTERVAL_MS - 1);
    });
    expect(loadDraft()).toBeNull();

    waitAutosaveInterval();
    expect(loadDraft()?.values).toEqual(TYPED_VALUES);
    expect(result.current.lastSavedAt).not.toBeNull();
  });

  it('마지막 임시저장 이후 내용이 바뀌지 않았으면 다시 저장하지 않는다', () => {
    const { rerender } = renderAutosave(EMPTY_VALUES);
    rerender({ values: TYPED_VALUES });
    waitAutosaveInterval();
    clearDraft();

    rerender({ values: { ...TYPED_VALUES } });
    waitAutosaveInterval();

    expect(loadDraft()).toBeNull();
  });

  it('작성 내용을 모두 지운 빈 폼은 자동 임시저장하지 않는다', () => {
    const { rerender } = renderAutosave(TYPED_VALUES);
    rerender({ values: EMPTY_VALUES });

    waitAutosaveInterval();

    expect(loadDraft()).toBeNull();
  });

  it('임시저장을 쓰지 않는 화면에서는 자동 임시저장하지 않는다', () => {
    const { rerender } = renderAutosave(EMPTY_VALUES, false);
    rerender({ values: TYPED_VALUES });

    waitAutosaveInterval();

    expect(loadDraft()).toBeNull();
  });

  it('임시저장 버튼을 누르면 30초를 기다리지 않고 바로 저장된다', () => {
    const { result } = renderAutosave(TYPED_VALUES);

    let isSaved = false;
    act(() => {
      isSaved = result.current.saveNow();
    });

    expect(isSaved).toBe(true);
    expect(loadDraft()?.values).toEqual(TYPED_VALUES);
    expect(result.current.lastSavedAt).not.toBeNull();
  });

  it('빈 폼에서 임시저장 버튼을 누르면 저장하지 않고 실패를 알린다', () => {
    const { result } = renderAutosave(EMPTY_VALUES);

    let isSaved = true;
    act(() => {
      isSaved = result.current.saveNow();
    });

    expect(isSaved).toBe(false);
    expect(loadDraft()).toBeNull();
  });
});
