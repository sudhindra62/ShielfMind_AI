'use client'

import { useEffect, useState } from 'react'
import { ChevronDown, FileText, ShoppingCart } from 'lucide-react'
import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { ReorderSuggestion } from '@/lib/types'
import { currency, urgencyClass } from '@/lib/utils'

export default function OrdersPage() {
  const [items, setItems] = useState<ReorderSuggestion[]>([])
  const [open, setOpen] = useState<number | null>(null)

  useEffect(() => { api.getReorderSuggestions().then(setItems) }, [])

  return (
    <div className="space-y-6">
      <GlassCard glow="gold" className="p-6" hover={false}>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Autonomous Reorder Planner</h2>
            <p className="text-sm text-slate-400">AI-ranked recommendations with expandable demand rationale.</p>
          </div>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-brand-gold/40 bg-brand-gold/10 px-5 py-3 text-sm font-bold text-brand-gold hover:bg-brand-gold/20">
            <FileText size={17} /> Generate Purchase Order
          </button>
        </div>
      </GlassCard>

      <div className="space-y-4">
        {items.map((item, index) => (
          <GlassCard key={item.id} glow={item.urgency_level === 'critical' ? 'red' : item.urgency_level === 'high' ? 'orange' : 'gold'} delay={index * .04} className="p-5" hover={false}>
            <button onClick={() => setOpen(open === item.id ? null : item.id)} className="flex w-full flex-col gap-4 text-left md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-brand-gold">
                  <ShoppingCart size={22} />
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{item.product_name}</div>
                  <div className="mt-1 text-xs text-slate-500">{item.sku} · suggested order {item.suggested_order_date}</div>
                </div>
              </div>
              <div className="grid grid-cols-3 items-center gap-3 md:min-w-[420px]">
                <div className="text-sm text-slate-400">Qty <b className="block text-white">{item.suggested_quantity}</b></div>
                <div className="text-sm text-slate-400">Cost <b className="block text-white">{currency(item.estimated_cost)}</b></div>
                <Badge className={urgencyClass(item.urgency_level)}>{item.urgency_level}</Badge>
                <ChevronDown className={`col-span-3 mx-auto text-slate-500 transition-transform md:col-span-1 ${open === item.id ? 'rotate-180' : ''}`} size={18} />
              </div>
            </button>
            {open === item.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-5 rounded-2xl border border-white/10 bg-white/[.035] p-4">
                <p className="text-sm text-slate-300">{item.reasoning}</p>
                <div className="mt-4 grid grid-cols-12 gap-1">
                  {Array.from({ length: 36 }, (_, i) => (
                    <span key={i} className="h-10 rounded-md bg-gradient-to-t from-brand-glow/10 to-brand-glow/60" style={{ opacity: .25 + ((i * 7) % 10) / 16 }} />
                  ))}
                </div>
              </motion.div>
            )}
          </GlassCard>
        ))}
      </div>
    </div>
  )
}
