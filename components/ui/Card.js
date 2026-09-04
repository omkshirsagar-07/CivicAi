import { cn } from '@/utils/client';

export default function Card({ className, children, pad = true, ...props }) {
  return (
    <div className={cn('card', pad && 'p-5 sm:p-6', className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, icon: Icon, className }) {
  return (
    <div className={cn('flex items-start gap-3', className)}>
      {Icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-civic-blue">
          <Icon size={20} strokeWidth={2} aria-hidden />
        </span>
      )}
      <div>
        <h3 className="text-[15px] font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
    </div>
  );
}
