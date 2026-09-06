import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <BottomNav />
    </div>
  )
}
