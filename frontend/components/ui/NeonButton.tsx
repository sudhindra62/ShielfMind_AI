'use client'

import { ReactNode } from 'react'
import { HTMLMotionProps, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type Tone = 'cyan' | 'green' | 'gold' | 'purple' | 'red'

const toneMap: Record<Tone, string> = {
  cyan: 'border-brand-glow/45 bg-brand-glow/10 text-brand-glow shadow-glow-cyan hover:bg-brand-glow/20',
  green: 'border-brand-green/45 bg-brand-green/10 text-brand-green shadow-glow-green hover:bg-brand-green/20',
  gold: 'border-brand-gold/45 bg-brand-gold/10 text-brand-gold shadow-glow-gold hover:bg-brand-gold/20',
  purple: 'border-brand-purple/45 bg-brand-purple/10 text-brand-purple shadow-glow-purple hover:bg-brand-purple/20',
  red: 'border-brand-red/45 bg-brand-red/10 text-brand-red shadow-glow-red hover:bg-brand-red/20'
}

export function NeonButton({
  children,
  className,
  tone = 'cyan',
  ...props
}: HTMLMotionProps<'button'> & { children: ReactNode; tone?: Tone }) {
  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: .98 }}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all disabled:cursor-not-allowed disabled:opacity-40',
        toneMap[tone],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
