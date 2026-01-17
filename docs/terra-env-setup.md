### Terra environment setup (Expo + Supabase)

1) Create env vars

- Expo client (bundled):
  - `EXPO_PUBLIC_TERRA_DEV_ID`
  - `EXPO_PUBLIC_TERRA_API_KEY`
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`

- Server-only (not bundled):
  - `TERRA_SECRET` (webhook signing secret)
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `TERRA_WEBHOOK_URL` (points to your edge function)

2) Local development

- With Expo, export env vars in your shell before `expo start` (e.g., direnv, dotenvx, or `.zshrc`).
- Alternatively, use `app.config.js` to read from `process.env`.

3) EAS (build/deploy)

- Set Expo public keys as EAS secrets with `eas secret:create --scope project`:
  - `EXPO_PUBLIC_TERRA_DEV_ID`
  - `EXPO_PUBLIC_TERRA_API_KEY`
  - `EXPO_PUBLIC_SUPABASE_URL`
  - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
- Set server-only secrets in Supabase project settings and CI for edge functions:
  - `TERRA_SECRET`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `WEBHOOK_CORS_ORIGIN` (optional)
  - `WEBHOOK_RATE_LIMIT_PER_MINUTE` (optional)

4) iOS/Android schemes

- iOS `Info.plist` includes `daybreaker` and `exp+daybreaker-portal` URL schemes.
- Android manifest includes an intent filter for `daybreaker`.

5) Verification

- In-app: ensure `TERRA_CONFIG.DEV_ID` and `API_KEY` are not placeholders.
- On server: deploy edge function `consumeTerraWebhook` and set `TERRA_SECRET`.
