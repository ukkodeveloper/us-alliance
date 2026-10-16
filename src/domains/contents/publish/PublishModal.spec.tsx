import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type Content, contentQueries, type ContentSchedule } from '../../../api/contents';
import { type Notification } from '../../../api/notifications';
import { formatDateTime } from '../../../utils/date';
import { PublishModal } from './PublishModal';
import { runPublishPlan } from './runPublishPlan';

vi.mock('./runPublishPlan', () => ({ runPublishPlan: vi.fn() }));

const CONTENT_ID = 7;
const CONTENT_TITLE = '오늘의 시장 정리';

const PRIVATE_CONTENT: Content = {
  id: CONTENT_ID,
  user_id: 1,
  title: CONTENT_TITLE,
  body: '본문',
  categories: ['macroEconomics'],
  status: 'private',
  publish_status: 'draft',
  created_at: '2026-10-15T09:00:00+09:00',
  updated_at: '2026-10-15T09:00:00+09:00',
};

const NOT_SCHEDULED: ContentSchedule = { content_id: CONTENT_ID, is_scheduled: false, published_at: null };

function renderPublishModal(
  content: Content = PRIVATE_CONTENT,
  schedule: ContentSchedule = NOT_SCHEDULED,
  notification: Notification | null = null
) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: Infinity } } });
  queryClient.setQueryData(contentQueries.detail(CONTENT_ID).queryKey, content);
  queryClient.setQueryData(contentQueries.schedule(CONTENT_ID).queryKey, schedule);
  queryClient.setQueryData(contentQueries.notification(CONTENT_ID).queryKey, notification);
  const onClose = vi.fn();
  const onPublished = vi.fn();

  render(
    <QueryClientProvider client={queryClient}>
      <PublishModal
        open
        contentId={CONTENT_ID}
        contentTitle={CONTENT_TITLE}
        onClose={onClose}
        onPublished={onPublished}
      />
    </QueryClientProvider>
  );
  return { user: userEvent.setup(), onClose, onPublished };
}

describe('PublishModal', () => {
  afterEach(cleanup);

  it('한 번도 발행하지 않은 비공개 콘텐츠는 공개와 발송이 선택된 채 열린다', () => {
    renderPublishModal();

    expect(screen.getByRole('radio', { name: '공개' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '발송' })).toBeChecked();
  });

  it('알람이 없는 공개 콘텐츠는 미발송이 선택된 채 열린다', () => {
    renderPublishModal({
      ...PRIVATE_CONTENT,
      status: 'public',
      publish_status: 'published',
      published_at: '2026-10-14T09:00:00+09:00',
    });

    expect(screen.getByRole('radio', { name: '공개' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '미발송' })).toBeChecked();
  });

  it('공개에서 비공개로 바꾸면 발송 여부가 미발송으로 바뀌고 선택할 수 없다', async () => {
    const { user } = renderPublishModal();

    await user.click(screen.getByRole('radio', { name: '공개' }));
    expect(screen.getByRole('radio', { name: '발송' })).toBeChecked();

    await user.click(screen.getByRole('radio', { name: '비공개' }));

    expect(screen.getByRole('radio', { name: '미발송' })).toBeChecked();
    expect(screen.getByRole('radio', { name: '발송' })).toBeDisabled();
    expect(screen.queryByRole('textbox', { name: '알람 내용' })).not.toBeInTheDocument();
  });

  it('예약 발행을 선택하고 시간 없이 발행하면 예약 시간 필수 에러를 보여주고 발행하지 않는다', async () => {
    const { user, onPublished } = renderPublishModal();

    await user.click(screen.getByRole('radio', { name: '예약 발행' }));
    await user.click(screen.getByRole('radio', { name: '미발송' }));
    await user.click(screen.getByRole('button', { name: '발행하기' }));

    expect(screen.getByRole('textbox', { name: '예약 발행' })).toHaveAccessibleDescription('필수 정보입니다.');
    expect(onPublished).not.toHaveBeenCalled();
  });

  it('콘텐츠 제목 사용을 체크하면 알람 내용이 콘텐츠 제목으로 채워지고 해제하면 비워진다', async () => {
    const { user } = renderPublishModal();

    await user.click(screen.getByRole('radio', { name: '공개' }));
    const notificationTitle = screen.getByRole('textbox', { name: '알람 내용' });

    await user.click(screen.getByRole('checkbox', { name: '콘텐츠 제목 사용' }));
    expect(notificationTitle).toHaveValue(CONTENT_TITLE);
    expect(notificationTitle).toBeDisabled();

    await user.click(screen.getByRole('checkbox', { name: '콘텐츠 제목 사용' }));
    expect(notificationTitle).toHaveValue('');
    expect(notificationTitle).toBeEnabled();
  });

  it('발행 요청이 끝나기 전에는 ESC와 취소로 모달을 닫을 수 없다', async () => {
    vi.mocked(runPublishPlan).mockReturnValue(new Promise(() => undefined));
    const { user, onClose } = renderPublishModal();

    await user.click(screen.getByRole('radio', { name: '미발송' }));
    await user.click(screen.getByRole('button', { name: '발행하기' }));
    await user.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('예약 알람이 있는 예약 콘텐츠를 공개 + 발송으로 바꾸면 예약 알람이 취소되고 지금 발송된다고 알려준다', async () => {
    const scheduledAt = '2026-10-20T10:00:00+09:00';
    const { user } = renderPublishModal(
      { ...PRIVATE_CONTENT, publish_status: 'scheduled' },
      { content_id: CONTENT_ID, is_scheduled: true, published_at: scheduledAt },
      {
        id: 31,
        content_id: CONTENT_ID,
        title: '새 글 알림',
        target_type: 'all',
        send_status: 'pending',
        scheduled_at: scheduledAt,
        created_at: '2026-10-15T09:00:00+09:00',
        updated_at: '2026-10-15T09:00:00+09:00',
      }
    );
    const notice = `${formatDateTime(scheduledAt)}에 예약된 알람은 취소되고 지금 바로 발송됩니다.`;
    expect(screen.queryByText(notice)).not.toBeInTheDocument();

    await user.click(screen.getByRole('radio', { name: '공개' }));

    expect(screen.getByText(notice)).toBeInTheDocument();
  });
});
