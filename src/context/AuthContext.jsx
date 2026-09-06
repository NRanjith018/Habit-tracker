import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured } from '../services/supabase'
import { getDemoSession } from '../services/auth'
import { DEMO_USER } from '../services/demoData'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for demo session first
    if (getDemoSession()) {
      setUser(DEMO_USER)
      setSession({ user: DEMO_USER })
      setLoading(false)
      return
    }

    if (!isSupabaseConfigured) {
      // No Supabase, no demo session → show public pages
      setLoading(false)
      return
    }

    // Real Supabase auth
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Re-check demo session on storage changes (login/logout)
  useEffect(() => {
    const handler = () => {
      if (getDemoSession()) {
        setUser(DEMO_USER)
        setSession({ user: DEMO_USER })
      } else if (!isSupabaseConfigured) {
        setUser(null)
        setSession(null)
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [])

  const value = { user, session, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
