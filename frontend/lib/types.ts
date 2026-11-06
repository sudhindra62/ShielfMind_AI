export type Product = {
  id: number
  name: string
  sku: string
  category: string
  brand?: string
  cost_price: number
  selling_price: number
  profit_margin: number
}

export type InventoryItem = {
  id: number
  product_id: number
  quantity: number
  reorder_point: number
  max_stock: number
  location: string
  is_low_stock: boolean
  is_overstock: boolean
  stock_percentage: number
  product: Product
}

export type KPI = {
  total_stock_value: number
  revenue_today: number
  revenue_this_week: number
  low_stock_products: number
  critical_alerts: number
  health_score: number
  total_products: number
  overstock_products: number
}

export type Alert = {
  id: number
  alert_type: string
  severity: 'critical' | 'warning' | 'info' | 'success'
  title: string
  message: string
  product_name?: string
  financial_impact?: number
  is_read: boolean
}

export type ForecastSummary = {
  product_id: number
  name: string
  sku: string
  category: string
  current_stock: number
  avg_daily_demand: number
  days_of_stock: number
  urgency: 'critical' | 'high' | 'medium' | 'low'
}

export type ReorderSuggestion = {
  id: number
  product_id: number
  product_name: string
  sku: string
  suggested_quantity: number
  urgency_level: 'critical' | 'high' | 'medium' | 'low'
  estimated_stockout_date: string
  suggested_order_date: string
  estimated_cost: number
  reasoning: string
  status: string
}
