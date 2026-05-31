# GM Research Suite

Multi-portal AI research platform — **production-ready architecture**, running in **demo mode** by default.

## Quick start

```bash
cd gm-research-suite
npm install
npm run db:push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo accounts (after seed)

| Email | Password |
|-------|----------|
| demo@gmresearch.com | Demo1234! |
| supervisor@gmresearch.com | Demo1234! |
| developer@gmresearch.com | Demo1234! |

## Demo vs production

| | Demo (default) | Production |
|--|----------------|------------|
| `GM_APP_MODE` | `demo` | `production` |
| Access | Guests allowed | Sign-in required on portals |
| AI | Mock text unless `OPENAI_API_KEY` set | Live OpenAI |
| Billing | Simulated | Stripe Checkout |
| Banner | Yellow “Demo mode” | Hidden when fully live |

Add `OPENAI_API_KEY` to `.env` → AI modules show **Live AI** badge while other services can stay in demo.

**Full go-live:** see [PRODUCTION.md](./PRODUCTION.md)

## Portals

| Portal | URL |
|--------|-----|
| Institution (supervisors, markers) | `/institution` |
| Student & research assistant | `/student` |
| Research analysis | `/analysis` |
| Developer (you) | `/developer` |

Each portal: `/[portal]/subscription` for monthly plans.

## Production stack (included)

- **API routes** — `/api/ai/generate`, plagiarism, AI detection, literature, upload, Stripe
- **Database** — Prisma + SQLite (dev) / PostgreSQL (prod)
- **Auth** — NextAuth credentials, register per portal
- **Health** — `GET /api/health`
- **Downloads** — `/download` (web, Android, iOS, Mac, Windows)

## Environment

Copy `.env.example` → `.env`. Key variables:

```env
GM_APP_MODE=demo
DATABASE_URL="file:./dev.db"
AUTH_SECRET=your-secret
OPENAI_API_KEY=          # optional — enables live AI
STRIPE_SECRET_KEY=       # optional — enables billing
```

## Scripts

```bash
npm run dev          # development
npm run build        # production build
npm run start        # run production server
npm run db:push      # sync database
npm run db:seed      # demo users
```
