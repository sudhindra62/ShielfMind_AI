'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Glow = 'cyan' | 'green' | 'red' | 'gold' | 'purple' | 'orange' | 'none'

const glowMap: Record<Glow, string> = {
  cyan: 'border-brand-glow/30 shadow-glow-cyan hover:border-brand-glow/60',
  green: 'border-brand-green/30 shadow-glow-green hover:border-brand-green/60',
  red: 'border-brand-red/30 shadow-glow-red hover:border-brand-red/60',
  gold: 'border-brand-gold/30 shadow-glow-gold hover:border-brand-gold/60',
  purple: 'border-brand-purple/30 shadow-glow-purple hover:border-brand-purple/60',
  orange: 'border-brand-orange/30 hover:border-brand-orange/60',
  none: 'border-brand-border'
}

export function GlassCard({
  children,
  className,
  glow = 'none',
  delay = 0,
  hover = true
}: {
  children: ReactNode
  className?: string
  glow?: Glow
  delay?: number
  hover?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: .42, delay, ease: 'easeOut' }}
      whileHover={hover ? { y: -3, scale: 1.006 } : undefined}
      className={cn(
        'glass-card relative overflow-hidden rounded-2xl border shadow-card transition-all duration-300',
        'before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-glass-line',
        glowMap[glow],
        className
      )}
    >
      <div className="pointer-events-none absolute left-0 top-0 h-10 w-10 rounded-tl-2xl border-l-2 border-t-2 border-brand-glow/35" />
      <div className="pointer-events-none absolute bottom-0 right-0 h-10 w-10 rounded-br-2xl border-b-2 border-r-2 border-brand-purple/25" />
      {children}
    </motion.div>
  )
}
