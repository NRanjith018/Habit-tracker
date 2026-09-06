import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { supabase } from '../services/supabase'
import { updatePassword } from '../services/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function ResetPassword() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase sets the session from the hash on this route
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
  }, [])

  function validate() {
    const errs = {}
    if (!form.password) errs.password = 'Password is required'
    else if (form.password.length < 8) errs.password = 'At least 8 characters'
    if (form.password !== form.confirm) errs.confirm = 'Passwords do not match'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await updatePassword(form.password)
      toast.success('Password updated successfully!')
      navigate('/dashboard')
    } catch {
      toast.error('Failed to reset password. Please request a new reset link.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-slate-900 dark:text-white">HabitTracker</span>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Set new password</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
            Choose a strong password for your account.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="relative">
              <Input
                label="New password"
                type={showPw ? 'text' : 'password'}
                id="password"
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                error={errors.password}
                className="pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 p-1"
              >
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <Input
              label="Confirm new password"
              type={showPw ? 'text' : 'password'}
              id="confirm"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={e => setForm(p => ({ ...p, confirm: e.target.value }))}
              error={errors.confirm}
            />
            <Button type="submit" className="w-full" size="lg" loading={loading}>
              Update Password
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
