import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, Mail } from 'lucide-react'
import { resetPassword } from '../services/auth'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email) { setError('Email is required'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email'); return }
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch {
      toast.error('Failed to send reset email. Please try again.')
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
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/40 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Check your email</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                We've sent a password reset link to <strong>{email}</strong>.
                Check your inbox and click the link to reset your password.
              </p>
              <Link to="/login">
                <Button variant="outline" className="w-full">Back to Login</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Forgot password?</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">
                No worries! Enter your email and we'll send you a reset link.
              </p>
              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <Input
                  label="Email address"
                  type="email"
                  id="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                  error={error}
                  autoComplete="email"
                />
                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Send Reset Link
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
                Remember your password?{' '}
                <Link to="/login" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                  Back to login
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
