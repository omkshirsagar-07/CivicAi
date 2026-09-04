import { cn } from '@/utils/client';

export default function SectionHeading({
  eyebrow,
  title,
  description,
  center = true,
  className,
}) {
  return (
    <div className={cn('max-w-2xl', center && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p className="text-[12.5px] font-bold uppercase tracking-[0.18em] text-civic-blue">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-balance text-[30px] font-extrabold tracking-tight text-navy-950 sm:text-[36px]">
        {title}
      </h2>
      {description && (
        <p className="mt-4 text-[15.5px] leading-relaxed text-slate-600">{description}</p>
      )}
    </div>
  );
}
