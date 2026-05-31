# GM Research Suite — Production Go-Live Checklist

## Modes

| Setting | Behavior |
|---------|----------|
| `GM_APP_MODE=demo` (default) | Guest access OK; mock AI when OpenAI not set; demo banner shown |
| `GM_APP_MODE=production` | Sign-in required for portals; stricter API auth |

Add `OPENAI_API_KEY` to switch AI from demo to **live** while keeping `GM_APP_MODE=demo` for testing.

## 1. Environment variables

Copy `.env.example` → `.env` and set:

```bash
GM_APP_MODE=production
NEXT_PUBLIC_DEMO_MODE=false
DATABASE_URL="postgresql://..."   # use Postgres in production (not SQLite)
AUTH_SECRET="$(openssl rand -base64 32)"
NEXTAUTH_URL="https://your-domain.com"
OPENAI_API_KEY=sk-...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
```

Create Stripe Products/Prices for each tier in `src/lib/portals.ts` and map them to `STRIPE_PRICE_*` env vars.

## 2. Database

```bash
npx prisma db push          # or migrate for production
npm run db:seed             # optional demo users (skip in prod)
```

For PostgreSQL, change `provider` in `prisma/schema.prisma` to `postgresql`.

## 3. Deploy (Vercel recommended)

1. Push repo to GitHub
2. Import in Vercel → set env vars
3. Add Stripe webhook: `https://your-domain.com/api/stripe/webhook`
4. Point custom domain

## 4. Services to wire for full parity

| Feature | Production integration |
|---------|------------------------|
| AI writing | ✅ OpenAI (`OPENAI_API_KEY`) |
| Literature | ✅ Semantic Scholar (optional API key) |
| File uploads | ✅ Local disk; use S3 in prod |
| Auth | ✅ NextAuth + Prisma |
| Billing | ✅ Stripe Checkout + webhook |
| Plagiarism | Copyleaks / Turnitin API (placeholder in code) |
| Transcription | OpenAI Whisper / AssemblyAI |
| Statistics | Python/R worker or Modal.com |
| Mobile apps | React Native → same API base URL |

## 5. Demo accounts (after seed)

| Email | Password | Portal |
|-------|----------|--------|
| demo@gmresearch.com | Demo1234! | student |
| supervisor@gmresearch.com | Demo1234! | institution |
| developer@gmresearch.com | Demo1234! | developer |

## 6. Health check

`GET /api/health` — returns `runtimeMode`, `appMode`, and which services are configured.
