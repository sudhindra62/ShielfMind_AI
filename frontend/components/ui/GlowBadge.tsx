import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Tone = 'cyan' | 'green' | 'gold' | 'purple' | 'red' | 'orange'

const toneMap: Record<Tone, string> = {
  cyan: 'border-brand-glow/35 bg-brand-glow/10 text-brand-glow',
  green: 'border-brand-green/35 bg-brand-green/10 text-brand-green',
  gold: 'border-brand-gold/35 bg-brand-gold/10 text-brand-gold',
  purple: 'border-brand-purple/35 bg-brand-purple/10 text-brand-purple',
  red: 'border-brand-red/35 bg-brand-red/10 text-brand-red',
  orange: 'border-brand-orange/35 bg-brand-orange/10 text-brand-orange'
}

export function GlowBadge({ children, tone = 'cyan', className }: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold', toneMap[tone], className)}>
      {children}
    </span>
  )
}
