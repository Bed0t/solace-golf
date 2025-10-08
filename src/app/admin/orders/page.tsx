'use client'
import { useEffect, useState } from 'react'

type Order = {
  id: string
  amount_total: number | null
  currency: string | null
  customer_email: string | null
  created: number
  metadata: Record<string, string> | null
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/orders')
        if (!res.ok) throw new Error(await res.text())
        const data = (await res.json()) as { orders: Order[] }
        setOrders(data.orders)
      } catch (e: any) {
        setError(e?.message || 'Failed to load orders')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold mb-4">Orders</h1>
      {loading && <div>Loading…</div>}
      {error && <div className="text-red-600">{error}</div>}
      {orders && (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="rounded border p-4">
              <div className="text-sm text-neutral-700">{new Date(o.created * 1000).toLocaleString()}</div>
              <div className="font-medium">{o.customer_email || 'Guest'}</div>
              <div>
                {(o.amount_total ?? 0) / 100} {o.currency?.toUpperCase()}
              </div>
              {o.metadata && (
                <details className="mt-2">
                  <summary className="cursor-pointer">Configuration</summary>
                  <pre className="mt-2 whitespace-pre-wrap break-words text-xs">
                    {(() => {
                      const full = o.metadata.config || [1,2,3,4,5].map((i)=>o.metadata![`config_${i}`]).filter(Boolean).join('')
                      try { return JSON.stringify(JSON.parse(full), null, 2) } catch { return full || JSON.stringify(o.metadata, null, 2) }
                    })()}
                  </pre>
                </details>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  )
}







