import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { signIn, signInWithGoogle } from '../services/auth'
import { isSupabaseConfigured } from '../services/supabase'
import { DEMO_EMAIL, DEMO_PASSWORD } from '../services/demoData'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import toast from 'react-hot-toast'

export default function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '', remember: false })
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  function validate() {
    const errs = {}
    if (!form.email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email'
    if (!form.password) errs.password = 'Password is required'
    return errs
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      await signIn(form.email, form.password)
      // Force full reload for demo mode so AuthContext re-reads session
      if (!isSupabaseConfigured) window.location.href = '/dashboard'
      else navigate('/dashboard')
    } catch (err) {
      const msg = err.message?.includes('Invalid login') || err.message?.includes('credentials')
        ? 'Invalid email or password.'
        : 'Login failed. Please try again.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  async function handleGoogle() {
    setGoogleLoading(true)
    try {
      await signInWithGoogle()
    } catch {
      toast.error('Google sign-in failed. Please try again.')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <span className="font-bold text-lg">HabitTracker</span>
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-4 leading-snug">
            Build better habits,<br />a brighter you.
          </h2>
          <ul className="space-y-3 text-slate-300 text-sm">
            {['☁️  Cloud sync across all devices', '📊  Track streaks and progress', '🏆  Earn achievements', '🔒  Secure and private'].map(t => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </div>
        <p className="text-slate-500 text-xs">Small steps. Big goals.</p>
      </div>

      {/* Right form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-900">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={18} className="text-white" />
            </div>
            <span className="font-bold text-lg text-slate-900 dark:text-white">HabitTracker</span>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">Welcome back!</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-7">Your habits are waiting for you.</p>

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <Input
                label="Email address"
                type="email"
                id="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                error={errors.email}
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPw ? 'text' : 'password'}
                  id="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  error={errors.password}
                  autoComplete="current-password"
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-[38px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1"
                  aria-label={showPw ? 'Hide password' : 'Show password'}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.remember}
                    onChange={e => setForm(p => ({ ...p, remember: e.target.checked }))}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  Remember me
                </label>
                <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Sign In
              </Button>
            </form>

            <div className="relative flex items-center my-5">
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
              <span className="px-3 text-xs text-slate-400">OR</span>
              <div className="flex-1 border-t border-slate-200 dark:border-slate-700" />
            </div>

            <Button
              variant="outline"
              className="w-full"
              size="lg"
              onClick={handleGoogle}
              loading={googleLoading}
            >
              <img
                src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                alt="Google"
                className="w-4 h-4"
              />
              Continue with Google
            </Button>

            {!isSupabaseConfigured && (
              <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mt-4">
                <p className="text-xs font-semibold text-blue-800 dark:text-blue-300 mb-2">🔑 Demo Credentials</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-blue-700 dark:text-blue-400">Email:</span>
                  <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-blue-900 dark:text-blue-200 select-all">{DEMO_EMAIL}</code>
                </div>
                <div className="flex items-center justify-between text-xs mt-1">
                  <span className="text-blue-700 dark:text-blue-400">Password:</span>
                  <code className="bg-blue-100 dark:bg-blue-900/50 px-2 py-0.5 rounded text-blue-900 dark:text-blue-200 select-all">{DEMO_PASSWORD}</code>
                </div>
                <button
                  type="button"
                  onClick={() => { setForm({ email: DEMO_EMAIL, password: DEMO_PASSWORD, remember: true }) }}
                  className="w-full mt-3 text-xs font-medium text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 bg-blue-100 dark:bg-blue-900/50 rounded-lg py-1.5 transition-colors"
                >
                  Fill Demo Credentials
                </button>
              </div>
            )}

            <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-600 dark:text-blue-400 font-medium hover:underline">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
