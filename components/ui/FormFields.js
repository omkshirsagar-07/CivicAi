'use client';

import { forwardRef, useId } from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { cn } from '@/utils/client';

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 flex items-start gap-1.5 text-[13px] text-red-600">
      <AlertCircle size={14} className="mt-0.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </p>
  );
}

export function Input({
  label,
  error,
  hint,
  type = 'text',
  id: idProp,
  className,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <input
        id={id}
        type={type}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn('input-base', error && 'border-red-400 focus:ring-red-300', className)}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-[12.5px] text-slate-500">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export function PasswordInput({
  label,
  error,
  id: idProp,
  className,
  visible = false,
  onToggleVisible,
  ...props
}) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn('input-base pr-11', error && 'border-red-400 focus:ring-red-300', className)}
          {...props}
        />
        <button
          type="button"
          onClick={onToggleVisible}
          aria-label={visible ? 'Hide password' : 'Show password'}
          className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-slate-400 hover:text-navy-700"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

export const Textarea = forwardRef(function Textarea(
  { label, error, hint, id: idProp, className, rows = 4, ...props },
  ref
) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn('input-base resize-y leading-relaxed', error && 'border-red-400', className)}
        {...props}
      />
      {hint && !error && <p className="mt-1.5 text-[12.5px] text-slate-500">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
});

Textarea.displayName = 'Textarea';

export function Select({ label, error, hint, id: idProp, className, children, ...props }) {
  const autoId = useId();
  const id = idProp || autoId;
  return (
    <div>
      {label && (
        <label htmlFor={id} className="label-base">
          {label}
        </label>
      )}
      <select
        id={id}
        className={cn('input-base appearance-none pr-9 bg-no-repeat', className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
          backgroundPosition: 'right 12px center',
        }}
        {...props}
      >
        {children}
      </select>
      {hint && !error && <p className="mt-1.5 text-[12.5px] text-slate-500">{hint}</p>}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}
