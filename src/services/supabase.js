import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isMissing =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl === 'your_supabase_project_url' ||
  supabaseAnonKey === 'your_supabase_anon_key'

if (isMissing) {
  console.warn(
    '⚠️ Supabase credentials not configured. Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local'
  )
}

// Use a dummy placeholder URL so createClient doesn't throw and crash the whole app.
// Actual API calls will fail gracefully with errors caught by each service.
export const supabase = createClient(
  isMissing ? 'https://placeholder.supabase.co' : supabaseUrl,
  isMissing ? 'placeholder-key' : supabaseAnonKey
)

export const isSupabaseConfigured = !isMissing

