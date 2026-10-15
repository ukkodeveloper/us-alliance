import { type ReactNode } from 'react';

export type StatusTone = 'success' | 'neutral' | 'warning' | 'danger';

type StatusBadgeProps = {
  tone: StatusTone;
  children: ReactNode;
};

const TONE_CLASS_NAMES: Record<StatusTone, string> = {
  success: 'bg-primary-light text-primary-dark',
  neutral: 'bg-gray-100 text-gray-500',
  warning: 'bg-orange-50 text-orange-500',
  danger: 'bg-red-50 text-danger',
};

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${TONE_CLASS_NAMES[tone]}`}
    >
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current" />
      {children}
    </span>
  );
}
