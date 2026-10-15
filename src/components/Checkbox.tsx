import { type ComponentProps } from 'react';

type CheckboxVariant = 'default' | 'chip';

type CheckboxProps = Omit<ComponentProps<'input'>, 'type' | 'className'> & {
  label: string;
  variant?: CheckboxVariant;
};

const VARIANT_CLASS_NAMES: Record<CheckboxVariant, string> = {
  default: 'gap-2 text-sm text-gray-900',
  chip: 'gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-700 has-checked:border-primary has-checked:bg-primary-light has-checked:text-primary-dark has-focus-visible:outline-2 has-focus-visible:outline-primary',
};

export function Checkbox({ label, variant = 'default', ...inputProps }: CheckboxProps) {
  return (
    <label
      className={`inline-flex cursor-pointer items-center has-disabled:cursor-not-allowed has-disabled:opacity-50 ${VARIANT_CLASS_NAMES[variant]}`}
    >
      <input type="checkbox" className="size-4 accent-primary" {...inputProps} />
      {label}
    </label>
  );
}
