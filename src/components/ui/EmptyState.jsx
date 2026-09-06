import Button from './Button'

export default function EmptyState({ icon, title, description, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {icon && <div className="text-5xl mb-4">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mb-6">{description}</p>
      )}
      {actionLabel && onAction && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
