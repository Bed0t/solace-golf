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

## Email capture (free) via Google Sheets

We capture emails via a tiny API route that forwards to a Google Apps Script webhook which writes rows to a Google Sheet. It’s free with a Google account.

### 1) Create a Google Sheet
- Create a new Google Sheet in your Google Drive, name it for your list
- Add headers in row 1: `timestamp`, `email`, `source`, `userAgent`, `ip`

### 2) Add an Apps Script to receive webhooks
- In the Sheet, go to Extensions → Apps Script
- Replace the default script with the following:

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var email = (data.email || '').toString().trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return ContentService.createTextOutput(JSON.stringify({ error: 'invalid email' }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      new Date(),
      email,
      data.source || 'website',
      data.userAgent || '',
      data.ip || '',
    ]);
    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ error: 'server error' }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput('ok');
}
```

- Click Deploy → New deployment
- Type: Web app
- Description: `Email subscribe`
- Execute as: Me
- Who has access: Anyone
- Deploy and copy the Web app URL

Note: For public web apps, Apps Script enforces CORS for browser calls; we call it server-side from Next.js to avoid CORS issues.

### 3) Configure Next.js env
- Add the script URL to `.env.local`:

```
APPS_SCRIPT_SUBSCRIBE_URL="https://script.google.com/macros/s/xxxxxxxx/exec"
```

- Restart the dev server if running.

### 4) Where the code lives
- API route: `src/app/api/subscribe/route.ts`
- Form: `src/app/signup/page.tsx`

The API validates emails and forwards `{ email, source }` to Apps Script. Update fields as needed.

### 5) Optional: add double opt-in later
- Connect to a proper ESP (e.g., MailerLite free tier) later. For now, the Sheet is your “list”.

