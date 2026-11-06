import { Alert, ForecastSummary, InventoryItem, KPI, Product, ReorderSuggestion } from './types'

export const products: Product[] = [
  { id: 1, name: 'Parle-G Biscuits 800g', sku: 'BISCUIT-001', category: 'Biscuits', brand: 'Parle', cost_price: 42, selling_price: 60, profit_margin: 30 },
  { id: 2, name: 'Amul Butter 500g', sku: 'DAIRY-001', category: 'Dairy', brand: 'Amul', cost_price: 230, selling_price: 280, profit_margin: 17.86 },
  { id: 3, name: 'Tata Salt 1kg', sku: 'SALT-001', category: 'Staples', brand: 'Tata', cost_price: 20, selling_price: 28, profit_margin: 28.57 },
  { id: 4, name: 'Sunflower Oil 1L', sku: 'OIL-001', category: 'Oils', brand: 'Fortune', cost_price: 140, selling_price: 175, profit_margin: 20 },
  { id: 5, name: 'Maggi Noodles 12-pack', sku: 'NOODLES-001', category: 'Instant Food', brand: 'Nestle', cost_price: 144, selling_price: 168, profit_margin: 14.29 },
  { id: 6, name: 'Colgate Toothpaste 200g', sku: 'HYGIENE-001', category: 'Personal Care', brand: 'Colgate', cost_price: 85, selling_price: 120, profit_margin: 29.17 },
  { id: 7, name: 'Dettol Handwash 250ml', sku: 'HYGIENE-003', category: 'Personal Care', brand: 'Dettol', cost_price: 75, selling_price: 110, profit_margin: 31.82 },
  { id: 8, name: 'Tata Tea Premium 500g', sku: 'TEA-001', category: 'Beverages', brand: 'Tata', cost_price: 180, selling_price: 230, profit_margin: 21.74 }
]

export const inventory: InventoryItem[] = products.map((product, index) => {
  const quantities = [18, 42, 23, 74, 11, 56, 29, 63]
  const reorder = [30, 15, 40, 25, 20, 25, 30, 20]
  const max = [240, 120, 320, 200, 160, 200, 240, 160]
  const quantity = quantities[index]
  return {
    id: index + 1,
    product_id: product.id,
    quantity,
    reorder_point: reorder[index],
    max_stock: max[index],
    location: 'Main Store',
    is_low_stock: quantity <= reorder[index],
    is_overstock: quantity >= max[index] * .9,
    stock_percentage: Math.round((quantity / max[index]) * 100),
    product
  }
})

export const kpis: KPI = {
  total_stock_value: 265681,
  revenue_today: 18420,
  revenue_this_week: 562293,
  low_stock_products: 3,
  critical_alerts: 1,
  health_score: 78,
  total_products: 20,
  overstock_products: 2
}

export const alerts: Alert[] = [
  { id: 1, alert_type: 'stockout_risk', severity: 'critical', title: 'Parle-G: 3 Days to Stockout', message: 'Fast-moving biscuit stock is below safe cover. Reorder immediately.', product_name: 'Parle-G Biscuits 800g', financial_impact: -4800, is_read: false },
  { id: 2, alert_type: 'margin_drop', severity: 'warning', title: 'Maggi Margin Compression', message: 'Category benchmark margin is 15 percent. Current margin is below target.', product_name: 'Maggi Noodles 12-pack', financial_impact: -1200, is_read: false },
  { id: 3, alert_type: 'festival_opportunity', severity: 'info', title: 'Festival Demand Spike Predicted', message: 'Staples and snacks may see a 2.4x demand increase. Stock before the weekend.', financial_impact: 18000, is_read: false }
]

export const forecasts: ForecastSummary[] = [
  { product_id: 5, name: 'Maggi Noodles 12-pack', sku: 'NOODLES-001', category: 'Instant Food', current_stock: 11, avg_daily_demand: 17.2, days_of_stock: 1, urgency: 'critical' },
  { product_id: 1, name: 'Parle-G Biscuits 800g', sku: 'BISCUIT-001', category: 'Biscuits', current_stock: 18, avg_daily_demand: 14.1, days_of_stock: 2, urgency: 'critical' },
  { product_id: 3, name: 'Tata Salt 1kg', sku: 'SALT-001', category: 'Staples', current_stock: 23, avg_daily_demand: 8.4, days_of_stock: 3, urgency: 'high' },
  { product_id: 7, name: 'Dettol Handwash 250ml', sku: 'HYGIENE-003', category: 'Personal Care', current_stock: 29, avg_daily_demand: 5.8, days_of_stock: 5, urgency: 'high' },
  { product_id: 2, name: 'Amul Butter 500g', sku: 'DAIRY-001', category: 'Dairy', current_stock: 42, avg_daily_demand: 6.1, days_of_stock: 6, urgency: 'medium' }
]

export const reorder: ReorderSuggestion[] = forecasts.slice(0, 4).map((item, index) => ({
  id: index + 1,
  product_id: item.product_id,
  product_name: item.name,
  sku: item.sku,
  suggested_quantity: [96, 112, 80, 54][index],
  urgency_level: item.urgency,
  estimated_stockout_date: `2026-06-${27 + index}`,
  suggested_order_date: `2026-06-${25 + index}`,
  estimated_cost: [13824, 4704, 1600, 4050][index],
  reasoning: `${item.days_of_stock} days of stock left at ${item.avg_daily_demand} units/day. Target stock covers lead time plus buffer.`,
  status: 'pending'
}))

export function salesTrend() {
  return Array.from({ length: 28 }, (_, index) => {
    const day = index + 1
    const base = 18000 + Math.sin(index / 3) * 5200 + index * 420
    return {
      date: `Jun ${day}`,
      revenue: Math.round(base),
      units: Math.round(190 + Math.cos(index / 2) * 42 + index * 4),
      forecast: Math.round(base * (1.06 + Math.sin(index / 5) * .04))
    }
  })
}

export function forecastChart() {
  return Array.from({ length: 42 }, (_, index) => {
    const historical = index < 24
    const demand = 11 + Math.sin(index / 3) * 4 + index * .25
    return {
      date: `D${index - 23}`,
      actual: historical ? Math.max(2, Math.round(demand + Math.cos(index) * 2)) : null,
      predicted_demand: historical ? null : Math.round(demand + 2),
      lower_bound: historical ? null : Math.round(demand - 3),
      upper_bound: historical ? null : Math.round(demand + 7)
    }
  })
}
