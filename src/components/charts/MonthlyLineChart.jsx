import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'

export default function MonthlyLineChart({ data }) {
  // Sample every 5th point if too many
  const sampled = data.filter((_, i) => data.length <= 14 || i % Math.ceil(data.length / 14) === 0)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={sampled} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Completion']}
          contentStyle={{ borderRadius: 12, border: 'none', background: '#1e293b', color: '#f1f5f9', fontSize: 12 }}
        />
        <Area type="monotone" dataKey="rate" stroke="#3B82F6" strokeWidth={2} fill="url(#blueGrad)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
