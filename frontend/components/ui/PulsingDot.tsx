export function PulsingDot({ color = 'green' }: { color?: 'green' | 'red' | 'cyan' | 'orange' }) {
  const colors = {
    green: 'bg-brand-green shadow-glow-green',
    red: 'bg-brand-red shadow-glow-red',
    cyan: 'bg-brand-glow shadow-glow-cyan',
    orange: 'bg-brand-orange'
  }
  return <span className={`inline-flex h-2.5 w-2.5 rounded-full ${colors[color]} animate-glow-pulse`} />
}
