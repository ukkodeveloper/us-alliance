import { useQueryErrorResetBoundary } from '@tanstack/react-query';
import { Suspense } from 'react';

import { Button } from '../../../components/Button';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { useContentListParams } from '../hooks/useContentListParams';
import { ContentFilters } from './ContentFilters';
import { ContentTable } from './ContentTable';

export function ContentListSection() {
  const { params, setPage, setCategory, setPublishStatus } = useContentListParams();
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();

  return (
    <section className="flex flex-col gap-10">
      <h1 className="text-3xl font-bold text-gray-900">콘텐츠</h1>
      <div className="flex flex-col gap-4">
        <ContentFilters
          category={params.category}
          publishStatus={params.publish_status}
          onCategoryChange={setCategory}
          onPublishStatusChange={setPublishStatus}
        />
        <ErrorBoundary
          key={JSON.stringify(params)}
          fallback={({ reset }) => (
            <div role="alert" className="flex flex-col items-center gap-3 py-20 text-sm text-gray-500">
              <p>콘텐츠 목록을 불러오지 못했습니다.</p>
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
          <Suspense
            fallback={<p className="py-20 text-center text-sm text-gray-500">콘텐츠 목록을 불러오는 중입니다.</p>}
          >
            <ContentTable
              page={params.page}
              category={params.category}
              publishStatus={params.publish_status}
              onPageChange={setPage}
            />
          </Suspense>
        </ErrorBoundary>
      </div>
    </section>
  );
}
