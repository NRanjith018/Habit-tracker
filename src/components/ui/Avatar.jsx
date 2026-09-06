export default function Avatar({ name = '', avatarUrl = '', size = 'md', className = '' }) {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-14 h-14 text-lg',
    xl: 'w-20 h-20 text-2xl',
  }
  const initials = name
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || 'Avatar'}
        className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-white dark:ring-slate-800 ${className}`}
      />
    )
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-blue-500 text-white font-bold flex items-center justify-center shrink-0 ring-2 ring-white dark:ring-slate-800 ${className}`}
      aria-label={name}
    >
      {initials}
    </div>
  )
}
