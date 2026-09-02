import { useState } from 'react'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'

export function Field({ label, htmlFor, error, hint, required, children }) {
  return (
    <div>
      {label && (
        <label htmlFor={htmlFor} className="label">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
          <AlertCircle size={13} /> {error}
        </p>
      ) : hint ? (
        <p className="mt-1.5 text-xs text-slate-400">{hint}</p>
      ) : null}
    </div>
  )
}

export function Input({ error, className = '', ...rest }) {
  return (
    <input
      className={`input ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    />
  )
}

export function Textarea({ error, className = '', ...rest }) {
  return (
    <textarea
      className={`input resize-none leading-relaxed ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''} ${className}`}
      aria-invalid={Boolean(error)}
      {...rest}
    />
  )
}

export function PasswordInput({ error, className = '', ...rest }) {
  const [show, setShow] = useState(false)
  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        className={`input pr-11 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-100' : ''} ${className}`}
        aria-invalid={Boolean(error)}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-600"
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  )
}
