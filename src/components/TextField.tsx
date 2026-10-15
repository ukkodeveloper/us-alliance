import { type ComponentProps, useId } from 'react';

type TextFieldProps = Omit<ComponentProps<'input'>, 'value' | 'className'> & {
  label: string;
  value: string;
  error?: string;
  onClear?: () => void;
};

export function TextField({ label, value, error, onClear, maxLength, disabled, id, ...inputProps }: TextFieldProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = error != null;
  const isDisabled = disabled === true;
  const canClear = onClear != null && value.length > 0 && !isDisabled;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div
        className={`flex h-11 items-center gap-2 rounded-lg border px-3 ${hasError ? 'border-danger' : 'border-gray-300 focus-within:border-primary'} ${isDisabled ? 'bg-gray-100' : 'bg-white'}`}
      >
        <input
          id={inputId}
          value={value}
          maxLength={maxLength}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          className="min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 disabled:text-gray-500"
          {...inputProps}
        />
        {maxLength != null && (
          <span className="shrink-0 text-xs text-gray-400">
            {value.length}/{maxLength}
          </span>
        )}
        {canClear && (
          <button
            type="button"
            onClick={onClear}
            aria-label={`${label} 지우기`}
            className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] text-white hover:bg-gray-400"
          >
            ✕
          </button>
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
