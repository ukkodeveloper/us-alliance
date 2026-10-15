import { useSuspenseQueries } from '@tanstack/react-query';

import { contentQueries } from '../../../api/contents';
import { type PublishServerState } from './types';

export function usePublishState(contentId: number) {
  return useSuspenseQueries({
    queries: [
      contentQueries.detail(contentId),
      contentQueries.schedule(contentId),
      contentQueries.notification(contentId),
    ],
    combine: ([content, schedule, notification]): PublishServerState => ({
      contentId,
      status: content.data.status,
      isScheduled: schedule.data.is_scheduled,
      publishedAt: schedule.data.published_at ?? content.data.published_at ?? null,
      notification: notification.data,
    }),
  });
}
