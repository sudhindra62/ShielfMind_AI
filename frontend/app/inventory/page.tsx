'use client'

import { useEffect, useMemo, useState } from 'react'
import { Boxes, Search, SlidersHorizontal } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { InventoryItem } from '@/lib/types'
import { currency, urgencyClass } from '@/lib/utils'

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  useEffect(() => { api.getInventory().then(setItems) }, [])

  const categories = useMemo(() => ['All', ...Array.from(new Set(items.map(item => item.product.category)))], [items])
  const filtered = items.filter(item => {
    const matchesText = `${item.product.name} ${item.product.sku} ${item.product.brand}`.toLowerCase().includes(query.toLowerCase())
    return matchesText && (category === 'All' || item.product.category === category)
  })

  return (
    <div className="space-y-6">
      <GlassCard glow="cyan" className="p-5" hover={false}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">Stock Management</h2>
            <p className="text-sm text-slate-400">Fast scanning, low-stock detection, and inventory value clarity.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className="flex min-w-72 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-slate-400">
              <Search size={16} />
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="w-full bg-transparent text-white outline-none placeholder:text-slate-600" placeholder="Search SKU or product" />
            </label>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-slate-300">
              <SlidersHorizontal size={16} />
              <select value={category} onChange={(event) => setCategory(event.target.value)} className="bg-transparent outline-none">
                {categories.map(cat => <option key={cat} className="bg-brand-surface">{cat}</option>)}
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((item, index) => (
          <GlassCard key={item.id} glow={item.is_low_stock ? 'red' : item.is_overstock ? 'gold' : 'green'} delay={index * .03} className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="truncate text-base font-bold text-white">{item.product.name}</div>
                <div className="mt-1 font-mono text-xs text-slate-500">{item.product.sku}</div>
              </div>
              <Badge className={item.is_low_stock ? urgencyClass('critical') : 'border-brand-green/30 bg-brand-green/10 text-brand-green'}>
                {item.is_low_stock ? 'Low stock' : 'Healthy'}
              </Badge>
            </div>
            <div className="mt-5 flex items-end justify-between">
              <div>
                <div className="text-4xl font-black text-white">{item.quantity}</div>
                <div className="text-xs text-slate-500">units on hand</div>
              </div>
              <div className="text-right text-sm text-slate-400">
                Value <b className="block text-white">{currency(item.quantity * item.product.cost_price)}</b>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs text-slate-500">
                <span>Reorder point {item.reorder_point}</span>
                <span>{item.stock_percentage}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div className={`h-full rounded-full ${item.is_low_stock ? 'bg-brand-red' : 'bg-brand-green'}`} style={{ width: `${Math.min(100, item.stock_percentage)}%` }} />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="p-10 text-center" hover={false}>
          <Boxes className="mx-auto text-slate-500" />
          <p className="mt-3 text-slate-400">No inventory matched your filters.</p>
        </GlassCard>
      )}
    </div>
  )
}
