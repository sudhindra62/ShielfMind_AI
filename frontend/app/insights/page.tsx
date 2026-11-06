'use client'

import { useEffect, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Gauge, Gem, Sparkles, TrendingDown } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { api } from '@/lib/api'
import { salesTrend } from '@/lib/demo-data'

const roi = [
  { name: 'Biscuits', value: 31 },
  { name: 'Dairy', value: 18 },
  { name: 'Staples', value: 27 },
  { name: 'Snacks', value: 24 }
]

export default function InsightsPage() {
  const [movers, setMovers] = useState<any>({ fast_movers: [], slow_movers: [] })
  const [sales, setSales] = useState<any[]>([])

  useEffect(() => {
    api.getSalesHistory().then(setSales)
    setMovers({
      fast_movers: ['Maggi Noodles', 'Parle-G', 'Tata Salt', 'Dettol Handwash'],
      slow_movers: ['Reynolds Pen', 'Lifebuoy Soap', 'Glucon-D', 'Vim Bar']
    })
  }, [])

  const chart = sales.length ? sales : salesTrend()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <GlassCard glow="gold" className="p-5"><Gem className="text-brand-gold" /><b className="mt-4 block text-3xl text-white">₹18K</b><span className="text-sm text-slate-400">Projected profit opportunity</span></GlassCard>
        <GlassCard glow="red" className="p-5"><TrendingDown className="text-brand-red" /><b className="mt-4 block text-3xl text-white">₹7.6K</b><span className="text-sm text-slate-400">Margin leakage detected</span></GlassCard>
        <GlassCard glow="green" className="p-5"><Gauge className="text-brand-green" /><b className="mt-4 block text-3xl text-white">4.8x</b><span className="text-sm text-slate-400">Inventory turnover</span></GlassCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_.7fr]">
        <GlassCard glow="cyan" className="p-5" hover={false}>
          <h2 className="text-lg font-bold text-white">Sales Velocity Heat</h2>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chart.slice(-14)}>
              <CartesianGrid stroke="rgba(255,255,255,.05)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(0,212,255,.25)', borderRadius: 14, color: '#fff' }} />
              <Bar dataKey="units" radius={[8, 8, 0, 0]}>
                {chart.slice(-14).map((_, index) => <Cell key={index} fill={index % 3 === 0 ? '#00d4ff' : index % 3 === 1 ? '#bb86fc' : '#00e676'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard glow="purple" className="p-5" hover={false}>
          <h2 className="text-lg font-bold text-white">ROI Mix</h2>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie data={roi} dataKey="value" nameKey="name" innerRadius={70} outerRadius={105} paddingAngle={6}>
                {roi.map((_, index) => <Cell key={index} fill={['#00d4ff', '#bb86fc', '#00e676', '#ffd740'][index]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#0d1526', border: '1px solid rgba(187,134,252,.25)', borderRadius: 14, color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard glow="gold" className="p-5" hover={false}>
        <div className="flex items-center gap-2"><Sparkles className="text-brand-gold" /><h2 className="text-lg font-bold text-white">Insight Carousel</h2></div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {['Bundle slow-moving soap with high-velocity biscuits to unlock working capital.', 'Pre-stock snacks before weekend demand spike.', 'Oil category has stable velocity but rising holding cost.', 'Top sellers should get shelf-front placement today.'].map((text, index) => (
            <div key={text} className="rounded-2xl border border-white/10 bg-white/[.035] p-4 text-sm text-slate-300 transition hover:border-brand-gold/40 hover:text-white">
              <span className="mb-3 block text-xs font-bold uppercase tracking-[.22em] text-brand-gold">Insight {index + 1}</span>
              {text}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  )
}
