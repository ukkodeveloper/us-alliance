import { expect, test } from '@playwright/test';

import { createState, mockApi } from './mockApi';

test('F2 목록 호버 → 알람 작성 → 필수 검증 → 이탈 확인 → 발송', async ({ page }, testInfo) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/');

  const row = page.getByRole('row', { name: /60화/ });
  await row.hover();
  await row.getByRole('link', { name: '푸시알림 생성' }).click();
  await expect(page).toHaveURL(/\/notifications\/new\?contentId=7/);

  await page.getByRole('button', { name: '발송하기' }).click();
  await expect(page.getByText('필수 정보입니다.').first()).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('f2-required.png') });

  await page.getByRole('radio', { name: '팔로워' }).check();
  await page.getByRole('textbox', { name: '제목' }).fill('신규 콘텐츠 알림');
  await page.getByLabel('시간').fill('2027년 01월 15일 10시 00분');
  await page.keyboard.press('Tab');

  await page.getByRole('button', { name: '뒤로 가기' }).click();
  const dialog = page.getByRole('dialog', { name: '작성을 종료하시겠습니까?' });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('f2-leave-confirm.png') });
  await dialog.getByRole('button', { name: '아니오' }).click();
  await expect(dialog).toBeHidden();
  await expect(page).toHaveURL(/\/notifications\/new/);

  await page.getByRole('button', { name: '발송하기' }).click();
  await expect(page).toHaveURL(/tab=notifications/);
  const created = state.requests.find(item => item.method === 'POST' && item.path === '/api/v1/notifications');
  expect(created?.body).toEqual({
    content_id: 7,
    title: '신규 콘텐츠 알림',
    target_type: 'follower',
    scheduled_at: '2027-01-15T10:00:00+09:00',
  });
  await expect(page.getByRole('cell', { name: '신규 콘텐츠 알림' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('f2-list.png') });
});

test('F2 이미 알람이 있는 콘텐츠면 409 문구를 보여준다', async ({ page }) => {
  const state = createState();
  state.failNext = { method: 'POST', pathIncludes: '/notifications', status: 409, error: 'notification already exists' };
  await mockApi(page, state);
  await page.goto('/notifications/new?contentId=7');
  await page.getByRole('textbox', { name: '제목' }).fill('중복 알림');
  await page.getByLabel('시간').fill('2027년 01월 15일 10시 00분');
  await page.keyboard.press('Tab');
  await page.getByRole('button', { name: '발송하기' }).click();
  await expect(page.getByRole('alert')).toHaveText('이미 알람이 등록된 콘텐츠입니다.');
});

test('임시저장 → 새글쓰기 모달 이어쓰기로 복원', async ({ page }) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/');
  await page.getByRole('button', { name: '+ 새 글쓰기' }).click();
  await page.getByRole('button', { name: /콘텐츠 쓰기/ }).click();
  await expect(page).toHaveURL(/\/contents\/new$/);

  await page.getByRole('checkbox', { name: '부동산' }).check();
  await page.getByRole('textbox', { name: '제목' }).fill('임시 제목');
  await page.getByRole('button', { name: '임시저장' }).click();
  await expect(page.getByRole('status')).toContainText('임시저장됨');
  await page.getByRole('button', { name: '뒤로 가기' }).click();

  await page.getByRole('button', { name: '+ 새 글쓰기' }).click();
  await page.getByRole('button', { name: /임시 저장된 콘텐츠 이어서 쓰기/ }).click();
  await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('임시 제목');
  await expect(page.getByRole('checkbox', { name: '부동산' })).toBeChecked();
});
