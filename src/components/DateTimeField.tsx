import { endOfDay, isSameDay } from 'date-fns';
import { ko } from 'date-fns/locale/ko';
import { useId } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';

registerLocale('ko', ko);

const TIME_INTERVAL_MINUTES = 10;

type DateTimeFieldProps = {
  label: string;
  value: Date | null;
  onChange: (value: Date | null) => void;
  placeholder?: string;
  error?: string;
};

export function DateTimeField({ label, value, onChange, placeholder, error }: DateTimeFieldProps) {
  const inputId = useId();
  const errorId = `${inputId}-error`;
  const hasError = error != null;
  const earliestDate = new Date();
  const isEarliestDay = isSameDay(value ?? earliestDate, earliestDate);

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-900">
        {label}
      </label>
      <DatePicker
        id={inputId}
        selected={value}
        onChange={onChange}
        minDate={earliestDate}
        minTime={isEarliestDay ? earliestDate : undefined}
        maxTime={isEarliestDay ? endOfDay(earliestDate) : undefined}
        showTimeSelect
        timeIntervals={TIME_INTERVAL_MINUTES}
        timeCaption="시간"
        dateFormat="yyyy년 MM월 dd일 HH시 mm분"
        locale="ko"
        placeholderText={placeholder}
        autoComplete="off"
        ariaInvalid={hasError ? 'true' : undefined}
        ariaDescribedBy={hasError ? errorId : undefined}
        wrapperClassName="w-full"
        className={`h-11 w-full rounded-lg border bg-white px-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 ${hasError ? 'border-danger' : 'border-gray-300 focus:border-primary'}`}
      />
      {hasError && (
        <p id={errorId} className="text-xs text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
