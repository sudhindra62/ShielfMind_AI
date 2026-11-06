'use client'

import { useEffect, useState } from 'react'
import { DatabaseZap } from 'lucide-react'
import { GlowBadge } from '@/components/ui/GlowBadge'

export function DemoModeControl() {
  const [demo, setDemo] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('shelfmind-demo-mode')
    const value = stored === null ? true : stored === 'true'
    setDemo(value)
    localStorage.setItem('shelfmind-demo-mode', String(value))
  }, [])

  function toggle() {
    const next = !demo
    setDemo(next)
    localStorage.setItem('shelfmind-demo-mode', String(next))
    window.dispatchEvent(new CustomEvent('shelfmind-demo-mode', { detail: next }))
  }

  return (
    <button onClick={toggle} className="rounded-full outline-none" title="Toggle demo data mode">
      <GlowBadge tone={demo ? 'gold' : 'green'} className="transition hover:scale-[1.02]">
        <DatabaseZap size={13} />
        {demo ? 'Demo Data' : 'Backend Data'}
      </GlowBadge>
    </button>
  )
}
