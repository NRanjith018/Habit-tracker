import { useState, useEffect, useCallback, useRef } from 'react'
import { Camera } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { getProfile, updateProfile, uploadAvatar } from '../services/profile'
import { getHabits } from '../services/habits'
import { getCompletions } from '../services/completions'
import Avatar from '../components/ui/Avatar'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import { Skeleton } from '../components/ui/Skeleton'
import toast from 'react-hot-toast'

export default function Profile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [stats, setStats] = useState({ habits: 0, completions: 0 })
  const fileRef = useRef(null)

  const load = useCallback(async () => {
    try {
      const [p, h] = await Promise.all([getProfile(user.id), getHabits(user.id)])
      setProfile(p)
      setName(p.full_name || '')

      // Total completions (last year)
      const start = new Date()
      start.setFullYear(start.getFullYear() - 1)
      const comps = await getCompletions(user.id, start.toISOString().slice(0, 10), new Date().toISOString().slice(0, 10))
      const done = comps.filter(c => c.completed).length
      setStats({ habits: h.length, completions: done })
    } catch {
      toast.error('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }, [user.id])

  useEffect(() => { load() }, [load])

  async function handleSave() {
    setSaving(true)
    try {
      const updated = await updateProfile(user.id, { full_name: name })
      setProfile(updated)
      toast.success('Profile updated!')
    } catch {
      toast.error('Failed to save profile.')
    } finally {
      setSaving(false)
    }
  }

  async function handleAvatar(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadAvatar(user.id, file)
      await updateProfile(user.id, { avatar_url: url })
      setProfile(p => ({ ...p, avatar_url: url }))
      toast.success('Avatar updated!')
    } catch {
      toast.error('Failed to upload avatar.')
    } finally {
      setUploading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile</h1>

      {/* Avatar & info */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm mb-5">
        <div className="flex items-center gap-5">
          <div className="relative">
            <Avatar name={profile?.full_name || user?.email} avatarUrl={profile?.avatar_url} size="xl" />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow"
              aria-label="Change avatar"
            >
              {uploading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Camera size={12} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{profile?.full_name || 'No name set'}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
            <p className="text-xs text-slate-400 mt-1">
              Member since {new Date(user?.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Total Habits', value: stats.habits, icon: '🎯' },
          { label: 'Total Completions', value: stats.completions, icon: '✅' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-sm text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Edit name */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700 shadow-sm">
        <h2 className="font-semibold text-slate-900 dark:text-white mb-4">Edit Profile</h2>
        <div className="space-y-4 max-w-sm">
          <Input
            label="Full name"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Your full name"
          />
          <Input label="Email address" value={user?.email} disabled className="opacity-60 cursor-not-allowed" />
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
        </div>
      </div>
    </div>
  )
}
