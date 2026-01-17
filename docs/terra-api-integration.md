### Overview

Terra is a unified API for 100+ wearable devices and health apps. Instead of building and maintaining separate integrations (Fitbit, Apple Health, Garmin, Whoop, Oura, Peloton, Strava, etc.), we connect to Terra once and receive standardized data across providers.

### Data Types Received

- **Daily summaries**: steps, calories, distance, active duration
- **Body metrics**: weight, body fat, muscle mass, BMR
- **Sleep data**: stages, duration, quality scores
- **Activity data**: workouts, exercises, heart rate zones
- **Nutrition**: calories, macros, water intake
- **Vitals**: heart rate, HRV, blood pressure, glucose

### Webhook Payload Structure

Terra sends webhooks with a `type` and a `user` object:

```json
{
  "type": "activity",
  "user": { "user_id": "terra_abc123", "provider": "WHOOP", "reference_id": "<our-user-id>" },
  "data": { /* provider-normalized fields */ },
  "timestamp": "2025-01-01T12:34:56Z"
}
```

Webhook types we handle: `activity`, `body`, `daily`, `nutrition`, `sleep`, `menstruation`, plus misc types like `user_reauth`, `deauth`, `access_revoked`, `connection_error`.

Storage and DB:
- Data webhooks (`activity`, `sleep`, `daily`, `nutrition`, `body`, `menstruation`) are stored in `terra-payloads` storage bucket under `YYYY/MM/DD/<type>/<terra_user_id>/<timestamp>.json` and logged into table `terra_data_payloads`.
- Other events are stored similarly and logged into `terra_misc_payloads`.
- We link `terra_user_id` to our users via `device_connections (user_id ↔ terra_user_id, provider)`.

### Implementation Details

- **Webhook endpoint**: `/consumeTerraWebhook` implemented as a Supabase Edge Function at `supabase/functions/consumeTerraWebhook/index.ts`.
- **Signature verification**: HMAC SHA-256 of the raw JSON body using `TERRA_SECRET`, compared to header `x-terra-signature`.
- **Rate limiting**: simple IP-based limiter (configurable via env `WEBHOOK_RATE_LIMIT_PER_MINUTE`).
- **CORS**: `WEBHOOK_CORS_ORIGIN` env controls `Access-Control-Allow-Origin`.
- **Supabase Storage**: Bucket `terra-payloads` (private) holds raw webhook JSON. Path scheme above.
- **DB inserts**:
  - `terra_data_payloads(terra_user_id, payload_type, provider, reference_id, storage_path, raw_payload, received_at)`
  - `terra_misc_payloads(...)` for non-data events
- **Linking**: When `reference_id` (our user ID) exists, we update `device_connections` to set `terra_user_id` and mark the connection active. We also attempt provider-based linking if `terra_user_id` is absent.

Authentication flow for connecting wearables:
1. From `DeviceConnectionsScreen`, generate Terra auth URL using `generateTerraAuthUrl(user.id, provider, redirectUrl)`.
2. User completes Terra/OAuth flow; Terra sends webhook with `reference_id` and `user.user_id`.
3. Edge Function links the Terra user to our `device_connections` row, sets `sync_status=active`.

Data refresh intervals:
- Terra pushes webhooks on new/updated data. We can also schedule periodic backfills via Terra APIs when needed.

Error handling and retry:
- Webhook responds 200 on success; transient storage/DB issues are logged and do not block a 200 to avoid repeated retries.
- Signature failures return 401; non-POST returns 405.

### Env and security

- Client bundles only `EXPO_PUBLIC_TERRA_DEV_ID` and `EXPO_PUBLIC_TERRA_API_KEY`.
- `TERRA_SECRET` is server-only; do NOT bundle in the app.
- See `docs/terra-env-setup.md` for environment guidance.

### User Flow

- **Connect**: Users open `Connect` from onboarding or settings. Choose provider → deep link to Terra auth → return to app.
- **Sync**: After linking, new data syncs automatically through webhooks. We display connection status and last sync time in `DeviceConnectionsScreen`.
- **Experience**: Wearable data enhances workout tracking, readiness/sleep insights, and progress monitoring throughout the app.

### Security Considerations

- **Secrets in env**: `TERRA_SECRET`, `TERRA_DEV_ID`, `TERRA_API_KEY`, Supabase keys not hardcoded.
- **Rate limiting**: Enabled on webhook endpoint; tune via env.
- **Signature verification**: Required for every request; invalid signatures rejected.
- **CORS**: Restrict `WEBHOOK_CORS_ORIGIN` to trusted domains for browser-based testing; server-to-server calls ignore.


