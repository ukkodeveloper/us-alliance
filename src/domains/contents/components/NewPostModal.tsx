import { format } from 'date-fns';
import { type ReactNode, useState } from 'react';
import { useNavigate } from 'react-router';

import { Modal } from '../../../components/Modal';
import { clearDraft, loadDraft } from '../utils/draftStorage';

type NewPostModalProps = {
  open: boolean;
  onClose: () => void;
};

export function NewPostModal({ open, onClose }: NewPostModalProps) {
  return (
    <Modal open={open} onClose={onClose} title="새글쓰기">
      <NewPostOptions onClose={onClose} />
    </Modal>
  );
}

function NewPostOptions({ onClose }: Pick<NewPostModalProps, 'onClose'>) {
  const navigate = useNavigate();
  const [draft] = useState(loadDraft);

  function handleContinueDraft() {
    onClose();
    navigate('/contents/new?draft=1');
  }

  function handleStartNew() {
    clearDraft();
    onClose();
    navigate('/contents/new');
  }

  return (
    <div className="flex flex-col divide-y divide-gray-100">
      {draft != null && (
        <NewPostOption
          icon={
            <span className="flex size-8 items-center justify-center rounded-full bg-primary-light">
              <PenIcon />
            </span>
          }
          title="임시 저장된 콘텐츠 이어서 쓰기"
          description={`(임시 저장된 시간 : ${format(draft.savedAt, 'yyyy년 MM월 dd일 HH:mm')})`}
          onClick={handleContinueDraft}
        />
      )}
      <NewPostOption
        icon={<ChatIcon />}
        title="콘텐츠 쓰기"
        description="커뮤니티, 소통이 가능한 기본 포스트"
        onClick={handleStartNew}
      />
    </div>
  );
}

type NewPostOptionProps = {
  icon: ReactNode;
  title: string;
  description: string;
  onClick: () => void;
};

function NewPostOption({ icon, title, description, onClick }: NewPostOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg px-1 py-4 text-left hover:bg-gray-50"
    >
      <span className="flex size-8 shrink-0 items-center justify-center text-gray-900">{icon}</span>
      <span className="flex flex-col gap-1">
        <span className="text-sm font-bold text-gray-900">{title}</span>
        <span className="text-sm text-gray-400">{description}</span>
      </span>
    </button>
  );
}

function PenIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M12 20h9" strokeLinecap="round" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinejoin="round" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M4 4h12v9H8l-4 3Z" strokeLinejoin="round" />
      <path d="M16 8h4v11l-4-3h-6v-3" strokeLinejoin="round" />
    </svg>
  );
}
