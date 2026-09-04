import { Bot } from 'lucide-react';
import { cn } from '@/utils/client';

/** Shown while an AI operation is running. */
export default function AiProcessing({ message, className }) {
  return (
    <div role="status" aria-live="polite" className={cn('card overflow-hidden !p-0', className)}>
      <div className="h-1 w-full bg-blue-50">
        <div className="h-full w-2/5 animate-pulse-soft rounded-full bg-gradient-to-r from-sky-400 to-blue-600" />
      </div>
      <div className="flex items-start gap-3.5 p-5">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-civic-blue">
          <Bot size={20} aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-800">{message}</p>
          <div className="mt-3 space-y-2" aria-hidden>
            <div className="h-2 w-full animate-pulse rounded-full bg-slate-100" />
            <div className="h-2 w-4/5 animate-pulse rounded-full bg-slate-100 [animation-delay:120ms]" />
            <div className="h-2 w-3/5 animate-pulse rounded-full bg-slate-100 [animation-delay:240ms]" />
          </div>
        </div>
      </div>
    </div>
  );
}
