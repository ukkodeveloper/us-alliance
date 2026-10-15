import { type ComponentProps, useId } from 'react';

type TextareaProps = Omit<ComponentProps<'textarea'>, 'value' | 'className'> & {
  label: string;
  value: string;
  error?: string;
};

export function Textarea({ label, value, error, maxLength, id, ...textareaProps }: TextareaProps) {
  const generatedId = useId();
  const textareaId = id ?? generatedId;
  const errorId = `${textareaId}-error`;
  const hasError = error != null;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={textareaId} className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div
        className={`flex flex-col gap-1 rounded-lg border bg-white px-3 py-2.5 ${hasError ? 'border-danger' : 'border-gray-300 focus-within:border-primary'}`}
      >
        <textarea
          id={textareaId}
          value={value}
          maxLength={maxLength}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="min-h-24 resize-y bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
          {...textareaProps}
        />
        {maxLength != null && (
          <span className="self-end text-xs text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      {hasError && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
