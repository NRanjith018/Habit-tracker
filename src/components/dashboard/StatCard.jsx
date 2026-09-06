export default function StatCard({ icon, label, value, bg = 'bg-blue-50' }) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
      <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
    </div>
  )
}
