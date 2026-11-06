'use client'

import { useEffect, useState } from 'react'
import { Area, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '@/lib/api'
import { GlassCard } from '@/components/ui/GlassCard'

type Point = { date: string; actual: number | null; predicted_demand: number | null; lower_bound: number | null; upper_bound: number | null }

export function ForecastChart({ productId, confidence = true }: { productId: number; confidence?: boolean }) {
  const [data, setData] = useState<Point[]>([])
  const [stockout, setStockout] = useState('2026-06-27')

  useEffect(() => {
    api.getProductForecast(productId).then((response: any) => {
      setData(response.chart_data || [])
      setStockout(response.stockout_date || '2026-06-27')
    })
  }, [productId])

  return (
    <GlassCard glow="purple" className="p-5" hover={false}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">Forecast Band</h2>
          <p className="text-sm text-slate-400">Past sales, predicted demand, and stockout marker</p>
        </div>
        <div className="rounded-full border border-brand-red/30 bg-brand-red/10 px-3 py-1 text-xs font-semibold text-brand-red">
          Stockout: {stockout}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={330}>
        <ComposedChart data={data} margin={{ top: 12, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(187,134,252,.28)', borderRadius: 14, color: '#fff' }} />
          {confidence && <Area type="monotone" dataKey="upper_bound" stroke="none" fill="rgba(187,134,252,.16)" />}
          {confidence && <Area type="monotone" dataKey="lower_bound" stroke="none" fill="#080d18" />}
          <Line type="monotone" dataKey="actual" stroke="#00e676" strokeWidth={3} dot={false} connectNulls={false} />
          <Line type="monotone" dataKey="predicted_demand" stroke="#00d4ff" strokeWidth={3} strokeDasharray="6 5" dot={false} />
          <ReferenceLine x="D0" stroke="#ffd740" strokeDasharray="4 4" label={{ value: 'Today', fill: '#ffd740', fontSize: 11 }} />
        </ComposedChart>
      </ResponsiveContainer>
    </GlassCard>
  )
}
