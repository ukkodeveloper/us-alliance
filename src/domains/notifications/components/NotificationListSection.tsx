import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

import { Button } from '../../../components/Button';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { NotificationTable } from './NotificationTable';

export function NotificationListSection() {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <section className="flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-gray-900">알람</h1>
      <ErrorBoundary
        fallback={({ reset }) => (
          <div role="alert" className="flex flex-col items-center gap-3 py-20 text-sm text-gray-500">
            <p>알람 목록을 불러오지 못했습니다.</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetQueryErrors();
                reset();
              }}
            >
              다시 시도
            </Button>
          </div>
        )}
      >
        <Suspense fallback={<p className="py-20 text-center text-sm text-gray-500">알람 목록을 불러오는 중입니다.</p>}>
          <NotificationTable />
        </Suspense>
      </ErrorBoundary>
    </section>
  );
}
