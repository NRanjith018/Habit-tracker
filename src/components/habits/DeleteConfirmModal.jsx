import Button from '../ui/Button'
import Modal from '../ui/Modal'

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, habitName, loading }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Habit?">
      <div className="space-y-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Are you sure you want to permanently delete{' '}
          <strong className="text-slate-900 dark:text-white">"{habitName}"</strong>?
          This will also delete all its completion history and cannot be undone.
        </p>
        <div className="flex gap-3">
          <Button variant="secondary" className="flex-1" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm} loading={loading}>
            Delete
          </Button>
        </div>
      </div>
    </Modal>
  )
}
