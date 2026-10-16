import { expect, test } from '@playwright/test';

import { createState, mockApi } from './mockApi';

async function openPublishModalForNewContent(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: '+ 새 글쓰기' }).click();
  await page.getByRole('button', { name: /콘텐츠 쓰기/ }).click();
  await page.getByRole('checkbox', { name: '국내주식' }).check();
  await page.getByRole('textbox', { name: '제목' }).fill('리뷰 수정 확인');
  await page.getByLabel('내용').fill('본문');
  await page.getByRole('banner').getByRole('button', { name: '발행하기' }).click();
  const dialog = page.getByRole('dialog', { name: '발행하기' });
  await expect(dialog).toBeVisible();
  return dialog;
}

test('R3 발행 모달이 열린 동안 헤더 발행하기는 비활성', async ({ page }) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/');
  await openPublishModalForNewContent(page);
  await expect(page.getByRole('banner').getByRole('button', { name: '발행하기' })).toBeDisabled();
  expect(state.requests.filter(r => r.method === 'POST' && r.path === '/api/v1/contents')).toHaveLength(1);
});

test('R4 발행 요청 중에는 ESC·취소로 모달이 닫히지 않는다', async ({ page }) => {
  const state = createState();
  await mockApi(page, state);
  let release: () => void = () => undefined;
  const gate = new Promise<void>(resolve => (release = resolve));
  await page.route('**/api/v1/contents/*/status', async route => {
    await gate;
    await route.fallback();
  });
  await page.goto('/');
  const dialog = await openPublishModalForNewContent(page);
  await dialog.getByRole('radio', { name: '미발송' }).check();
  await dialog.getByRole('button', { name: '발행하기' }).click();

  await expect(dialog.getByRole('button', { name: '취소' })).toBeDisabled();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/contents\/new/);

  release();
  await expect(page).toHaveURL(/\/$/);
});

test('R10 잘못된 콘텐츠 주소는 API를 부르지 않고 안내한다', async ({ page }) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/contents/abc/edit');
  await expect(page.getByRole('alert')).toContainText('콘텐츠를 찾을 수 없습니다.');
  await expect(page.getByRole('link', { name: '목록으로 돌아가기' })).toBeVisible();
  expect(state.requests.filter(r => r.path.includes('NaN'))).toHaveLength(0);
});
