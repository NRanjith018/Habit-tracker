import { supabase, isSupabaseConfigured } from './supabase'
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_USER } from './demoData'

// ─── Demo mode helpers ────────────────────────────────────────────────────────
const DEMO_SESSION_KEY = 'ht-demo-session'

export function getDemoSession() {
  return localStorage.getItem(DEMO_SESSION_KEY) === 'true'
}

function setDemoSession(active) {
  if (active) localStorage.setItem(DEMO_SESSION_KEY, 'true')
  else localStorage.removeItem(DEMO_SESSION_KEY)
}

// ─── Auth functions ───────────────────────────────────────────────────────────

export async function signUp(email, password, fullName) {
  if (!isSupabaseConfigured) {
    // In demo mode, just start a demo session
    setDemoSession(true)
    return { user: DEMO_USER }
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
  if (error) throw error
  return data
}

export async function signIn(email, password) {
  if (!isSupabaseConfigured) {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      setDemoSession(true)
      return { user: DEMO_USER }
    }
    throw new Error('Invalid login credentials')
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  if (!isSupabaseConfigured || getDemoSession()) {
    setDemoSession(false)
    return
  }
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function resetPassword(email) {
  if (!isSupabaseConfigured) return // silently succeed in demo
  const redirectTo = `${window.location.origin}/reset-password`
  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo })
  if (error) throw error
}

export async function updatePassword(newPassword) {
  if (!isSupabaseConfigured) return
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) throw error
}

export async function signInWithGoogle() {
  if (!isSupabaseConfigured) {
    setDemoSession(true)
    return
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
  if (error) throw error
}

export async function getSession() {
  const { data } = await supabase.auth.getSession()
  return data.session
}
