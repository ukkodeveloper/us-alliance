import {
  changeContentStatus,
  createContentSchedule,
  deleteContentSchedule,
  updateContentSchedule,
} from '../../../api/contents';
import { ApiError } from '../../../api/http';
import {
  createNotification,
  deleteNotification,
  updateNotification,
  updateNotificationSchedule,
} from '../../../api/notifications';
import { type PublishStep } from './types';

type PublishPlanResult = { ok: true } | { ok: false; completedSteps: number; error: ApiError };

export async function runPublishPlan(contentId: number, steps: readonly PublishStep[]): Promise<PublishPlanResult> {
  for (const [index, step] of steps.entries()) {
    try {
      await runStep(contentId, step);
    } catch (error) {
      if (error instanceof ApiError) {
        return { ok: false, completedSteps: index, error };
      }
      throw error;
    }
  }
  return { ok: true };
}

function runStep(contentId: number, step: PublishStep): Promise<unknown> {
  switch (step.type) {
    case 'deleteSchedule':
      return deleteContentSchedule(contentId);
    case 'changeStatus':
      return changeContentStatus(contentId, { status: step.status });
    case 'createSchedule':
      return createContentSchedule(contentId, { published_at: step.publishedAt });
    case 'updateSchedule':
      return updateContentSchedule(contentId, { published_at: step.publishedAt });
    case 'createNotification':
      return createNotification({
        content_id: contentId,
        title: step.title,
        target_type: step.targetType,
        scheduled_at: step.scheduledAt,
      });
    case 'updateNotification':
      return updateNotification(step.notificationId, { title: step.title, target_type: step.targetType });
    case 'updateNotificationSchedule':
      return updateNotificationSchedule(step.notificationId, { scheduled_at: step.scheduledAt });
    case 'deleteNotification':
      return deleteNotification(step.notificationId);
    default: {
      const unhandled: never = step;
      throw new Error(`처리하지 않은 발행 단계입니다: ${JSON.stringify(unhandled)}`);
    }
  }
}
