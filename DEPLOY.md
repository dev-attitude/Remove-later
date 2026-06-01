# Deploy GM Research Suite — Go Live

Recommended stack: **GitHub** + **Vercel** (hosting) + **Neon** (database).  
Total time: about 30–45 minutes.

---

## Overview

```
Your Mac (edit code)  →  git push  →  Vercel (build & host)  →  https://your-app.vercel.app
                                              ↓
                                        Neon (PostgreSQL)
                                        OpenAI / Stripe (APIs)
```

---

## Step 1 — Put code on GitHub

In Terminal:

```bash
cd "/Users/Erastus/Desktop/Research App/gm-research-suite"

git init
git add .
git commit -m "Initial commit — GM Research Suite"

# Create a new empty repo on github.com (name: gm-research-suite), then:
git remote add origin https://github.com/YOUR_USERNAME/gm-research-suite.git
git branch -M main
git push -u origin main
```

`.env` is gitignored — secrets stay on your machine and in Vercel only.

---

## Step 2 — Create a production database (Neon)

1. Go to [https://neon.tech](https://neon.tech) → sign up (free).
2. **New Project** → name `gm-research-prod` → region closest to your users.
3. Copy the **connection string** (pooled) → use as `DATABASE_URL`

---

## Step 3 — Deploy on Vercel

1. Go to [https://vercel.com](https://vercel.com) → sign up with GitHub.
2. **Add New Project** → import `gm-research-suite`.
3. **Root directory:** `gm-research-suite` (if repo root is parent folder, adjust).
4. **Environment variables** — add all of these:

| Name | Value |
|------|--------|
| `GM_APP_MODE` | `production` |
| `NEXT_PUBLIC_DEMO_MODE` | `false` |
| `DATABASE_URL` | Neon connection string |
| `AUTH_SECRET` | Run: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://YOUR-PROJECT.vercel.app` (update after first deploy) |
| `OPENAI_API_KEY` | Your OpenAI key (for live AI) |
| `OPENAI_MODEL` | `gpt-4o-mini` |
| `STRIPE_SECRET_KEY` | From Stripe Dashboard (live or test) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | After Step 5 |
| `STRIPE_PRICE_STU_PRO` | Stripe Price ID for Student Pro |
| `STRIPE_PRICE_INST_SUPERVISOR` | etc. (see `.env.example`) |

5. Click **Deploy**. Wait for build to finish.

6. Copy your live URL (e.g. `https://gm-research-suite.vercel.app`).

7. **Update** `NEXTAUTH_URL` in Vercel → Settings → Environment Variables to that exact URL → **Redeploy**.

---

## Step 4 — Seed production users (optional)

From your Mac (with production `DATABASE_URL` in `.env` temporarily, or Neon SQL editor):

```bash
export DATABASE_URL="your-neon-connection-string"
npx prisma db push
npm run db:seed
```

Or register real users at `https://your-app.vercel.app/register`.

---

## Step 5 — Stripe webhooks (billing)

1. [Stripe Dashboard](https://dashboard.stripe.com) → **Developers → Webhooks**.
2. **Add endpoint:** `https://YOUR-APP.vercel.app/api/stripe/webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy **Signing secret** → Vercel env `STRIPE_WEBHOOK_SECRET` → Redeploy.

Create **Products / Prices** matching tiers in `src/lib/portals.ts` and map Price IDs to `STRIPE_PRICE_*` env vars.

---

## Step 5b — Contact form email + SMS

When someone submits **Contact** or a **Shop quote**, the app can email **97transformative@gmail.com** and text **both** office numbers.

In Vercel → **Settings → Environment Variables**, add:

| Variable | Purpose |
|----------|---------|
| `RESEND_API_KEY` | Email via [Resend](https://resend.com) (recommended), **or** use SMTP rows below |
| `CONTACT_FROM_EMAIL` | Verified sender, e.g. `Skyrapay <hello@yourdomain.com>` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` | Gmail App Password alternative |
| `AFRICASTALKING_USERNAME`, `AFRICASTALKING_API_KEY` | SMS via Africa's Talking (best for Namibia) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_SMS_FROM` | SMS via Twilio (enable **Namibia** under Messaging → Geo permissions) |

If email works but SMS does not, you likely only added email keys. The notification email will show a yellow/red **SMS status** box at the bottom.

Optional overrides (defaults are already your site contact details):

- `CONTACT_NOTIFY_EMAIL`
- `CONTACT_NOTIFY_PHONES` — comma-separated, e.g. `+264812986481,+264818774482`

Redeploy after saving. Test from `/contact` and `/shop`.

**Note:** With `GM_APP_MODE=production` and no email/SMS keys, the form returns an error asking the client to call you instead.

---

## Step 6 — Custom domain (optional)

Vercel → Project → **Settings → Domains** → add e.g. `research.youruniversity.edu`.

Update `NEXTAUTH_URL` to `https://research.youruniversity.edu` and redeploy.

---

## Step 7 — File uploads on live (important)

Vercel serverless **does not keep files on disk**. For production uploads:

- **Option A:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob) — add `BLOB_READ_WRITE_TOKEN`
- **Option B:** AWS S3 bucket — set `AWS_*` vars in `.env.example`

Until then, uploads save metadata in the database but files may not persist on Vercel.

---

## After go-live — how you keep editing

1. Edit code locally in Cursor.
2. `git add . && git commit -m "..." && git push`
3. Vercel auto-rebuilds (usually 1–2 min).
4. Live site updates; **user data stays** in Neon.

---

## Health check

Visit: `https://YOUR-APP.vercel.app/api/health`

You want `"runtimeMode": "live"` when OpenAI is configured.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Build fails on Prisma | Ensure `DATABASE_URL` is set in Vercel |
| Sign-in redirects fail | `NEXTAUTH_URL` must match exact live URL (https, no trailing slash) |
| AI still shows "Demo" | Add `OPENAI_API_KEY` in Vercel env and redeploy |
| 500 on register | Run `prisma db push` against Neon (Step 4) |

---

## Alternative hosts

- **Railway / Render:** similar steps; set `npm run build` and `npm start`.
- **VPS (DigitalOcean):** use `npm run build && npm start` behind nginx + PM2; use managed Postgres.

For most teams, **Vercel + Neon** is the fastest path to a real live URL.
