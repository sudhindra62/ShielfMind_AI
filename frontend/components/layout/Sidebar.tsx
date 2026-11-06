'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { AlertTriangle, BarChart3, Bell, Bot, Boxes, BrainCircuit, Camera, LayoutDashboard, ShoppingCart, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useWebSocket } from './WebSocketProvider'
import { PulsingDot } from '@/components/ui/PulsingDot'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventory', icon: Boxes },
  { href: '/forecast', label: 'AI Forecast', icon: BrainCircuit },
  { href: '/scanner', label: 'Shelf Vision', icon: Camera },
  { href: '/orders', label: 'Reorder AI', icon: ShoppingCart },
  { href: '/insights', label: 'Insights', icon: BarChart3 },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/chat', label: 'AI Chat', icon: Bot }
]

export function Sidebar() {
  const pathname = usePathname()
  const { isConnected } = useWebSocket()
  return (
    <aside className="hidden h-screen w-72 shrink-0 border-r border-brand-border/80 bg-brand-surface/70 backdrop-blur-xl lg:sticky lg:top-0 lg:flex lg:flex-col">
      <div className="border-b border-brand-border/80 p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-glow/30 bg-brand-glow/10 text-brand-glow shadow-glow-cyan">
            <Store size={22} />
          </div>
          <div>
            <div className="text-lg font-bold leading-none text-white">ShelfMind</div>
            <div className="mt-1 text-xs font-medium text-brand-glow">AI Retail Intelligence</div>
          </div>
        </div>
        <div className={cn('mt-4 flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold', isConnected ? 'border-brand-green/30 bg-brand-green/10 text-brand-green' : 'border-brand-orange/30 bg-brand-orange/10 text-brand-orange')}>
          <PulsingDot color={isConnected ? 'green' : 'orange'} />
          {isConnected ? 'Live AI Active' : 'Demo Sync Active'}
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {nav.map((item) => {
          const active = pathname === item.href
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                className={cn('relative flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all', active ? 'border-brand-glow/35 bg-brand-glow/10 text-brand-glow shadow-glow-cyan' : 'border-transparent text-slate-400 hover:bg-white/5 hover:text-white')}
              >
                <Icon size={18} />
                {item.label}
                {active && <motion.span layoutId="nav-dot" className="ml-auto h-1.5 w-1.5 rounded-full bg-brand-glow" />}
              </motion.div>
            </Link>
          )
        })}
      </nav>
      <div className="p-4">
        <div className="rounded-2xl border border-white/10 bg-white/[.04] p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-white">
            <AlertTriangle size={16} className="text-brand-gold" />
            Sharma Kirana Store
          </div>
          <p className="mt-1 text-xs text-slate-500">Koramangala, Bangalore</p>
          <div className="mt-3 grid grid-cols-4 gap-1">
            <span className="h-1.5 rounded-full bg-brand-green" />
            <span className="h-1.5 rounded-full bg-brand-green/70" />
            <span className="h-1.5 rounded-full bg-brand-gold" />
            <span className="h-1.5 rounded-full bg-brand-red/70" />
          </div>
        </div>
      </div>
    </aside>
  )
}
