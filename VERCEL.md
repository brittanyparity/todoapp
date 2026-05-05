# Vercel: preview shows 403, live URL works

The in-dashboard **Preview** panel loads your deployment through Vercel’s infrastructure (sometimes an iframe or an automated fetch). A **403** there usually means **Vercel blocked that request**, not that your static files are wrong—opening the deployment URL in a normal browser tab often still works.

## Things to check (in order)

### 1. Deployment Protection

**Project → Settings → Deployment Protection**

If **Vercel Authentication** (or password / SSO) protects **Preview** deployments, automated preview and thumbnail requests can get **403** while you’re allowed in when you open the URL yourself (logged in).

- **Option A:** Limit protection to production only, or turn off preview protection for this project if that’s acceptable.
- **Option B:** Keep protection and use [Deployment Protection exceptions](https://vercel.com/docs/deployment-protection/deployment-protection-exceptions) / bypass rules your team needs for automation or previews.

### 2. Firewall (Security)

**Project → Settings → Security → Firewall**

Custom rules (for example geo or IP restrictions) can block Vercel’s own preview/screenshot traffic. If you added strict rules, try relaxing them or adding exceptions for the regions/IPs Vercel uses, then check the preview again.

### 3. Environment variables on Preview

Unrelated to 403, but for this app: set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` on **Preview** (and Production) in **Project → Settings → Environment Variables**, and add your Vercel preview origins to **Supabase → Authentication → URL Configuration → Redirect URLs**.

---

This repo includes **`vercel.json`** so Vercel runs `npm run build` and serves the **`dist`** folder from Vite.
