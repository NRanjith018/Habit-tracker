export function Skeleton({ className = '' }) {
  return (
    <div className={`animate-pulse rounded-xl bg-slate-200 dark:bg-slate-700 ${className}`} />
  )
}

export function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700">
      <Skeleton className="h-4 w-24 mb-3" />
      <Skeleton className="h-8 w-16 mb-2" />
      <Skeleton className="h-3 w-32" />
    </div>
  )
}

export function SkeletonHabitCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded-xl shrink-0" />
      <div className="flex-1">
        <Skeleton className="h-4 w-36 mb-2" />
        <Skeleton className="h-3 w-24 mb-3" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
      <Skeleton className="w-10 h-10 rounded-xl shrink-0" />
    </div>
  )
}

export function SkeletonList({ count = 4 }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonHabitCard key={i} />
      ))}
    </div>
  )
}
