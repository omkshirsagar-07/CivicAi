import { Loader2 } from 'lucide-react'

const VARIANTS = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-600/20',
  navy: 'bg-navy-900 text-white hover:bg-navy-800 shadow-sm',
  danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm shadow-red-600/25',
  outline: 'border border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50/40',
  ghost: 'text-slate-600 hover:bg-slate-100',
  soft: 'bg-blue-50 text-blue-700 hover:bg-blue-100',
}

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2.5 text-sm rounded-lg gap-2',
  lg: 'px-6 py-3 text-[15px] rounded-xl gap-2',
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  to = null,
  icon: Icon = null,
  iconRight: IconRight = null,
  className = '',
  type = 'button',
  onClick,
  ...rest
}) {
  const classes = `inline-flex items-center justify-center font-semibold transition-all duration-150 select-none disabled:cursor-not-allowed disabled:opacity-50 ${VARIANTS[variant]} ${SIZES[size]} ${className}`

  const content = (
    <>
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 17} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={size === 'sm' ? 14 : 17} aria-hidden />
      )}
      {children}
      {IconRight && !loading && <IconRight size={size === 'sm' ? 14 : 17} aria-hidden />}
    </>
  )

  if (to) {
    return (
      <a href={`#${to}`} className={classes} onClick={onClick} {...rest}>
        {content}
      </a>
    )
  }

  return (
    <button type={type} className={classes} disabled={disabled || loading} onClick={onClick} {...rest}>
      {content}
    </button>
  )
}
