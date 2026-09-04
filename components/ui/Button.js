'use client';

import { forwardRef } from 'react';
import { cn } from '@/utils/client';
import Spinner from './Spinner';

const variants = {
  primary: 'btn-primary',
  blue: 'btn-blue',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
  white: 'bg-white text-navy-900 border border-slate-200 hover:bg-slate-50 shadow-sm',
};

const sizes = {
  sm: 'px-3 py-1.5 text-[13px] rounded-lg',
  md: 'px-4 py-2.5',
  lg: 'px-6 py-3 text-[15px]',
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', loading = false, disabled, className, children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn('btn', variants[variant], sizes[size], className)}
      {...props}
    >
      {loading && <Spinner size={16} />}
      {children}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
