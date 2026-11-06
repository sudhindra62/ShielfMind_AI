'use client'

import { useEffect, useRef, useState } from 'react'

export function AnimatedCounter({
  value,
  prefix = '',
  suffix = '',
  decimals = 0,
  duration = 1100,
  className
}: {
  value: number
  prefix?: string
  suffix?: string
  decimals?: number
  duration?: number
  className?: string
}) {
  const [display, setDisplay] = useState(0)
  const start = useRef(0)
  const started = useRef<number | null>(null)
  const frame = useRef<number>()

  useEffect(() => {
    start.current = display
    started.current = null
    const tick = (time: number) => {
      if (!started.current) started.current = time
      const progress = Math.min((time - started.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(start.current + (value - start.current) * eased)
      if (progress < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [value, duration])

  const formatted = decimals ? display.toFixed(decimals) : Math.round(display).toLocaleString('en-IN')
  return <span className={className}>{prefix}{formatted}{suffix}</span>
}
