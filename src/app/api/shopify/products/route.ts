import { NextRequest, NextResponse } from 'next/server'
import { fetchProducts } from '@/lib/shopify'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest) {
  try {
    const items = await fetchProducts(50)
    return NextResponse.json({ products: items })
  } catch (err: any) {
    console.error('[Shopify][Products][Error]', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch products' }, { status: 400 })
  }
}



