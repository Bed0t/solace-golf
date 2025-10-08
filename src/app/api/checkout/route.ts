import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export const runtime = 'nodejs'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY
if (!stripeSecretKey) {
  console.warn('[Stripe] STRIPE_SECRET_KEY is not set. Checkout will fail until configured.')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, { apiVersion: '2024-06-20' }) : (null as unknown as Stripe)

type CheckoutBody = {
  colors?: Record<string, string>
  personalisationText?: string
  personalisationColor?: string
  personalisationOffset?: { x: number; y: number; z: number }
  glbPath?: string
  quantity?: number
  priceId?: string
  customerEmail?: string
}

function getOrigin(req: NextRequest): string {
  const hdr = req.headers.get('origin') || req.headers.get('x-forwarded-host')
  if (!hdr) return 'http://localhost:3000'
  if (hdr.startsWith('http')) return hdr
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  return `${proto}://${hdr}`
}

function splitMetadata(name: string, value: string): Record<string, string> {
  // Stripe metadata value limit is ~500 chars per value. Split into chunks.
  const chunkSize = 450
  if (value.length <= chunkSize) return { [name]: value }
  const out: Record<string, string> = {}
  let idx = 0
  let part = 1
  while (idx < value.length && part <= 5) { // cap at 5 parts
    out[`${name}_${part}`] = value.slice(idx, idx + chunkSize)
    idx += chunkSize
    part += 1
  }
  return out
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CheckoutBody

    if (!stripe) {
      return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 })
    }

    const origin = getOrigin(req)

    const quantity = Math.max(1, Math.min(99, Number(body.quantity || 1)))

    const unitAmountEnv = process.env.STRIPE_UNIT_AMOUNT ? Number(process.env.STRIPE_UNIT_AMOUNT) : undefined
    const unitAmount = Number.isFinite(unitAmountEnv as number) ? (unitAmountEnv as number) : 65000 // default $650.00
    const currency = process.env.STRIPE_CURRENCY || 'usd'
    const priceId = body.priceId || process.env.STRIPE_PRICE_ID

    // Build concise configuration summary and full JSON for metadata
    const config = {
      glbPath: body.glbPath || '/SS-001 copy.glb',
      colors: body.colors || {},
      personalisationText: body.personalisationText || '',
      personalisationColor: body.personalisationColor || '#000000',
      personalisationOffset: body.personalisationOffset || { x: 0, y: 0, z: 0 },
    }
    const configJson = JSON.stringify(config)

    const metadata: Record<string, string> = {
      product: 'Solace One Custom Bag',
      config_summary: `txt:${config.personalisationText?.slice(0, 60) || ''}|cols:${Object.keys(config.colors).length}`,
    }
    Object.assign(metadata, splitMetadata('config', configJson))

    const params: Stripe.Checkout.SessionCreateParams = {
      mode: 'payment',
      allow_promotion_codes: true,
      customer_email: body.customerEmail,
      success_url: `${origin}/configurator?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/configurator?status=cancelled`,
      metadata,
      line_items: [
        priceId
          ? { price: priceId, quantity }
          : {
              quantity,
              price_data: {
                currency,
                unit_amount: unitAmount,
                product_data: {
                  name: 'Solace One — Custom Golf Bag',
                },
              },
            },
      ],
    }

    const session = await stripe.checkout.sessions.create(params)
    return NextResponse.json({ id: session.id, url: session.url })
  } catch (err: any) {
    console.error('[Stripe][Checkout][Error]', err)
    return NextResponse.json({ error: err?.message || 'Checkout error' }, { status: 400 })
  }
}







