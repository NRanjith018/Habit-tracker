import { NavLink } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Calendar, BarChart2, Settings } from 'lucide-react'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Home' },
  { to: '/habits',     icon: CheckSquare,     label: 'Habits' },
  { to: '/calendar',   icon: Calendar,        label: 'Calendar' },
  { to: '/statistics', icon: BarChart2,       label: 'Stats' },
  { to: '/settings',   icon: Settings,        label: 'Settings' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 z-50 safe-area-bottom">
      <div className="flex items-stretch">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors
              ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400'}`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
