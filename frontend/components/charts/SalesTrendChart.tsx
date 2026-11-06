'use client'

import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export function SalesTrendChart({ data }: { data: Array<{ date: string; revenue: number; forecast: number; units: number }> }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data} margin={{ left: 0, right: 10, top: 15, bottom: 0 }}>
        <defs>
          <linearGradient id="salesRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#00d4ff" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="salesForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bb86fc" stopOpacity={0.2} />
            <stop offset="100%" stopColor="#bb86fc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
        <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(0,212,255,.25)', borderRadius: 14, color: '#fff' }} />
        <Area type="monotone" dataKey="forecast" stroke="#bb86fc" strokeWidth={2} fill="url(#salesForecast)" />
        <Area type="monotone" dataKey="revenue" stroke="#00d4ff" strokeWidth={3} fill="url(#salesRevenue)" />
      </AreaChart>
    </ResponsiveContainer>
  )
}
