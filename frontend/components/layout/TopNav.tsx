'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BarChart3, Bell, Bot, Boxes, BrainCircuit, Camera, Command, LayoutDashboard, Search, ShoppingCart } from 'lucide-react'
import { useWebSocket } from './WebSocketProvider'
import { PulsingDot } from '@/components/ui/PulsingDot'
import { DemoModeControl } from './DemoModeControl'

const labels: Record<string, string> = {
  '/dashboard': 'Command Center',
  '/inventory': 'Inventory Control',
  '/forecast': 'Demand Forecasting',
  '/scanner': 'Shelf Vision',
  '/orders': 'Reorder Planner',
  '/insights': 'Business Insights',
  '/alerts': 'Smart Alerts',
  '/chat': 'AI Inventory Chat'
}

const mobileNav = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dash' },
  { href: '/inventory', icon: Boxes, label: 'Stock' },
  { href: '/forecast', icon: BrainCircuit, label: 'AI' },
  { href: '/scanner', icon: Camera, label: 'Scan' },
  { href: '/orders', icon: ShoppingCart, label: 'Order' },
  { href: '/insights', icon: BarChart3, label: 'BI' },
  { href: '/chat', icon: Bot, label: 'Chat' }
]

export function TopNav() {
  const pathname = usePathname()
  const { isConnected } = useWebSocket()
  return (
    <header className="sticky top-0 z-30 border-b border-brand-border/70 bg-brand-bg/65 px-4 py-4 backdrop-blur-xl sm:px-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[.24em] text-brand-glow">
            <Command size={14} /> ShelfMind OS
          </p>
          <h1 className="mt-1 text-xl font-bold text-white sm:text-2xl">{labels[pathname] || 'Retail Decision Co-Pilot'}</h1>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <div className="flex w-72 items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-4 py-2 text-sm text-slate-400">
            <Search size={16} /> Search SKU, alert, supplier
          </div>
          <Link href="/alerts" className="rounded-full border border-white/10 bg-white/[.04] p-2 text-slate-300 hover:border-brand-glow/40 hover:text-brand-glow">
            <Bell size={18} />
          </Link>
          <DemoModeControl />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[.04] px-3 py-2 text-xs font-semibold text-slate-300">
            <PulsingDot color={isConnected ? 'green' : 'orange'} />
            {isConnected ? 'Realtime' : 'Demo Live'}
          </div>
        </div>
      </div>
      <nav className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
        <DemoModeControl />
        {mobileNav.map((item) => {
          const Icon = item.icon
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className={`flex shrink-0 items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${active ? 'border-brand-glow/40 bg-brand-glow/10 text-brand-glow' : 'border-white/10 bg-white/[.035] text-slate-400'}`}>
              <Icon size={14} /> {item.label}
            </Link>
          )
        })}
      </nav>
    </header>
  )
}
