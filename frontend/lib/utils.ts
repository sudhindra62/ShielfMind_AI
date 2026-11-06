import { clsx, type ClassValue } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function currency(value: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value)
}

export function urgencyClass(urgency: string) {
  if (urgency === 'critical') return 'text-brand-red border-brand-red/30 bg-brand-red/10'
  if (urgency === 'high') return 'text-brand-orange border-brand-orange/30 bg-brand-orange/10'
  if (urgency === 'medium') return 'text-brand-gold border-brand-gold/30 bg-brand-gold/10'
  return 'text-brand-green border-brand-green/30 bg-brand-green/10'
}
