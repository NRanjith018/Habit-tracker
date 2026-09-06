import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import AppLayout from './components/layout/AppLayout'

// Pages
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Dashboard from './pages/Dashboard'
import Habits from './pages/Habits'
import HabitDetails from './pages/HabitDetails'
import Calendar from './pages/Calendar'
import Statistics from './pages/Statistics'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-800 dark:text-white',
              duration: 3000,
              style: { borderRadius: '10px', fontFamily: 'Inter, sans-serif' },
            }}
          />
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
            <Route path="/reset-password" element={<ResetPassword />} />

            {/* Protected app routes */}
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/habits" element={<Habits />} />
              <Route path="/habits/:id" element={<HabitDetails />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/statistics" element={<Statistics />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
