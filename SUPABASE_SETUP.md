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
