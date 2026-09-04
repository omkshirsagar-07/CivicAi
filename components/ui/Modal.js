'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/client';

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  hideClose = false,
}) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    const prev = panelRef.current;
    if (prev && typeof prev.focus === 'function') prev.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl' };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title || 'Dialog'}
    >
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-[2px] animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          'relative w-full rounded-2xl bg-white shadow-soft outline-none animate-fade-in-up max-h-[88vh] overflow-y-auto',
          widths[size]
        )}
      >
        {(title || !hideClose) && (
          <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-4">
            <div>
              {title && <h2 className="text-lg font-bold text-slate-900">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
            </div>
            {!hideClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="px-6 py-5">{children}</div>
      </div>
    </div>
  );
}
