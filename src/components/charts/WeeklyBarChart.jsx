import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function WeeklyBarChart({ data }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.2)" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
        <Tooltip
          formatter={(v) => [`${v}%`, 'Completion']}
          contentStyle={{ borderRadius: 12, border: 'none', background: '#1e293b', color: '#f1f5f9', fontSize: 12 }}
        />
        <Bar dataKey="rate" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={40} />
      </BarChart>
    </ResponsiveContainer>
  )
}
