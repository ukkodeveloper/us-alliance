import { expect, type Page, test } from '@playwright/test';

import { createState, mockApi, type MockState } from './mockApi';

const SCHEDULE_TEXT = '2027년 01월 15일 10시 00분';
const SCHEDULE_ISO = '2027-01-15T10:00:00+09:00';

async function writeNewContent(page: Page) {
  await page.getByRole('button', { name: '+ 새 글쓰기' }).click();
  await page.getByRole('button', { name: /콘텐츠 쓰기/ }).click();
  await page.getByRole('checkbox', { name: '국내주식' }).check();
  await page.getByRole('checkbox', { name: '재테크' }).check();
  await page.getByRole('textbox', { name: '제목' }).fill('금리 인하 이후 시장 전망');
  await page.getByLabel('내용').fill('이번 주 금리 결정과 시장 반응을 정리합니다.');
  await page.getByRole('button', { name: '발행하기' }).click();
}

async function chooseScheduledWithNotification(page: Page) {
  const dialog = page.getByRole('dialog', { name: '발행하기' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('radio', { name: '예약 발행' }).check();
  await dialog.getByRole('textbox', { name: '예약 발행' }).fill(SCHEDULE_TEXT);
  await page.keyboard.press('Escape');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('radio', { name: '발송', exact: true }).check();
  await dialog.getByRole('radio', { name: '멤버십' }).check();
  await dialog.getByRole('checkbox', { name: '콘텐츠 제목 사용' }).check();
  return dialog;
}

function apiCalls(state: MockState) {
  return state.requests.filter(item => item.method !== 'GET').map(item => `${item.method} ${item.path}`);
}

test('F1 로그인 → 새 글 작성 → 예약 발행 + 알람 → 목록에서 예약 배지', async ({ page }, testInfo) => {
  const state = createState();
  await mockApi(page, state, { loggedIn: false });
  await page.goto('/');
  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('이메일').fill('tester@example.com');
  await page.getByLabel('비밀번호').fill('test-password');
  await page.getByRole('button', { name: '로그인' }).click();
  await expect(page).toHaveURL(/\/$/);

  await writeNewContent(page);
  const dialog = await chooseScheduledWithNotification(page);
  await page.screenshot({ path: testInfo.outputPath('f1-publish-modal.png') });
  await dialog.getByRole('button', { name: '발행하기' }).click();

  await expect(page).toHaveURL(/\/$/);
  const row = page.getByRole('row', { name: /금리 인하 이후 시장 전망/ });
  await expect(row.getByText('예약')).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('f1-list.png') });

  expect(apiCalls(state)).toEqual([
    'POST /api/v1/auth/login',
    'POST /api/v1/contents',
    'POST /api/v1/contents/101/schedule',
    'POST /api/v1/notifications',
  ]);
  const notification = state.requests.find(item => item.method === 'POST' && item.path === '/api/v1/notifications');
  expect(notification?.body).toEqual({
    content_id: 101,
    title: '금리 인하 이후 시장 전망',
    target_type: 'member',
    scheduled_at: SCHEDULE_ISO,
  });
});

test('F1 알람 생성이 실패하면 모달을 유지하고, 재시도 시 남은 알람 단계만 호출한다', async ({ page }, testInfo) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/');
  await writeNewContent(page);
  const dialog = await chooseScheduledWithNotification(page);

  state.failNext = { method: 'POST', pathIncludes: '/api/v1/notifications', status: 500, error: 'internal server error' };
  await dialog.getByRole('button', { name: '발행하기' }).click();
  await expect(dialog.getByRole('alert')).toHaveText('요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.');
  await page.screenshot({ path: testInfo.outputPath('f1-partial-failure.png') });

  const callsBeforeRetry = apiCalls(state).length;
  await dialog.getByRole('button', { name: '발행하기' }).click();
  await expect(page).toHaveURL(/\/$/);
  expect(apiCalls(state).slice(callsBeforeRetry)).toEqual(['POST /api/v1/notifications']);
});

test('예약 시간 달력이 열린 상태에서 ESC는 달력만 닫고 모달은 유지한다', async ({ page }) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/');
  await writeNewContent(page);
  const dialog = page.getByRole('dialog', { name: '발행하기' });
  await dialog.getByRole('radio', { name: '예약 발행' }).check();
  await dialog.getByRole('textbox', { name: '예약 발행' }).click();
  await expect(page.locator('.react-datepicker')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.react-datepicker')).toBeHidden();
  await expect(dialog).toBeVisible();
});

test('발행 모달을 취소하면 저장된 콘텐츠의 수정 화면으로 이동한다', async ({ page }) => {
  const state = createState();
  await mockApi(page, state);
  await page.goto('/');
  await writeNewContent(page);
  await page.getByRole('dialog', { name: '발행하기' }).getByRole('button', { name: '취소' }).click();
  await expect(page).toHaveURL(/\/contents\/101\/edit/);
  await expect(page.getByRole('textbox', { name: '제목' })).toHaveValue('금리 인하 이후 시장 전망');
  await expect(page.getByRole('button', { name: '임시저장' })).toHaveCount(0);
});
