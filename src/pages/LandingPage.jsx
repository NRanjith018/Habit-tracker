import { Link } from 'react-router-dom'
import { CheckCircle2, TrendingUp, Calendar, Cloud, Shield, Zap } from 'lucide-react'
import Button from '../components/ui/Button'

const features = [
  { icon: '🔥', title: 'Build Streaks', desc: 'Track consecutive days and keep your momentum going.' },
  { icon: '📊', title: 'View Progress', desc: 'Beautiful charts and stats to see how far you\'ve come.' },
  { icon: '📅', title: 'Calendar History', desc: 'Visual calendar showing your completion history by day.' },
  { icon: '☁️', title: 'Cloud Sync', desc: 'Your data syncs instantly across all your devices.' },
  { icon: '🎯', title: 'Custom Goals', desc: 'Set targets with custom units — minutes, pages, litres, and more.' },
  { icon: '🏆', title: 'Achievements', desc: 'Earn badges as you hit milestones and stay consistent.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <header className="flex items-center justify-between px-6 md:px-16 py-5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <CheckCircle2 size={18} />
          </div>
          <span className="font-bold text-lg tracking-tight">HabitTracker</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" className="text-white hover:bg-white/10">Login</Button>
          </Link>
          <Link to="/signup">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 py-20 md:py-32">
        <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/40 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
          <Zap size={14} />
          Small steps. Big goals.
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold max-w-3xl leading-tight mb-6">
          Build better habits.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Become a better you.
          </span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
          Track your habits, build streaks, and see your progress every day.
          Cloud-synced and always with you.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link to="/signup">
            <Button size="xl" className="w-full sm:w-auto">
              Get Started — It's Free
            </Button>
          </Link>
          <Link to="/login">
            <Button size="xl" variant="outline" className="w-full sm:w-auto border-slate-600 text-slate-300 hover:bg-white/5 hover:border-slate-500">
              Log In
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-16 py-16 md:py-24">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-3">
            Everything you need to stay consistent
          </h2>
          <p className="text-slate-400 text-center mb-12">
            Designed to be simple, powerful, and motivating.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl p-6 transition-all"
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 py-16 text-center">
        <div className="max-w-md mx-auto bg-blue-600/20 border border-blue-500/30 rounded-3xl p-10">
          <h2 className="text-2xl font-bold mb-3">Start today</h2>
          <p className="text-slate-400 mb-6 text-sm">
            Free forever. No credit card required.
          </p>
          <Link to="/signup">
            <Button size="xl" className="w-full">Create Your Account</Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center text-slate-600 text-xs py-8">
        © {new Date().getFullYear()} HabitTracker · Built with 💙
      </footer>
    </div>
  )
}
