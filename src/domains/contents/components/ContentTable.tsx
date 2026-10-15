import { useSuspenseQuery } from '@tanstack/react-query';
import { Link } from 'react-router';

import {
  type Category,
  type Content,
  CONTENT_PAGE_SIZE,
  contentQueries,
  PUBLISH_STATUS_LABELS,
  type PublishStatus,
} from '../../../api/contents';
import { Pagination } from '../../../components/Pagination';
import { StatusBadge, type StatusTone } from '../../../components/StatusBadge';
import { formatListDate } from '../../../utils/date';

const PUBLISH_STATUS_TONES: Record<PublishStatus, StatusTone> = {
  published: 'success',
  draft: 'neutral',
  scheduled: 'warning',
};

type ContentTableProps = {
  page: number;
  category?: Category;
  publishStatus?: PublishStatus;
  onPageChange: (page: number) => void;
};

export function ContentTable({ page, category, publishStatus, onPageChange }: ContentTableProps) {
  const { data: contentList } = useSuspenseQuery(
    contentQueries.list({ page, limit: CONTENT_PAGE_SIZE, category, publish_status: publishStatus })
  );
  const totalPages = Math.ceil(contentList.total / CONTENT_PAGE_SIZE);

  if (contentList.contents.length === 0) {
    return <p className="py-20 text-center text-sm text-gray-500">작성한 콘텐츠가 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-gray-100 text-xs text-gray-400">
              <th scope="col" className="w-20 py-3 font-normal">
                번호
              </th>
              <th scope="col" className="py-3 font-normal">
                제목
              </th>
              <th scope="col" className="w-24 py-3 font-normal">
                공개일자
              </th>
              <th scope="col" className="w-20 py-3 font-normal">
                상태
              </th>
            </tr>
          </thead>
          <tbody>
            {contentList.contents.map(content => (
              <ContentRow key={content.id} content={content} />
            ))}
          </tbody>
        </table>
      </div>
      <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
    </div>
  );
}

function ContentRow({ content }: { content: Content }) {
  const hasNotification = content.notification_status?.has_notification === true;

  return (
    <tr className="group relative border-b border-gray-50 focus-within:bg-gray-50 hover:bg-gray-50">
      <td className="py-5 text-center font-semibold text-gray-700">{content.id}</td>
      <td className="py-5">
        <div className="flex items-center gap-3">
          <Link
            to={`/contents/${content.id}/edit`}
            className="min-w-0 flex-1 truncate font-semibold text-gray-900 outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-primary focus-visible:after:ring-inset"
          >
            {content.title}
          </Link>
          {hasNotification ? null : (
            <Link
              to={`/notifications/new?contentId=${content.id}`}
              className="relative z-10 inline-flex h-7 shrink-0 items-center rounded border border-gray-300 bg-white px-2 text-xs text-gray-600 opacity-0 group-focus-within:opacity-100 group-hover:opacity-100 hover:bg-gray-100 focus-visible:opacity-100"
            >
              푸시알림 생성
            </Link>
          )}
        </div>
      </td>
      <td className="py-5 text-center text-xs text-gray-700">
        {content.published_at == null ? (
          '-'
        ) : (
          <time dateTime={content.published_at} className="inline-block w-min">
            {formatListDate(content.published_at)}
          </time>
        )}
      </td>
      <td className="py-5 text-center">
        <StatusBadge tone={PUBLISH_STATUS_TONES[content.publish_status]}>
          {PUBLISH_STATUS_LABELS[content.publish_status]}
        </StatusBadge>
      </td>
    </tr>
  );
}
