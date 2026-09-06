import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sun, Moon, Monitor, LogOut, Trash2, Download, Lock } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { signOut, updatePassword } from '../services/auth'
import { getHabits } from '../services/habits'
import { getCompletions } from '../services/completions'
import { isSupabaseConfigured } from '../services/supabase'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import toast from 'react-hot-toast'

function Section({ title, children }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm mb-4">
      <h2 className="font-semibold text-slate-900 dark:text-white mb-4">{title}</h2>
      {children}
    </div>
  )
}

export default function Settings() {
  const { theme, setTheme } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [logoutLoading, setLogoutLoading] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [pw, setPw] = useState({ current: '', new: '', confirm: '' })
  const [pwLoading, setPwLoading] = useState(false)
  const [exportLoading, setExportLoading] = useState(false)

  async function handleLogout() {
    setLogoutLoading(true)
    try {
      await signOut()
      if (!isSupabaseConfigured) window.location.href = '/login'
      else navigate('/login')
    } catch {
      toast.error('Logout failed')
      setLogoutLoading(false)
    }
  }

  async function handlePasswordChange() {
    if (pw.new !== pw.confirm) { toast.error('Passwords do not match'); return }
    if (pw.new.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setPwLoading(true)
    try {
      await updatePassword(pw.new)
      toast.success('Password updated successfully!')
      setPwOpen(false)
      setPw({ current: '', new: '', confirm: '' })
    } catch {
      toast.error('Failed to update password.')
    } finally {
      setPwLoading(false)
    }
  }

  async function handleExport() {
    setExportLoading(true)
    try {
      const [habits] = await Promise.all([getHabits(user.id)])
      const start = new Date(); start.setFullYear(start.getFullYear() - 1)
      const completions = await getCompletions(user.id, start.toISOString().slice(0,10), new Date().toISOString().slice(0,10))
      const exportData = { exportedAt: new Date().toISOString(), habits, completions }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `habittracker-export-${new Date().toISOString().slice(0,10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Data exported!')
    } catch {
      toast.error('Export failed.')
    } finally {
      setExportLoading(false)
    }
  }

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Settings</h1>

      {/* Account */}
      <Section title="Account">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Email</p>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</p>
              <p className="text-xs text-slate-400">Change your login password</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setPwOpen(true)}>
              <Lock size={13} />
              Change
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile</p>
              <p className="text-xs text-slate-400">Edit your name and avatar</p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => navigate('/profile')}>Edit</Button>
          </div>
        </div>
      </Section>

      {/* Notifications */}
      <Section title="Notifications">
        <div className="space-y-3">
          {[
            { label: 'Habit reminders', desc: 'Get notified at your scheduled reminder times' },
            { label: 'Daily summary', desc: 'Receive a daily recap of your progress' },
          ].map(n => (
            <div key={n.label} className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700 last:border-0">
              <div>
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{n.label}</p>
                <p className="text-xs text-slate-400">{n.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-10 h-5 bg-slate-200 dark:bg-slate-600 peer-checked:bg-blue-600 rounded-full peer transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5" />
              </label>
            </div>
          ))}
          <p className="text-xs text-slate-400 mt-2">
            Browser notifications must be enabled in your browser settings.
          </p>
        </div>
      </Section>

      {/* Appearance */}
      <Section title="Appearance">
        <div className="flex gap-3">
          {themeOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setTheme(value)}
              className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border-2 transition-all text-sm font-medium
                ${theme === value
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-blue-300'
                }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </div>
      </Section>

      {/* Data */}
      <Section title="Data & Privacy">
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-700">
            <div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Export data</p>
              <p className="text-xs text-slate-400">Download all your habits and completions as JSON</p>
            </div>
            <Button variant="secondary" size="sm" onClick={handleExport} loading={exportLoading}>
              <Download size={13} />
              Export
            </Button>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete account</p>
              <p className="text-xs text-slate-400">Permanently delete your account and all data</p>
            </div>
            <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
              <Trash2 size={13} />
              Delete
            </Button>
          </div>
        </div>
      </Section>

      {/* About */}
      <Section title="About">
        <div className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
          <p>HabitTracker v1.0.0</p>
          <p>Small steps. Big goals.</p>
          <div className="flex gap-4 mt-3">
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Privacy Policy</span>
            <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">Terms of Service</span>
          </div>
        </div>
      </Section>

      {/* Logout */}
      <Button variant="outline" className="w-full border-slate-300 dark:border-slate-600" onClick={handleLogout} loading={logoutLoading}>
        <LogOut size={16} />
        Log Out
      </Button>

      {/* Change password modal */}
      <Modal isOpen={pwOpen} onClose={() => setPwOpen(false)} title="Change Password">
        <div className="space-y-4">
          <Input label="New password" type="password" value={pw.new} onChange={e => setPw(p => ({ ...p, new: e.target.value }))} placeholder="Min. 8 characters" />
          <Input label="Confirm new password" type="password" value={pw.confirm} onChange={e => setPw(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat password" />
          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setPwOpen(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handlePasswordChange} loading={pwLoading}>Update Password</Button>
          </div>
        </div>
      </Modal>

      {/* Delete account modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Delete Account?">
        <div className="space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            This will permanently delete your account, all habits, and all completion history. This action cannot be undone.
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            To delete your account, please contact support or use the Supabase dashboard.
          </p>
          <Button variant="secondary" className="w-full" onClick={() => setDeleteOpen(false)}>Cancel</Button>
        </div>
      </Modal>
    </div>
  )
}
