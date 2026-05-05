# Supabase setup for this to-do app

## 1. Run the database SQL

1. Open the [Supabase Dashboard](https://supabase.com/dashboard) and select your project (`rxtyvkzlytbpxevfruhp` or the one matching your URL).
2. In the left sidebar, go to **SQL Editor**.
3. Click **New query**.
4. Open the file `supabase/schema.sql` from this repo, copy **all** of its contents, and paste them into the editor.
5. Click **Run** (or press the shortcut shown in the UI).

You should see success with no errors. This creates the `public.tasks` table, indexes, triggers (for `user_id` and `updated_at`), and Row Level Security policies so each user only sees and changes their own rows.

## 2. Confirm authentication is enabled

1. Go to **Authentication** → **Providers**.
2. Ensure **Email** is enabled (it is by default).

If **Confirm email** is required under **Authentication** → **Providers** → **Email**, new sign-ups must confirm via email before they can sign in. For local testing you can turn that off.

### Email confirmation on localhost (avoid “connection refused” and 401)

The confirmation link in the email must open **your running dev server** on the **same port** Vite uses, and that URL must be allowed in Supabase.

1. In the dashboard go to **Authentication** → **URL Configuration**.
2. Set **Site URL** to your dev app root, for example `http://localhost:5173` (use the port shown when you run `npm run dev`, often `5173`).
3. Under **Redirect URLs**, add at least:
   - `http://localhost:5173`
   - `http://localhost:5173/**` (if your project UI offers a wildcard pattern), or add any path you use.
   - Optionally `http://127.0.0.1:5173` if you open the app via that host.

If **Site URL** still points at `http://localhost:3000` (a common default) but this app runs on **5173**, the link opens a host where nothing is listening → **localhost refused to connect**. A bad or disallowed redirect can also cause **`401`** when exchanging the auth code.

4. Keep **`npm run dev` running** in the project folder, then click **Confirm** in the email so the browser can load your app and finish sign-in.

This app passes **`emailRedirectTo`** on sign-up so the link targets the same origin and port as the tab where you registered (it must still appear under **Redirect URLs** in the dashboard). After you change URL settings in Supabase, **sign up again** (or use **Resend** from the **Authentication** → **Users** screen) so the next email uses the updated redirect.

## 3. Environment variables (local dev)

1. Copy `.env.example` to `.env.local` if you do not already have one.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the values from **Project Settings** → **API** (same as in this project’s `.env.local`).

This Vite app is configured with `envPrefix: "NEXT_PUBLIC_"` so those names are exposed to the browser (same convention as Next.js). Do **not** commit `.env.local`; it is listed in `.gitignore`.

## 4. Run the app

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). Create an account or sign in; tasks are stored per user in Supabase.

## Security note

The anon key is safe to use in a frontend **only** if RLS policies are correct (they are in `schema.sql`). Never put the **service role** key in frontend code or `.env.local` for this app.

If this key was ever committed to a public repository, rotate it in **Project Settings** → **API**.
