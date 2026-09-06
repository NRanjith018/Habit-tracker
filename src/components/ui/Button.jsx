import { forwardRef } from 'react'

const variants = {
  primary:   'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-500/30',
  secondary: 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200',
  ghost:     'hover:bg-slate-100 text-slate-600 dark:hover:bg-slate-800 dark:text-slate-300',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-sm shadow-red-500/30',
  outline:   'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300',
}

const sizes = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-sm rounded-xl',
  xl: 'px-8 py-3.5 text-base rounded-xl',
}

const Button = forwardRef(function Button(
  { children, variant = 'primary', size = 'md', className = '', disabled, loading, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      {...props}
    >
      {loading && (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      )}
      {children}
    </button>
  )
})

export default Button
