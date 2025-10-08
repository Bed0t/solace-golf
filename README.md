## Payments and Orders (Stripe)

This project integrates Stripe Checkout for ordering a configured bag, and a lightweight admin orders view.

### Setup

1. Create a Stripe account and get the API keys.
2. Add the following environment variables to your environment (e.g. `.env.local`):

```
STRIPE_SECRET_KEY=sk_live_or_test_...
STRIPE_PRICE_ID=price_...            # optional. If not set, we create ad-hoc price using STRIPE_UNIT_AMOUNT
STRIPE_UNIT_AMOUNT=65000             # optional. Amount in cents (e.g. 65000 = $650.00)
STRIPE_CURRENCY=usd                  # optional. Defaults to usd
STRIPE_WEBHOOK_SECRET=whsec_...      # required for webhooks
```

Restart dev server after adding env vars.

### Checkout API

- Endpoint: `POST /api/checkout`
- Body includes the configuration metadata; it returns a Checkout Session URL and redirects the customer to Stripe.

Example:

```
fetch('/api/checkout', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ colors: { partId: '#ffffff' }, personalisationText: 'ACE' })
})
```

### Webhooks

Configure a Stripe webhook endpoint that points to `/api/webhooks/stripe` and subscribe at least to `checkout.session.completed`.

For local development:

```
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

### Admin Orders

- View recent orders at `/admin/orders`. It lists Checkout Sessions and displays embedded configuration metadata.
