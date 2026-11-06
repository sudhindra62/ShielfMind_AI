'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, BellRing, CheckCircle2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { Badge } from '@/components/ui/Badge'
import { api } from '@/lib/api'
import { Alert } from '@/lib/types'
import { urgencyClass } from '@/lib/utils'

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [resolved, setResolved] = useState<number[]>([])

  useEffect(() => { api.getAlerts().then(setAlerts) }, [])

  return (
    <div className="space-y-5">
      <GlassCard glow="red" className="p-6" hover={false}>
        <div className="flex items-center gap-4">
          <div className="rounded-2xl border border-brand-red/30 bg-brand-red/10 p-3 text-brand-red"><BellRing /></div>
          <div>
            <h2 className="text-xl font-bold text-white">Smart Alerts Center</h2>
            <p className="text-sm text-slate-400">Prioritized warnings for stockouts, leakage, anomalies, and opportunities.</p>
          </div>
        </div>
      </GlassCard>

      {alerts.map((alert, index) => {
        const done = resolved.includes(alert.id)
        return (
          <GlassCard key={alert.id} glow={alert.severity === 'critical' ? 'red' : alert.severity === 'warning' ? 'orange' : 'cyan'} delay={index * .04} className={`p-5 ${done ? 'opacity-50' : ''}`} hover={!done}>
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div className="flex gap-4">
                <div className="rounded-2xl border border-white/10 bg-white/[.04] p-3 text-brand-red">
                  {done ? <CheckCircle2 /> : <AlertTriangle />}
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-bold text-white">{alert.title}</h3>
                    <Badge className={urgencyClass(alert.severity === 'critical' ? 'critical' : alert.severity === 'warning' ? 'high' : 'low')}>{alert.severity}</Badge>
                  </div>
                  <p className="mt-2 max-w-3xl text-sm text-slate-400">{alert.message}</p>
                  {alert.product_name && <p className="mt-2 text-xs font-mono text-slate-600">{alert.product_name}</p>}
                </div>
              </div>
              <button onClick={() => setResolved([...resolved, alert.id])} className="rounded-full border border-brand-green/30 bg-brand-green/10 px-4 py-2 text-sm font-bold text-brand-green hover:bg-brand-green/20">
                Resolve
              </button>
            </div>
          </GlassCard>
        )
      })}
    </div>
  )
}
