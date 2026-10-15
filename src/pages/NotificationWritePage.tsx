import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router';

import { createNotification } from '../api/notifications';
import { Button } from '../components/Button';
import { EditorLayout } from '../components/layout/EditorLayout';
import { LeaveConfirmModal, NotificationForm, useNotificationForm } from '../domains/notifications';
import { toKstIsoString } from '../utils/date';
import { parseId } from '../utils/parseId';

const PAGE_TITLE = '알람발송';

export function NotificationWritePage() {
  const [searchParams] = useSearchParams();
  const contentId = parseId(searchParams.get('contentId'));

  if (contentId == null) {
    return <InvalidContentNotice />;
  }
  return <NotificationWriter contentId={contentId} />;
}

function NotificationWriter({ contentId }: { contentId: number }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { values, errors, isDirty, setValues, validate } = useNotificationForm();
  const [isLeaveConfirmOpen, setIsLeaveConfirmOpen] = useState(false);

  const { mutate, isPending, error } = useMutation({
    mutationFn: createNotification,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      void queryClient.invalidateQueries({ queryKey: ['contents'] });
      navigate('/?tab=notifications');
    },
  });

  function handleSubmit() {
    const { targetType, title, scheduledAt } = values;
    if (!validate() || scheduledAt == null) {
      return;
    }
    mutate({
      content_id: contentId,
      title: title.trim(),
      target_type: targetType,
      scheduled_at: toKstIsoString(scheduledAt),
    });
  }

  function handleBack() {
    if (isDirty) {
      setIsLeaveConfirmOpen(true);
      return;
    }
    navigate('/');
  }

  return (
    <EditorLayout
      title={PAGE_TITLE}
      onBack={handleBack}
      actions={
        <Button onClick={handleSubmit} disabled={isPending}>
          발송하기
        </Button>
      }
    >
      <NotificationForm values={values} errors={errors} onChange={setValues} />
      {error != null && (
        <p role="alert" className="mt-6 text-sm text-danger">
          {error.message}
        </p>
      )}
      <LeaveConfirmModal
        open={isLeaveConfirmOpen}
        onCancel={() => setIsLeaveConfirmOpen(false)}
        onConfirm={() => navigate('/')}
      />
    </EditorLayout>
  );
}

function InvalidContentNotice() {
  const navigate = useNavigate();

  return (
    <EditorLayout title={PAGE_TITLE} onBack={() => navigate('/')} actions={null}>
      <div className="flex flex-col items-center gap-3 py-20 text-sm text-gray-500">
        <p>알람을 보낼 콘텐츠를 찾을 수 없습니다.</p>
        <Link to="/" className="font-semibold text-primary hover:underline">
          목록으로 돌아가기
        </Link>
      </div>
    </EditorLayout>
  );
}
