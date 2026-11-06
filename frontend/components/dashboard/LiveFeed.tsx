'use client'

import { motion } from 'framer-motion'
import { Activity, ScanLine, ShoppingCart, Sparkles } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { useWebSocket } from '@/components/layout/WebSocketProvider'

const feed = [
  { icon: ShoppingCart, text: 'Sale recorded: Maggi Noodles 4 units', color: 'text-brand-green' },
  { icon: Sparkles, text: 'Forecast refreshed for Staples category', color: 'text-brand-purple' },
  { icon: ScanLine, text: 'Shelf scan detected 3 empty gaps', color: 'text-brand-glow' },
  { icon: Activity, text: 'Low-stock risk increased for Parle-G', color: 'text-brand-red' }
]

export function LiveFeed() {
  const { lastMessage } = useWebSocket()
  const rows = lastMessage ? [{ icon: Activity, text: `Live event: ${lastMessage.type}`, color: 'text-brand-glow' }, ...feed] : feed
  return (
    <GlassCard glow="cyan" className="p-5" hover={false}>
      <h2 className="text-lg font-bold text-white">Live Activity</h2>
      <div className="mt-4 space-y-3">
        {rows.slice(0, 5).map((item, index) => {
          const Icon = item.icon
          return (
            <motion.div key={`${item.text}-${index}`} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .06 }} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.035] p-3">
              <Icon size={17} className={item.color} />
              <span className="text-sm text-slate-300">{item.text}</span>
              <span className="ml-auto text-xs text-slate-600">now</span>
            </motion.div>
          )
        })}
      </div>
    </GlassCard>
  )
}
