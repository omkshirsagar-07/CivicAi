'use client';

import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { cn } from '@/utils/client';

const config = {
  info: { Icon: Info, cls: 'border-blue-200 bg-blue-50/70 text-blue-900', iconCls: 'text-blue-600' },
  success: { Icon: CheckCircle2, cls: 'border-emerald-200 bg-emerald-50/70 text-emerald-900', iconCls: 'text-emerald-600' },
  warn: { Icon: AlertTriangle, cls: 'border-amber-200 bg-amber-50/70 text-amber-900', iconCls: 'text-amber-600' },
  danger: { Icon: XCircle, cls: 'border-red-200 bg-red-50/70 text-red-900', iconCls: 'text-red-600' },
  neutral: { Icon: Info, cls: 'border-slate-200 bg-slate-50 text-slate-700', iconCls: 'text-slate-500' },
};

export default function Alert({ tone = 'info', children, className, icon = true }) {
  const { Icon, cls, iconCls } = config[tone] || config.info;
  return (
    <div
      role={tone === 'danger' ? 'alert' : tone === 'success' ? 'status' : undefined}
      className={cn('flex items-start gap-3 rounded-xl border px-4 py-3 text-sm', cls, className)}
    >
      {icon && <Icon size={18} className={cn('mt-0.5 shrink-0', iconCls)} aria-hidden />}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
