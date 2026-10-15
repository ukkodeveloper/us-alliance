import { type ComponentProps } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'outline';
type ButtonSize = 'md' | 'sm';

type ButtonProps = ComponentProps<'button'> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const VARIANT_CLASS_NAMES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-dark disabled:bg-gray-200 disabled:text-gray-400',
  secondary: 'bg-primary-light text-primary-dark hover:brightness-95 disabled:bg-gray-100 disabled:text-gray-300',
  outline:
    'border border-primary bg-white text-primary hover:bg-primary-light disabled:border-gray-200 disabled:text-gray-300',
};

const SIZE_CLASS_NAMES: Record<ButtonSize, string> = {
  md: 'h-10 px-4 text-sm',
  sm: 'h-7 px-2 text-xs',
};

export function Button({ variant = 'primary', size = 'md', type = 'button', className, ...buttonProps }: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 items-center justify-center gap-1 rounded-lg font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed ${VARIANT_CLASS_NAMES[variant]} ${SIZE_CLASS_NAMES[size]} ${className ?? ''}`}
      {...buttonProps}
    />
  );
}
