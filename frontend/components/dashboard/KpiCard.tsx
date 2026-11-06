import { LucideIcon } from 'lucide-react'
import { AnimatedCounter } from '@/components/ui/AnimatedCounter'
import { GlassCard } from '@/components/ui/GlassCard'

export function KpiCard({
  label,
  value,
  prefix,
  suffix,
  icon: Icon,
  glow,
  trend,
  delay
}: {
  label: string
  value: number
  prefix?: string
  suffix?: string
  icon: LucideIcon
  glow: 'cyan' | 'green' | 'gold' | 'red' | 'purple'
  trend: string
  delay: number
}) {
  const color = {
    cyan: 'text-brand-glow',
    green: 'text-brand-green',
    gold: 'text-brand-gold',
    red: 'text-brand-red',
    purple: 'text-brand-purple'
  }[glow]

  return (
    <GlassCard glow={glow} delay={delay} className="p-5">
      <div className="flex items-start justify-between">
        <div className={`rounded-2xl border border-white/10 bg-white/[.05] p-2.5 ${color}`}>
          <Icon size={20} />
        </div>
        <span className="rounded-full border border-white/10 bg-white/[.04] px-2 py-1 text-xs text-slate-400">{trend}</span>
      </div>
      <div className={`mt-5 text-3xl font-black tracking-tight ${color}`}>
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </div>
      <p className="mt-1 text-sm font-medium text-slate-400">{label}</p>
    </GlassCard>
  )
}
