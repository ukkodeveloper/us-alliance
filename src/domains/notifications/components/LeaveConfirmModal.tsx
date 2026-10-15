import { Button } from '../../../components/Button';
import { Modal } from '../../../components/Modal';

type LeaveConfirmModalProps = {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function LeaveConfirmModal({ open, onCancel, onConfirm }: LeaveConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title="작성을 종료하시겠습니까?"
      footer={
        <>
          <Button variant="outline" onClick={onCancel} className="flex-1">
            아니오
          </Button>
          <Button onClick={onConfirm} className="flex-1">
            네
          </Button>
        </>
      }
    >
      <p className="text-sm text-gray-500">작성 중인 글은 저장되지 않아요.</p>
    </Modal>
  );
}
