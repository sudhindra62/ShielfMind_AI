'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Boxes, IndianRupee, PlayCircle, TrendingUp, Zap } from 'lucide-react'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { LiveFeed } from '@/components/dashboard/LiveFeed'
import { StockHealthRing } from '@/components/dashboard/StockHealthRing'
import { GlassCard } from '@/components/ui/GlassCard'
import { SalesTrendChart } from '@/components/charts/SalesTrendChart'
import { api } from '@/lib/api'
import { currency, urgencyClass } from '@/lib/utils'
import { KPI, ReorderSuggestion } from '@/lib/types'
import { GlowBadge } from '@/components/ui/GlowBadge'
import { NeonButton } from '@/components/ui/NeonButton'

export default function DashboardPage() {
  const [kpis, setKpis] = useState<KPI | null>(null)
  const [sales, setSales] = useState<any[]>([])
  const [reorder, setReorder] = useState<ReorderSuggestion[]>([])
  const [store, setStore] = useState('Sharma Kirana')
  const [category, setCategory] = useState('All Categories')

  useEffect(() => {
    api.getKPIs().then(setKpis)
    api.getSalesHistory().then(setSales)
    api.getReorderSuggestions().then(setReorder)
  }, [])

  const data = kpis || { total_stock_value: 0, revenue_today: 0, revenue_this_week: 0, low_stock_products: 0, critical_alerts: 0, health_score: 0, total_products: 0, overstock_products: 0 }

  return (
    <div className="space-y-6 animate-fade-in">
      <GlassCard glow="purple" className="p-5" hover={false}>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <GlowBadge tone="cyan">YC Demo Day Mode</GlowBadge>
              <GlowBadge tone="green">Local-first</GlowBadge>
              <GlowBadge tone="gold">No cloud APIs</GlowBadge>
            </div>
            <p className="mt-3 max-w-3xl text-sm text-slate-400">
              Walkthrough: load demo data, review stockout risk, inspect forecast confidence, scan a shelf image, then generate reorder actions.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select value={store} onChange={(event) => setStore(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white outline-none">
              {['Sharma Kirana', 'Indiranagar Express', 'HSR Mini Mart'].map(value => <option key={value} className="bg-brand-surface">{value}</option>)}
            </select>
            <select value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-2xl border border-white/10 bg-white/[.04] px-4 py-3 text-sm font-bold text-white outline-none">
              {['All Categories', 'Biscuits', 'Dairy', 'Staples', 'Personal Care'].map(value => <option key={value} className="bg-brand-surface">{value}</option>)}
            </select>
            <NeonButton tone="gold"><PlayCircle size={17} /> Run Demo</NeonButton>
          </div>
        </div>
      </GlassCard>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <KpiCard label="Total Stock Value" value={data.total_stock_value} prefix="₹" icon={Boxes} glow="cyan" trend="+4.2%" delay={0} />
        <KpiCard label="Today's Revenue" value={data.revenue_today} prefix="₹" icon={IndianRupee} glow="green" trend="+12.1%" delay={.05} />
        <KpiCard label="7-Day Revenue" value={data.revenue_this_week} prefix="₹" icon={TrendingUp} glow="gold" trend="+8.5%" delay={.1} />
        <KpiCard label="Low Stock Items" value={data.low_stock_products} icon={AlertTriangle} glow="red" trend="action" delay={.15} />
        <KpiCard label="Store Health" value={data.health_score} suffix="%" icon={Zap} glow="purple" trend="AI score" delay={.2} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.7fr_.8fr]">
        <GlassCard glow="cyan" className="p-5" hover={false}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-white">Sales Pulse</h2>
              <p className="text-sm text-slate-400">Revenue trend with predictive overlay</p>
            </div>
            <div className="rounded-full border border-brand-green/30 bg-brand-green/10 px-3 py-1 text-xs font-semibold text-brand-green">
              Profit improvement: +9.2%
            </div>
          </div>
          <SalesTrendChart data={sales} />
        </GlassCard>
        <StockHealthRing score={data.health_score} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1fr_.9fr]">
        <GlassCard glow="red" className="p-5" hover={false}>
          <h2 className="text-lg font-bold text-white">Priority Reorders</h2>
          <div className="mt-4 space-y-3">
            {reorder.slice(0, 5).map((item, index) => (
              <div key={item.id} className="rounded-2xl border border-white/10 bg-white/[.035] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{item.product_name}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.sku} · order by {item.suggested_order_date}</div>
                  </div>
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${urgencyClass(item.urgency_level)}`}>{item.urgency_level}</span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                  <div className="rounded-xl bg-white/[.04] p-3 text-slate-400">Qty <b className="block text-white">{item.suggested_quantity}</b></div>
                  <div className="rounded-xl bg-white/[.04] p-3 text-slate-400">Cost <b className="block text-white">{currency(item.estimated_cost)}</b></div>
                  <div className="rounded-xl bg-white/[.04] p-3 text-slate-400">Risk <b className="block text-brand-red">T-{index + 1}d</b></div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        <LiveFeed />
      </section>
    </div>
  )
}
