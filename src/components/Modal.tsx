import { type ReactNode, useEffect, useId, useRef } from 'react';
import { createPortal } from 'react-dom';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Modal({ open, ...dialogProps }: ModalProps) {
  if (!open) {
    return null;
  }
  return createPortal(<ModalDialog {...dialogProps} />, document.body);
}

function ModalDialog({ onClose, title, children, footer }: Omit<ModalProps, 'open'>) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(function focusDialogOnOpen() {
    dialogRef.current?.focus();
  }, []);

  useEffect(
    function closeOnEscape() {
      function handleKeyDown(event: KeyboardEvent) {
        if (event.key === 'Escape') {
          onClose();
        }
      }
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    },
    [onClose]
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div role="presentation" className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="pointer-events-none relative flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title != null ? titleId : undefined}
          tabIndex={-1}
          className="pointer-events-auto w-full max-w-[484px] rounded-2xl bg-white shadow-xl outline-none"
        >
          <div
            className={`flex items-center justify-between gap-4 px-6 ${title != null ? 'border-b border-gray-100 py-4' : 'pt-4'}`}
          >
            {title != null && (
              <h2 id={titleId} className="text-lg font-bold text-gray-900">
                {title}
              </h2>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="닫기"
              className="ml-auto flex size-8 items-center justify-center rounded-md text-gray-700 hover:bg-gray-100"
            >
              ✕
            </button>
          </div>
          <div className="px-6 py-5">{children}</div>
          {footer != null && <div className="flex justify-end gap-2 px-6 pb-5">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
