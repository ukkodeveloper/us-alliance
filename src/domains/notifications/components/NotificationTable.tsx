import { useSuspenseQuery } from '@tanstack/react-query';

import {
  type Notification,
  NOTIFICATION_PAGE_SIZE,
  notificationQueries,
  SEND_STATUS_LABELS,
  type SendStatus,
} from '../../../api/notifications';
import { Pagination } from '../../../components/Pagination';
import { StatusBadge, type StatusTone } from '../../../components/StatusBadge';
import { formatDateTime } from '../../../utils/date';
import { useNotificationListParams } from '../hooks/useNotificationListParams';

const SEND_STATUS_TONES: Record<SendStatus, StatusTone> = {
  pending: 'warning',
  sent: 'success',
  failed: 'danger',
};

const EMPTY_CELL = '-';

export function NotificationTable() {
  const { page, setPage } = useNotificationListParams();
  const { data } = useSuspenseQuery(notificationQueries.list({ page, limit: NOTIFICATION_PAGE_SIZE }));
  const totalPages = Math.ceil(data.total / NOTIFICATION_PAGE_SIZE);

  if (data.notifications.length === 0) {
    return <p className="py-20 text-center text-sm text-gray-500">등록된 알람이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th scope="col" className="w-16 py-3 font-normal">
                번호
              </th>
              <th scope="col" className="py-3 font-normal">
                제목
              </th>
              <th scope="col" className="w-16 py-3 font-normal">
                발송 성공
              </th>
              <th scope="col" className="w-16 py-3 font-normal">
                발송 실패
              </th>
              <th scope="col" className="w-20 py-3 font-normal">
                발송 날짜
              </th>
              <th scope="col" className="w-16 py-3 font-normal">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {data.notifications.map(notification => (
              <NotificationRow key={notification.id} notification={notification} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </div>
  );
}

function NotificationRow({ notification }: { notification: Notification }) {
  return (
    <tr className="border-b border-gray-50 text-center text-gray-700">
      <td className="py-5 font-semibold">{notification.id}</td>
      <td className="px-2 py-5 text-left font-semibold text-gray-900">{notification.title}</td>
      <td className="py-5 text-xs">{notification.stats?.success_count ?? EMPTY_CELL}</td>
      <td className="py-5 text-xs">{notification.stats?.failure_count ?? EMPTY_CELL}</td>
      <td className="px-2 py-5 text-xs">{formatDateTime(notification.scheduled_at)}</td>
      <td className="py-5">
        <StatusBadge tone={SEND_STATUS_TONES[notification.send_status]}>
          {SEND_STATUS_LABELS[notification.send_status]}
        </StatusBadge>
      </td>
    </tr>
  );
}
