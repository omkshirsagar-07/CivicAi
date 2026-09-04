'use client';

import { Check } from 'lucide-react';
import { cn } from '@/utils/client';

const STEP_DEFS = [
  { num: '01', label: 'Describe' },
  { num: '02', label: 'AI Analysis' },
  { num: '03', label: 'Evidence' },
  { num: '04', label: 'Verification' },
  { num: '05', label: 'Location' },
  { num: '06', label: 'Review' },
  { num: '07', label: 'Submit' },
];

export default function StepIndicator({ current, maxReached, onJump }) {
  return (
    <nav aria-label="Report progress" className="w-full overflow-x-auto pb-1">
      <ol className="flex min-w-max items-center gap-0 sm:gap-1">
        {STEP_DEFS.map((step, i) => {
          const index = i + 1;
          const state = index < current ? 'done' : index === current ? 'active' : 'future';
          const reachable = index <= maxReached;
          const clickable = reachable && index < current;

          return (
            <li key={step.num} className="flex items-center">
              <button
                type="button"
                disabled={!clickable}
                onClick={() => clickable && onJump?.(index)}
                aria-current={state === 'active' ? 'step' : undefined}
                className={cn(
                  'group flex items-center gap-2 rounded-full px-2 py-1.5 transition sm:px-3',
                  clickable ? 'cursor-pointer hover:bg-slate-50' : 'cursor-default'
                )}
              >
                <span
                  className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-[11.5px] font-bold transition-colors',
                    state === 'done' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                    state === 'active' && 'border-navy-900 bg-navy-900 text-white shadow-sm',
                    state === 'future' && 'border-slate-200 bg-white text-slate-400'
                  )}
                >
                  {state === 'done' ? <Check size={14} aria-hidden /> : step.num}
                </span>
                <span
                  className={cn(
                    'hidden text-[12.5px] font-semibold sm:block',
                    state === 'active' ? 'text-navy-900' : state === 'done' ? 'text-slate-600' : 'text-slate-400'
                  )}
                >
                  {step.label}
                </span>
              </button>
              {index < STEP_DEFS.length && (
                <span
                  className={cn(
                    'h-px w-3 sm:w-5',
                    index < current ? 'bg-emerald-300' : 'bg-slate-200'
                  )}
                  aria-hidden
                />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
