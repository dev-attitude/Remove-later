# GM Research Suite — Live services configuration

Use this after Vercel shows **Ready**. Your stack:

- **Website / web app:** Vercel → `gmconsultations.com`
- **Database:** Neon → project **Research App**
- **Domain DNS:** Namecheap

---

## 1. Vercel environment variables (required)

Vercel → **gm-research-suite** → **Settings** → **Environment Variables**

Apply to **Production**, **Preview**, and **Development**.

| Variable | Value | Purpose |
|----------|--------|---------|
| `DATABASE_URL` | Neon connection string (pooled) | Database |
| `GM_APP_MODE` | `production` | Production behavior |
| `NEXT_PUBLIC_DEMO_MODE` | `false` | Hide demo banner |
| `AUTH_SECRET` | `openssl rand -base64 32` | Login sessions |
| `NEXTAUTH_URL` | `https://gmconsultations.com` | Auth callbacks |
| `NEXT_PUBLIC_APP_URL` | `https://gmconsultations.com` | Links in app |

Click **Save**, then **Deployments** → **Redeploy**.

---

## 2. Live AI (OpenAI)

| Variable | Value |
|----------|--------|
| `OPENAI_API_KEY` | `sk-...` from [platform.openai.com](https://platform.openai.com) |
| `OPENAI_MODEL` | `gpt-4o-mini` |

Redeploy. Writing/Tutor modules show **Live AI** badge.

---

## 3. Domain (Namecheap + Vercel)

### Vercel
**Settings** → **Domains** → add:
- `gmconsultations.com`
- `www.gmconsultations.com`

### Namecheap → Advanced DNS

**Remove:**
- `www` → `parkingpage.namecheap.com`
- URL redirect `@` if it conflicts

**Keep / add:**

| Type | Host | Value |
|------|------|--------|
| CNAME | `www` | `cname.vercel-dns.com.` |
| A | `@` | `76.76.21.21` |

Save. Wait 15–60 minutes.

---

## 4. Database users on live Neon

Demo users were seeded on Neon. Test login:

- `demo@gmresearch.com` / `Demo1234!`
- `supervisor@gmresearch.com` / `Demo1234!`

Or register at `https://gmconsultations.com/register`

---

## 5. File uploads on live (Vercel Blob)

Without Blob, uploads are **temporary** on Vercel.

1. Vercel → **Storage** → **Create Database** → **Blob**
2. Connect to **gm-research-suite**
3. Vercel adds `BLOB_READ_WRITE_TOKEN` automatically
4. Redeploy

---

## 6. Stripe (subscriptions) — optional

1. [dashboard.stripe.com](https://dashboard.stripe.com) → Products → create prices
2. Add env vars:

```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_STU_PRO=price_...
STRIPE_PRICE_INST_SUPERVISOR=price_...
```

3. Webhook URL: `https://gmconsultations.com/api/stripe/webhook`
4. Redeploy

---

## 7. Web app (install on phone / laptop)

Same URL works as a web app:

1. Open `https://gmconsultations.com` in Chrome or Safari
2. **Share** → **Add to Home Screen** (iPhone) or **Install app** (Chrome)

---

## 8. Verify everything

| Check | URL / action |
|-------|----------------|
| Site loads | `https://gmconsultations.com` |
| Health | `https://gmconsultations.com/api/health` → `database: true` |
| Login | `/login` with demo account |
| Student portal | `/student` |
| Institution | `/institution` |
| AI | Generate text → **Live AI** if OpenAI key set |

---

## 9. After you edit code locally

```bash
cd "/Users/Erastus/Desktop/Research App/gm-research-suite"
git add .
git commit -m "Your change"
git push
```

Vercel redeploys automatically (~2 min).

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Login fails on live | `NEXTAUTH_URL` must be exact `https://gmconsultations.com`, redeploy |
| 500 on register | `DATABASE_URL` missing/wrong in Vercel |
| AI still Demo | Add `OPENAI_API_KEY`, redeploy |
| Domain not loading | DNS not propagated; check Vercel domain status |
