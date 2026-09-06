import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, CheckSquare, Calendar, BarChart2,
  Settings, LogOut, Cloud, CheckCircle2
} from 'lucide-react'
import { signOut } from '../../services/auth'
import toast from 'react-hot-toast'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/habits',     icon: CheckSquare,     label: 'Habits' },
  { to: '/calendar',   icon: Calendar,        label: 'Calendar' },
  { to: '/statistics', icon: BarChart2,       label: 'Statistics' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { user } = useAuth()

  async function handleLogout() {
    try {
      await signOut()
      navigate('/login')
    } catch {
      toast.error('Failed to log out')
    }
  }

  return (
    <aside className="hidden md:flex flex-col w-60 bg-slate-900 dark:bg-slate-950 text-white shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-6 py-6 border-b border-slate-700/60">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <CheckCircle2 size={18} className="text-white" />
        </div>
        <div>
          <span className="font-bold text-white text-sm tracking-wide">HabitTracker</span>
          <p className="text-[10px] text-slate-400 leading-none mt-0.5">Small steps. Big goals.</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${isActive
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="px-3 pb-4 border-t border-slate-700/60 pt-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-1
            ${isActive ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`
          }
        >
          <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold shrink-0">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="truncate">
            <p className="text-xs font-medium text-white truncate">{user?.user_metadata?.full_name || 'My Account'}</p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        </NavLink>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 w-full transition-all"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  )
}
