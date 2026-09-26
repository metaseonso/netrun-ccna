# AUTH PLAN — sign-in and cloud saves (post-handoff)

The game is static (GitHub Pages). OAuth needs a backend for the token exchange and a place to keep saves.
Decision: **Supabase** (auth + Postgres, free tier, providers built in, JS client works from a static page).

The code is already in place and inactive:
- `js/platform/auth.js` — `Auth.init(config)`, `signIn(provider)`, `signOut()`, `user()`, `onChange(cb)`; uses the Supabase JS client when configured.
- `js/platform/storage.js` — `LocalAdapter` (today) and `RemoteAdapter` (table `profiles`); `Storage.mergeLocalIntoRemote()` uploads local saves once after first sign-in; `Game.save()` pushes to remote when signed in.
- `config/platform.js` — empty `supabaseUrl` / `supabaseAnonKey` slots. Empty = fully offline, no sign-in button.
- `js/game.js` — `onAuth(user)` merges and reloads the profile; the HUD shows SIGN IN / SIGN OUT automatically.

## Steps

1. Create a Supabase project. Copy the project URL and the anon public key into `config/platform.js`.
2. Add the SDK to `index.html` **before** `js/platform/auth.js`:
   `<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js"></script>`
3. Authentication → Providers: enable Google, GitHub, Discord (create the OAuth apps at each provider; redirect URL is the Supabase callback shown in the dashboard). Authentication → URL configuration: add `https://metaseonso.github.io/netrun-ccna/` (and `http://localhost:8765/` for dev) to redirect URLs.
4. Run this SQL in the Supabase SQL editor:

```sql
create table public.profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  handle text not null,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, handle)
);
alter table public.profiles enable row level security;
create policy "own profiles" on public.profiles for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

5. Deploy. On the opening screen SIGN IN appears. After sign-in, local saves upload once; from then on the remote copy is primary and local is a cache.

## Behaviour to verify

- Sign in on device A, play, sign in on device B: same handle list, same progress.
- Play offline (signed out): local only, no errors.
- Conflict: the newer `updated` timestamp wins at merge time.
- Sign out: local cache remains; no remote writes.

## Later options

- Leaderboards / class rankings: a `public_stats` view over `profiles.state->'stats'` with a policy that exposes only aggregate fields.
- Teacher dashboards: a `cohorts` table mapping user ids to a cohort code entered in-game.
