import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { type ReactNode, Suspense, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';

import { contentQueries, createContent, updateContent } from '../api/contents';
import { Button } from '../components/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EditorLayout } from '../components/layout/EditorLayout';
import {
  clearDraft,
  ContentForm,
  type ContentFormValues,
  EMPTY_CONTENT_FORM_VALUES,
  loadDraft,
  toContentFormValues,
  toContentRequest,
  useContentForm,
  useDraftAutosave,
} from '../domains/contents';

const PAGE_TITLE = '콘텐츠 쓰기';
const LIST_PATH = '/';

export function ContentWritePage() {
  const { id } = useParams();

  if (id == null) {
    return <NewContentWriter />;
  }
  return <EditContentWriter contentId={Number(id)} />;
}

function NewContentWriter() {
  const [searchParams] = useSearchParams();
  const [initialValues] = useState(() =>
    searchParams.get('draft') === '1' ? (loadDraft()?.values ?? EMPTY_CONTENT_FORM_VALUES) : EMPTY_CONTENT_FORM_VALUES
  );
  const form = useContentForm(initialValues);
  const { lastSavedAt, saveNow } = useDraftAutosave(form.values, { enabled: true });
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const save = useSaveContent(null);

  function handleSaveDraft() {
    setDraftNotice(saveNow() ? null : '임시저장할 내용이 없습니다.');
  }

  function handlePublish() {
    if (!form.validate()) {
      return;
    }
    save.mutate(form.values, {
      onSuccess: () => {
        clearDraft();
      },
    });
  }

  const savedNotice = lastSavedAt == null ? null : `${format(lastSavedAt, 'HH:mm')} 임시저장됨`;

  return (
    <ContentWriterLayout
      actions={
        <>
          <span role="status" className="text-xs text-gray-500">
            {draftNotice ?? savedNotice}
          </span>
          <Button variant="secondary" onClick={handleSaveDraft}>
            임시저장
          </Button>
          <Button onClick={handlePublish} disabled={save.isPending}>
            발행하기
          </Button>
        </>
      }
      error={save.error?.message}
    >
      <ContentForm values={form.values} errors={form.errors} onChange={form.setValues} />
    </ContentWriterLayout>
  );
}

function EditContentWriter({ contentId }: { contentId: number }) {
  return (
    <ErrorBoundary
      fallback={({ error }) => (
        <ContentWriterLayout actions={null}>
          <div role="alert" className="flex flex-col items-center gap-3 py-20 text-sm text-gray-500">
            <p>{error.message}</p>
            <Link to={LIST_PATH} className="font-semibold text-primary">
              목록으로 돌아가기
            </Link>
          </div>
        </ContentWriterLayout>
      )}
    >
      <Suspense
        fallback={
          <ContentWriterLayout actions={null}>
            <p className="py-20 text-center text-sm text-gray-500">콘텐츠를 불러오는 중입니다.</p>
          </ContentWriterLayout>
        }
      >
        <EditContentForm contentId={contentId} />
      </Suspense>
    </ErrorBoundary>
  );
}

function EditContentForm({ contentId }: { contentId: number }) {
  const { data: content } = useSuspenseQuery(contentQueries.detail(contentId));
  const form = useContentForm(toContentFormValues(content));
  const save = useSaveContent(contentId);

  function handlePublish() {
    if (form.validate()) {
      save.mutate(form.values);
    }
  }

  return (
    <ContentWriterLayout
      actions={
        <Button onClick={handlePublish} disabled={save.isPending}>
          발행하기
        </Button>
      }
      error={save.error?.message}
    >
      <ContentForm values={form.values} errors={form.errors} onChange={form.setValues} />
    </ContentWriterLayout>
  );
}

function useSaveContent(contentId: number | null) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (values: ContentFormValues) => {
      const request = toContentRequest(values);
      if (contentId == null) {
        return createContent(request);
      }
      return updateContent(contentId, { ...request, link_url: values.linkUrl ?? '' });
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contents'] });
      navigate(LIST_PATH);
    },
  });
}

type ContentWriterLayoutProps = {
  actions: ReactNode;
  error?: string;
  children: ReactNode;
};

function ContentWriterLayout({ actions, error, children }: ContentWriterLayoutProps) {
  const navigate = useNavigate();

  return (
    <EditorLayout title={PAGE_TITLE} onBack={() => navigate(LIST_PATH)} actions={actions}>
      {error != null && (
        <p role="alert" className="mb-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}
      {children}
    </EditorLayout>
  );
}
