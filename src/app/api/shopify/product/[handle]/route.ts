import { NextRequest, NextResponse } from 'next/server'
import { fetchProductByHandle } from '@/lib/shopify'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, ctx: { params: { handle: string } }) {
  try {
    const handle = ctx.params.handle
    if (!handle) return NextResponse.json({ error: 'Missing handle' }, { status: 400 })
    const product = await fetchProductByHandle(handle)
    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ product })
  } catch (err: any) {
    console.error('[Shopify][ProductByHandle][Error]', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch product' }, { status: 400 })
  }
}



