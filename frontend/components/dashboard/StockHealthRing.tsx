'use client'

import { motion } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'

export function StockHealthRing({ score }: { score: number }) {
  const radius = 76
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  return (
    <GlassCard glow="green" className="p-6 text-center" hover={false}>
      <h2 className="text-lg font-bold text-white">Inventory Health</h2>
      <div className="relative mx-auto mt-5 h-48 w-48">
        <svg viewBox="0 0 190 190" className="-rotate-90">
          <circle cx="95" cy="95" r={radius} fill="none" stroke="rgba(255,255,255,.07)" strokeWidth="14" />
          <motion.circle
            cx="95"
            cy="95"
            r={radius}
            fill="none"
            stroke="url(#healthGradient)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.2, ease: 'easeOut' }}
          />
          <defs>
            <linearGradient id="healthGradient">
              <stop stopColor="#00e676" />
              <stop offset="1" stopColor="#00d4ff" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-black text-white">{score}</div>
          <div className="text-xs font-semibold uppercase tracking-[.2em] text-brand-green">Health</div>
        </div>
      </div>
      <p className="text-sm text-slate-400">Live score blends cover days, risk, deadstock, and alert severity.</p>
    </GlassCard>
  )
}
