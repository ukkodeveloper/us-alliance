import { useMutation, useQueryClient, useQueryErrorResetBoundary } from '@tanstack/react-query';
import { type FormEvent, Suspense, useState } from 'react';

import { CONTENT_ERROR_MESSAGES, contentQueries } from '../../../api/contents';
import { getErrorMessage } from '../../../api/http';
import {
  CREATE_NOTIFICATION_ERROR_MESSAGES,
  MAX_NOTIFICATION_TITLE_LENGTH,
  TARGET_TYPE_LABELS,
  TARGET_TYPES,
} from '../../../api/notifications';
import { Button } from '../../../components/Button';
import { Checkbox } from '../../../components/Checkbox';
import { DateTimeField } from '../../../components/DateTimeField';
import { ErrorBoundary } from '../../../components/ErrorBoundary';
import { Modal } from '../../../components/Modal';
import { RadioGroup } from '../../../components/RadioGroup';
import { TextField } from '../../../components/TextField';
import { formatDateTime } from '../../../utils/date';
import { createPublishPlan, isAlreadyPublic, isNotificationLocked } from './publishPlan';
import { runPublishPlan } from './runPublishPlan';
import { type PublishStep, type PublishVisibility } from './types';
import { usePublishOptions } from './usePublishOptions';
import { usePublishState } from './usePublishState';

type SendChoice = 'send' | 'skip';

const SEND_CHOICE_OPTIONS: Array<{ value: SendChoice; label: string }> = [
  { value: 'send', label: '발송' },
  { value: 'skip', label: '미발송' },
];

const TARGET_TYPE_OPTIONS = TARGET_TYPES.map(value => ({ value, label: TARGET_TYPE_LABELS[value] }));

type PublishModalProps = {
  open: boolean;
  contentId: number;
  contentTitle: string;
  onClose: () => void;
  onPublished: () => void;
};

type PublishMutation = ReturnType<typeof usePublishMutation>;

function usePublishMutation(contentId: number, onPublished: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (steps: PublishStep[]) => {
      const result = await runPublishPlan(contentId, steps);
      if (!result.ok) {
        throw result.error;
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['contents'] });
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
      onPublished();
    },
    onError: () => queryClient.invalidateQueries({ queryKey: contentQueries.detail(contentId).queryKey }),
  });
}

