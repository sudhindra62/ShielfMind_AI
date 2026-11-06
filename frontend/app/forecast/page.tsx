'use client'

import { useEffect, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { ForecastChart } from '@/components/charts/ForecastChart'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { ForecastSummary } from '@/lib/types'
import { urgencyClass } from '@/lib/utils'

export default function ForecastPage() {
  const [items, setItems] = useState<ForecastSummary[]>([])
  const [selected, setSelected] = useState(1)
  const [confidence, setConfidence] = useState(true)

  useEffect(() => {
    api.getAllForecasts().then((data) => {
      setItems(data)
      if (data[0]) setSelected(data[0].product_id)
    })
  }, [])

  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <GlassCard glow="purple" className="p-5" hover={false}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">SKU Forecasts</h2>
            <p className="text-sm text-slate-400">Ranked by stockout risk</p>
          </div>
          <button onClick={() => setConfidence(!confidence)} className="rounded-full border border-white/10 bg-white/[.04] p-2 text-slate-300 hover:text-brand-glow">
            {confidence ? <Eye size={17} /> : <EyeOff size={17} />}
          </button>
        </div>
        <div className="mt-5 space-y-2">
          {items.map(item => (
            <button key={item.product_id} onClick={() => setSelected(item.product_id)} className={`w-full rounded-2xl border p-4 text-left transition-all ${selected === item.product_id ? 'border-brand-glow/40 bg-brand-glow/10' : 'border-white/10 bg-white/[.035] hover:border-white/20'}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-white">{item.name}</div>
                  <div className="mt-1 font-mono text-xs text-slate-500">{item.sku}</div>
                </div>
                <Badge className={urgencyClass(item.urgency)}>{item.urgency}</Badge>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                <span>Cover <b className="text-white">{item.days_of_stock}d</b></span>
                <span>Demand <b className="text-white">{item.avg_daily_demand}/d</b></span>
              </div>
            </button>
          ))}
        </div>
      </GlassCard>
      <ForecastChart productId={selected} confidence={confidence} />
    </div>
  )
}
