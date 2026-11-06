import * as demo from './demo-data'

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'

async function req<T>(path: string, fallback: T, opts: RequestInit = {}): Promise<T> {
  try {
    if (typeof window !== 'undefined' && localStorage.getItem('shelfmind-demo-mode') === 'true') {
      return fallback
    }
    const isForm = opts.body instanceof FormData
    const res = await fetch(`${BASE}${path}`, {
      cache: 'no-store',
      headers: isForm ? opts.headers : { 'Content-Type': 'application/json', ...opts.headers },
      ...opts
    })
    if (!res.ok) throw new Error(`${path} failed`)
    return res.json()
  } catch {
    return fallback
  }
}

export const api = {
  getKPIs: () => req('/api/insights/', demo.kpis),
  getProducts: () => req('/api/products/', demo.products),
  getInventory: () => req('/api/inventory/', demo.inventory),
  getAlerts: () => req('/api/alerts/', demo.alerts),
  getAllForecasts: () => req('/api/forecast/all/summary', demo.forecasts),
  getReorderSuggestions: () => req('/api/reorder/', demo.reorder),
  getSalesHistory: () => Promise.resolve(demo.salesTrend()),
  getProductForecast: (productId: number) => req(`/api/forecast/${productId}`, { chart_data: demo.forecastChart(), stockout_date: '2026-06-27', avg_daily_demand: 16.8 }),
  getInsights: () => req('/api/insights/profit-leakage', { low_margin: [], deadstock: [] }),
  refreshForecasts: () => req('/api/forecast/', demo.forecasts, { method: 'GET' }),
  generatePurchaseOrder: (productIds: number[]) => req('/api/reorder/generate-order', { ok: true, productIds }, { method: 'POST', body: JSON.stringify({ product_ids: productIds }) }),
  updateStock: (productId: number, quantity: number) => req(`/api/inventory/${productId}`, { product_id: productId, new_quantity: quantity }, { method: 'PATCH', body: JSON.stringify({ quantity }) }),
  recordSale: (data: object) => req('/api/sales/', { ok: true }, { method: 'POST', body: JSON.stringify(data) }),
  scanShelfImage: async (file: File) => {
    const form = new FormData()
    form.append('image', file)
    return req('/api/scanner/analyze', {
      detected_products: { 'Parle-G': 14, Maggi: 6, Amul: 9, 'Tata Tea': 12 },
      scan_accuracy: .88,
      empty_gaps: 3,
      model: 'local-demo-vision',
      image_url: ''
    }, { method: 'POST', body: form })
  },
  chat: (message: string, sessionId: string) => req('/api/chat/', {
    answer: message.toLowerCase().includes('reorder')
      ? 'Prioritize Maggi, Parle-G, and Tata Salt today. The reorder engine sees less than 3 days of cover on each.'
      : 'ShelfMind is tracking inventory value, live alerts, sales velocity, and forecast risk. Ask about low stock, reorder priorities, or margin leakage.',
    session_id: sessionId,
    timestamp: new Date().toISOString()
  }, { method: 'POST', body: JSON.stringify({ message, session_id: sessionId }) })
}