export function PublishModal({ open, onClose, ...formProps }: PublishModalProps) {
  const { reset: resetQueryErrors } = useQueryErrorResetBoundary();
  const publish = usePublishMutation(formProps.contentId, formProps.onPublished);

  function handleClose() {
    if (!publish.isPending) {
      onClose();
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="발행하기">
      <ErrorBoundary
        fallback={({ reset }) => (
          <div role="alert" className="flex flex-col items-center gap-3 py-10 text-sm text-gray-500">
            <p>발행 정보를 불러오지 못했습니다.</p>
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
        <Suspense fallback={<p className="py-10 text-center text-sm text-gray-500">발행 정보를 불러오는 중입니다.</p>}>
          <PublishForm onClose={onClose} publish={publish} {...formProps} />
        </Suspense>
      </ErrorBoundary>
    </Modal>
  );
}

type PublishFormProps = Omit<PublishModalProps, 'open'> & { publish: PublishMutation };

function PublishForm({ contentId, contentTitle, onClose, onPublished, publish }: PublishFormProps) {
  const serverState = usePublishState(contentId);
  const [wasPublicWhenOpened] = useState(() => isAlreadyPublic(serverState));
  const { values, options, errors, canSchedule, setValues, validate } = usePublishOptions(serverState);
  const { mutate, isPending, error } = publish;

  const isPrivate = values.visibility === 'private';
  const isLocked = isNotificationLocked(serverState.notification);
  const shouldSendNotification = !isPrivate && values.sendNotification;
  const pendingNotification = isLocked ? null : serverState.notification;
  const replacesPendingNotification =
    pendingNotification != null && values.visibility === 'public' && shouldSendNotification && !wasPublicWhenOpened;

  const visibilityOptions: Array<{ value: PublishVisibility; label: string; disabled?: boolean }> = [
    { value: 'public', label: '공개' },
    { value: 'private', label: '비공개' },
    { value: 'scheduled', label: '예약 발행', disabled: !canSchedule },
  ];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!validate()) {
      return;
    }
    const steps = createPublishPlan(serverState, options, { wasPublicWhenOpened });
    if (steps.length === 0) {
      onPublished();
      return;
    }
    mutate(steps);
  }

  function handleContentTitleUsedChange(isContentTitleUsed: boolean) {
    setValues({ ...values, isContentTitleUsed, notificationTitle: isContentTitleUsed ? contentTitle : '' });
  }

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
      <RadioGroup
        name="visibility"
        label="공개 여부"
        options={visibilityOptions}
        value={values.visibility}
        onChange={visibility => setValues({ ...values, visibility })}
      />
      {!canSchedule && (
        <p className="-mt-4 text-xs text-gray-400">이미 공개 발행한 콘텐츠는 예약 발행할 수 없습니다.</p>
      )}
      {values.visibility === 'scheduled' && (
        <DateTimeField
          label="예약 발행"
          placeholder="발행예약 시간을 선택해주세요."
          value={values.scheduledAt}
          error={errors.scheduledAt}
          onChange={scheduledAt => setValues({ ...values, scheduledAt })}
        />
      )}
      <div className="flex flex-col gap-1 border-b border-gray-100 pb-4">
        <h3 className="text-sm font-semibold text-gray-900">알람 설정</h3>
        <p className="text-xs text-gray-400">비공개 상태로 발행시 알람 설정은 자동으로 미발송으로 처리됩니다.</p>
        {isLocked && <p className="text-xs text-gray-400">이미 발송된 알람은 변경할 수 없습니다.</p>}
        {replacesPendingNotification && (
          <p className="text-xs text-danger">
            {formatDateTime(pendingNotification.scheduled_at)}에 예약된 알람은 취소되고 지금 바로 발송됩니다.
          </p>
        )}
      </div>
      <RadioGroup
        name="sendNotification"
        label="발송 여부"
        options={SEND_CHOICE_OPTIONS}
        value={shouldSendNotification ? 'send' : 'skip'}
        disabled={isPrivate || isLocked}
        onChange={choice => setValues({ ...values, sendNotification: choice === 'send' })}
      />
      {shouldSendNotification && (
        <>
          <RadioGroup
            name="targetType"
            label="대상자"
            options={TARGET_TYPE_OPTIONS}
            value={values.targetType}
            disabled={isLocked}
            onChange={targetType => setValues({ ...values, targetType })}
          />
          <div className="flex flex-col gap-2">
            <TextField
              label="알람 내용"
              placeholder="알람 제목을 입력해주세요."
              maxLength={MAX_NOTIFICATION_TITLE_LENGTH}
              value={values.notificationTitle}
              error={errors.notificationTitle}
              disabled={isLocked || values.isContentTitleUsed}
              onChange={event => setValues({ ...values, notificationTitle: event.target.value })}
            />
            <div>
              <Checkbox
                variant="chip"
                label="콘텐츠 제목 사용"
                checked={values.isContentTitleUsed}
                disabled={isLocked}
                onChange={event => handleContentTitleUsedChange(event.target.checked)}
              />
            </div>
          </div>
        </>
      )}
      {error != null && (
        <p role="alert" className="text-sm text-danger">
          {getErrorMessage(error, { ...CONTENT_ERROR_MESSAGES, ...CREATE_NOTIFICATION_ERROR_MESSAGES })}
        </p>
      )}
      <div className="-mx-6 flex justify-end gap-2 border-t border-gray-100 px-6 pt-5">
        <Button variant="outline" onClick={onClose} disabled={isPending}>
          취소
        </Button>
        <Button type="submit" disabled={isPending}>
          발행하기
        </Button>
      </div>
    </form>
  );
}
