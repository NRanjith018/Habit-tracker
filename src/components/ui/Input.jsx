import { forwardRef } from 'react'

const Input = forwardRef(function Input(
  { label, error, hint, className = '', containerClassName = '', type = 'text', ...props },
  ref
) {
  return (
    <div className={`flex flex-col gap-1.5 ${containerClassName}`}>
      {label && (
        <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`
          w-full px-4 py-2.5 rounded-xl text-sm border transition-all duration-150
          bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100
          placeholder:text-slate-400 dark:placeholder:text-slate-500
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          ${error
            ? 'border-red-400 dark:border-red-500'
            : 'border-slate-200 dark:border-slate-600'
          }
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  )
})

export default Input
