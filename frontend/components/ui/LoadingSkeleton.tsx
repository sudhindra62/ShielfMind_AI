import { cn } from '@/lib/utils'

export function LoadingSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('relative overflow-hidden rounded-2xl bg-white/[.055]', className)}>
      <div className="absolute inset-0 -translate-x-full animate-[borderFlow_1.6s_linear_infinite] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  )
}
