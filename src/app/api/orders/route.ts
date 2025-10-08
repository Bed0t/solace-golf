import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

export async function GET(_req: NextRequest) {
  if (!stripeSecretKey) {
    return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
  }
  const stripe = new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' })

  try {
    const sessions = await stripe.checkout.sessions.list({ limit: 50 })
    const orders = sessions.data.map((s) => ({
      id: s.id,
      amount_total: s.amount_total,
      currency: s.currency,
      customer_email: s.customer_details?.email ?? s.customer_email ?? null,
      created: s.created,
      metadata: s.metadata ?? null,
    }))
    return NextResponse.json({ orders })
  } catch (err: any) {
    console.error('[Orders][List][Error]', err)
    return NextResponse.json({ error: err?.message || 'Failed to fetch orders' }, { status: 400 })
  }
}







