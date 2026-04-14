# M-Pesa Integration Guide

RugbyFundX supports donations in Kenyan Shillings (KSH) via M-Pesa STK Push (Lipa Na M-Pesa Express). The platform receives the KSH payment and records an ADA equivalent alongside it in the transaction ledger.

---

## How It Works

```
Donor enters KSH amount
        ↓
App fetches live KSH/ADA rate (CoinGecko)
        ↓
STK Push sent to donor's phone (Daraja API)
        ↓
Donor enters M-Pesa PIN to confirm
        ↓
Daraja sends callback to /api/mpesa/callback
        ↓
Transaction recorded with KSH + ADA equivalent
        ↓
Team's totalRaised updated
```

---

## Daraja API Setup

### 1. Create a Daraja App

1. Go to [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Sign up / log in
3. Click **My Apps** → **Add a New App**
4. Name it (e.g. `rugbyfundx`)
5. Under **APIs**, tick **M-Pesa Express** (STK Push)
6. Save the app

### 2. Get Your Credentials

From the app detail page copy:
- **Consumer Key** — the public identifier
- **Consumer Secret** — the private key (treat like a password)

### 3. Verify Credentials

Run this curl command to confirm authentication works (replace placeholders):

```bash
curl -s "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials" \
  -u "CONSUMER_KEY:CONSUMER_SECRET"
```

Expected success response:
```json
{ "access_token": "SGWcJPtNtYNPGm1uSUdf4jWj2V5gn", "expires_in": "3599" }
```

If you get `400.008.01 Invalid Authentication`:
- Check the colon between KEY and SECRET — both must be in the same quoted string
- Confirm **M-Pesa Express** is subscribed in your app's APIs tab
- Copy credentials fresh from the portal (do not retype)

---

## Environment Variables

Add these to `.env.local`:

```env
# M-Pesa Daraja API
MPESA_ENV=sandbox
MPESA_CONSUMER_KEY=your_consumer_key_here
MPESA_CONSUMER_SECRET=your_consumer_secret_here
MPESA_BUSINESS_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919

# Publicly accessible URL for Daraja callbacks
# In dev: use ngrok (see below)
# In production: your deployed domain
MPESA_CALLBACK_URL=https://xxxx.ngrok.io
```

The shortcode `174379` and passkey above are the official **Safaricom sandbox test values** — they work with any sandbox app.

---

## Local Development with ngrok

Daraja must be able to POST to your callback URL. In local dev your machine is not publicly accessible, so you need ngrok to tunnel:

```bash
# Install ngrok if needed
# https://ngrok.com/download

# Expose port 3000
ngrok http 3000
```

Copy the `https://xxxx.ngrok.io` URL and set it as `MPESA_CALLBACK_URL` in `.env.local`, then restart the dev server.

> You must restart `bun dev` every time you change `.env.local`.

---

## API Routes

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/mpesa/initiate` | POST | Initiates STK Push, stores pending request |
| `/api/mpesa/callback` | POST | Daraja calls this when payment completes |
| `/api/mpesa/status/[id]` | GET | Polls payment status (used by MpesaModal) |
| `/api/mpesa/status/[id]` | POST | Dev-only: simulate a confirmed payment |
| `/api/exchange-rate` | GET | Live KSH/ADA rate from CoinGecko (5-min cache) |

---

## Dev Mode (No Credentials)

If `MPESA_CONSUMER_KEY` is not set, the app enters **dev simulate mode**:

- Clicking "Donate via M-Pesa" creates a fake pending transaction
- A **"Simulate M-Pesa Confirmation"** button appears in the waiting state
- Clicking it calls `POST /api/mpesa/status/[id]` which triggers the full callback logic
- The transaction is recorded as if Daraja confirmed it

This lets you test the complete UI and data flow without Daraja credentials or ngrok.

---

## Sandbox Testing with a Real Phone Number

The Safaricom sandbox sends a **real STK Push to real Safaricom numbers**. No actual money is deducted — the PIN prompt is triggered but the transaction is simulated on Safaricom's side.

Accepted phone formats:
- `07XXXXXXXX`
- `01XXXXXXXX`
- `2547XXXXXXXX`
- `2541XXXXXXXX`

Steps:
1. Add credentials to `.env.local`
2. Start ngrok and update `MPESA_CALLBACK_URL`
3. Restart `bun dev`
4. Go to any team page → **Donate via M-Pesa (KSH)**
5. Enter your Safaricom number and an amount
6. You will receive an STK Push on your phone
7. Enter any PIN (sandbox does not validate the PIN)
8. The callback fires → transaction is recorded

---

## Transaction Data Model

M-Pesa transactions are stored with extra fields alongside regular ADA donations:

```typescript
{
  type: "mpesa",
  amount: number,         // ADA equivalent (used for totalRaised)
  kshAmount: number,      // Original KSH amount paid
  adaEquivalent: number,  // ADA at time of payment
  exchangeRate: number,   // KES per 1 ADA at time of payment
  txHash: string,         // M-Pesa receipt number (e.g. SB91HJ0KLM)
  donorPhone: string,     // Masked: 2547****4149
  walletAddress: "mpesa", // placeholder (no Cardano address)
}
```

The transparency dashboard shows M-Pesa donations with their KSH amount and ADA equivalent, and displays the M-Pesa receipt number instead of a Cardanoscan link.

---

## Daraja API Reference

| API | Purpose | Used in this project |
|-----|---------|---------------------|
| **M-Pesa Express** | Initiates STK Push | Yes — `/api/mpesa/initiate` |
| **M-Pesa Express Query** | Checks STK Push status | Optional fallback |
| **Authorization** | Gets OAuth access token | Yes — called internally before every request |
| C2B | Paybill/till incoming payments | No |
| B2C | Business paying out to customers | No |

---

## Production Checklist

- [ ] Replace `MPESA_ENV=sandbox` with `MPESA_ENV=production`
- [ ] Get production consumer key and secret from Daraja
- [ ] Replace sandbox shortcode `174379` with your live paybill/till number
- [ ] Replace sandbox passkey with your live passkey (from Daraja portal)
- [ ] Set `MPESA_CALLBACK_URL` to your production domain (must be HTTPS)
- [ ] Rotate sandbox credentials after testing (do not reuse in production)
