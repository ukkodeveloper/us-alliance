import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';

import { Button } from '../components/Button';
import { GnbLayout } from '../components/layout/GnbLayout';
import { useLogout } from '../domains/auth';
import { ContentListSection, NewPostModal } from '../domains/contents';
import { NotificationListSection } from '../domains/notifications';

const TABS = [
  { value: 'contents', label: '콘텐츠' },
  { value: 'notifications', label: '알람' },
] as const;

type Tab = (typeof TABS)[number]['value'];

function parseTab(value: string | null): Tab {
  return value === 'notifications' ? 'notifications' : 'contents';
}

export function ListPage() {
  const [searchParams] = useSearchParams();
  const activeTab = parseTab(searchParams.get('tab'));
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);
  const logout = useLogout();

  return (
    <GnbLayout
      nav={TABS.map(tab => {
        const isActive = tab.value === activeTab;
        return (
          <Link
            key={tab.value}
            to={`?tab=${tab.value}`}
            aria-current={isActive ? 'page' : undefined}
            className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${isActive ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-700'}`}
          >
            {tab.label}
          </Link>
        );
      })}
      actions={
        <>
          <Button size="sm" variant="secondary" onClick={() => void logout()}>
            로그아웃
          </Button>
          <Button size="sm" onClick={() => setIsNewPostOpen(true)}>
            + 새 글쓰기
          </Button>
        </>
      }
    >
      {activeTab === 'contents' ? <ContentListSection /> : <NotificationListSection />}
      <NewPostModal open={isNewPostOpen} onClose={() => setIsNewPostOpen(false)} />
    </GnbLayout>
  );
}
