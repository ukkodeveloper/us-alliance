type RadioOption<T extends string> = {
  value: T;
  label: string;
  disabled?: boolean;
};

type RadioGroupProps<T extends string> = {
  name: string;
  label: string;
  options: Array<RadioOption<T>>;
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function RadioGroup<T extends string>({ name, label, options, value, onChange, disabled }: RadioGroupProps<T>) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2">
      <legend className="mb-2 text-sm font-semibold text-gray-900">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map(option => (
          <label
            key={option.value}
            className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-gray-900 has-disabled:cursor-not-allowed has-disabled:text-gray-400"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={option.value === value}
              disabled={option.disabled}
              onChange={() => onChange(option.value)}
              className="size-4 accent-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
