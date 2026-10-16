import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { type ReactNode, Suspense, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router';

import { type Content, contentQueries, createContent, updateContent } from '../api/contents';
import { Button } from '../components/Button';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { EditorLayout } from '../components/layout/EditorLayout';
import {
  clearDraft,
  ContentForm,
  ContentFormSkeleton,
  type ContentFormValues,
  EMPTY_CONTENT_FORM_VALUES,
  loadDraft,
  PublishModal,
  toContentFormValues,
  toContentRequest,
  toUpdateContentRequest,
  useContentForm,
  useDraftAutosave,
} from '../domains/contents';
import { parseId } from '../utils/parseId';

const PAGE_TITLE = '콘텐츠 쓰기';
const LIST_PATH = '/';

export function ContentWritePage() {
  const { id } = useParams();

  if (id == null) {
    return <NewContentWriter />;
  }
  const contentId = parseId(id);
  if (contentId == null) {
    return <ContentNotice message="콘텐츠를 찾을 수 없습니다." />;
  }
  return <EditContentWriter contentId={contentId} />;
}

function NewContentWriter() {
  const [searchParams] = useSearchParams();
  const [initialValues] = useState(() =>
    searchParams.get('draft') === '1' ? (loadDraft()?.values ?? EMPTY_CONTENT_FORM_VALUES) : EMPTY_CONTENT_FORM_VALUES
  );
  const form = useContentForm(initialValues);
  const [publishTarget, setPublishTarget] = useState<Content | null>(null);
  const { lastSavedAt, saveNow } = useDraftAutosave(form.values, { enabled: publishTarget == null });
  const [draftNotice, setDraftNotice] = useState<string | null>(null);
  const save = useSaveContent(null);
  const navigate = useNavigate();

  function handleSaveDraft() {
    setDraftNotice(saveNow() ? null : '임시저장할 내용이 없습니다.');
  }

  function handlePublish() {
    if (!form.validate()) {
      return;
    }
    save.mutate(form.values, {
      onSuccess: content => {
        clearDraft();
        setPublishTarget(content);
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
          <Button onClick={handlePublish} disabled={save.isPending || publishTarget != null}>
            발행하기
          </Button>
        </>
      }
      error={save.error?.message}
    >
      <ContentForm values={form.values} errors={form.errors} onChange={form.setValues} />
      {publishTarget != null && (
        <PublishModal
          open
          contentId={publishTarget.id}
          contentTitle={publishTarget.title}
          onClose={() => navigate(`/contents/${publishTarget.id}/edit`, { replace: true })}
          onPublished={() => navigate(LIST_PATH)}
        />
      )}
    </ContentWriterLayout>
  );
}

function EditContentWriter({ contentId }: { contentId: number }) {
  return (
    <ErrorBoundary fallback={({ error }) => <ContentNotice message={error.message} />}>
      <Suspense
        fallback={
          <ContentWriterLayout actions={null}>
            <ContentFormSkeleton />
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
  const navigate = useNavigate();
  const [publishTarget, setPublishTarget] = useState<Content | null>(null);

  function handlePublish() {
    if (form.validate()) {
      save.mutate(form.values, { onSuccess: setPublishTarget });
    }
  }

  return (
    <ContentWriterLayout
      actions={
        <Button onClick={handlePublish} disabled={save.isPending || publishTarget != null}>
          발행하기
        </Button>
      }
      error={save.error?.message}
    >
      <ContentForm values={form.values} errors={form.errors} onChange={form.setValues} />
      {publishTarget != null && (
        <PublishModal
          open
          contentId={publishTarget.id}
          contentTitle={publishTarget.title}
          onClose={() => setPublishTarget(null)}
          onPublished={() => navigate(LIST_PATH)}
        />
      )}
    </ContentWriterLayout>
  );
}

function useSaveContent(contentId: number | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ContentFormValues) => {
      if (contentId == null) {
        return createContent(toContentRequest(values));
      }
      return updateContent(contentId, toUpdateContentRequest(values));
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contents'] });
    },
  });
}

function ContentNotice({ message }: { message: string }) {
  return (
    <ContentWriterLayout actions={null}>
      <div role="alert" className="flex flex-col items-center gap-3 py-20 text-sm text-gray-500">
        <p>{message}</p>
        <Link to={LIST_PATH} className="font-semibold text-primary">
          목록으로 돌아가기
        </Link>
      </div>
    </ContentWriterLayout>
  );
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
