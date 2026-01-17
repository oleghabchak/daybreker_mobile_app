# EAS + Firebase CI/CD Migration Report (Phase 0)

This document captures the current Codemagic setup and an actionable plan to migrate to EAS (Build, Submit, Update) + Firebase (Hosting, optional App Distribution) with minimal, reviewable changes.

Status: Read‑only assessment, no build config changes yet.

## What Codemagic Does Today

Workflows detected in `codemagic.yaml`:

- React Native Android → Google Play (Internal)
  - Triggers: push and tag on `main`
  - Signing: Codemagic keystore reference `prod_android_keystore`
  - Env group `google_play` expected:
    - `GOOGLE_PLAY_SERVICE_ACCOUNT_CREDENTIALS` (JSON)
    - Optional `PACKAGE_NAME` (currently `com.daybreaker.portal` provided via vars)
  - Steps: install deps, lint, set `sdk.dir`, bump `versionCode` and `versionName` in `android/app/build.gradle`, build `bundleRelease`, publish to Google Play Internal track

- React Native iOS → TestFlight
  - Triggers: push and tag on `main`
  - Signing: Codemagic iOS signing with distribution type `app_store`
  - Env group `appstore_credentials` expected:
    - `APP_STORE_CONNECT_PRIVATE_KEY`, `APP_STORE_CONNECT_KEY_IDENTIFIER`, `APP_STORE_CONNECT_ISSUER_ID`, `APP_STORE_APPLE_ID`
  - Steps: install deps, lint, `pod install`, apply profiles, increment build number via `agvtool`, build IPA, submit to TestFlight (not App Store)

- Codemagic smoke check (CI only)

Notable behaviors:
- Versioning: Android versionCode auto‑incremented via Play latest build number; iOS CFBundleVersion incremented via ASC latest TestFlight build.
- Web: no Codemagic workflow; current repo uses `npm run build:web` and `firebase deploy` locally.

## Repository Assessment

- Project type: Expo managed (Expo SDK ~53). Files present: `app.json`, `App.tsx`, `expo` deps, `ios/`, `android/` native projects.
- IDs:
  - iOS bundleIdentifier: `com.daybreaker.portal`
  - Android package: `com.daybreaker.portal`
- Web Hosting: `firebase.json` points `public: dist`, SPA rewrites enabled.
- EAS config: `eas.json` exists but only with CLI and basic build profiles; no update channels defined; no submit profiles.
- Updates (OTA): `expo-updates` not in package.json yet.

## Target State (EAS + Firebase)

Two pipelines, preserving semantics:

1) Preview (PRs → `develop`/feature):
   - Build: EAS Build
     - Android: `apk` (easier for testers) or `aab` if needed
     - iOS: `internal` distribution (adhoc) if Apple creds present; otherwise skip with checklist
   - Distribute: Firebase App Distribution (APK/IPA) if tokens present; otherwise fallback to EAS Build artifacts only
   - OTA: EAS Update to channel `preview` with `runtimeVersion.policy: nativeVersion`
   - Web: Build `expo export --platform web` and deploy Firebase Hosting preview channel

2) Release (tags `v*` on `main`):
   - Build: EAS Build production (`aab` / App Store build)
   - Submit: EAS Submit (Google Play track / TestFlight)
   - OTA: EAS Update to channel `production` (optionally staged rollout)
   - Web: Firebase Hosting production deploy

Guardrails:
- No secrets in repo. CI checks for required secrets and emits a checklist with skip behavior if missing.
- Local dev unchanged. Scripts continue to work with `npm` (lockfile present).

## Delta Plan (Files to Add/Modify)

Add
- `.github/workflows/eas-preview.yml` — PR/branch builds, Firebase preview hosting, EAS Update channel `preview`
- `.github/workflows/eas-release.yml` — tag builds, EAS Submit, Hosting prod, EAS Update `production`
- `docs/release/PLAYBOOK.md` — roles, steps, credentials, emergency procedures

Modify
- `eas.json` — add preview/production profiles, `cli.appVersionSource: remote`, `build.production.autoIncrement: true`, submit profiles, update channels
- `app.json` (or `app.config.ts`) — ensure `updates` config and `runtimeVersion.policy: nativeVersion`
- `package.json` — add helper scripts (`eas:update:preview`, `eas:update:prod`), no behavioral breaking changes

Archive
- Move `codemagic.yaml` → `.archive/codemagic.yaml` (retain for reference)

Optional
- Add `expo-updates` via `npx expo install expo-updates` and run `npx eas update:configure` (CI‑safe; no secrets required)

## Secrets Inventory (to recreate in GitHub/EAS)

GitHub Actions Secrets (org/repo):
- `EAS_TOKEN` — EAS CLI token (non‑scoped, can be a bot account)
- `FIREBASE_TOKEN` — Firebase CLI token for Hosting and optionally App Distribution
- `FIREBASE_PROJECT_ID` — `daybreaker-health-portal`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` — JSON for EAS Submit and/or App Distribution
- `APPLE_ASC_KEY` — App Store Connect API key (private key)
- `APPLE_ASC_KEY_ID`, `APPLE_ASC_ISSUER_ID`
- Android keystore (if not using EAS managed signing):
  - `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`, `ANDROID_KEY_ALIAS`, `ANDROID_KEY_ALIAS_PASSWORD`
- iOS provisioning (if not using EAS managed credentials): managed path preferred
- Optional: Sentry DSN/tokens, Supabase envs for web, etc.

EAS Secrets (per app):
- Mirror of any build‑time secrets that must be available to EAS Build (keystore if opting out of managed signing).

## Managed vs. Bare and Profiles

- Detected: Expo managed app. Use standard EAS managed profiles.
- Proposed `eas.json` profiles:
  - `preview` (android `apk`, ios `internal`), channel `preview`
  - `production` (android `app-bundle`, ios App Store), channel `production`, `autoIncrement: true`
  - `submit` configs for Play/TestFlight

## Facts to Honor

- EAS Build provides cloud builds + credentials; integrates with Submit and Updates.
- EAS Submit handles Play tracks and TestFlight.
- EAS Update channels use `runtimeVersion: nativeVersion` to constrain compatibility.
- Firebase App Distribution supports APK/AAB/IPA upload via CLI; Hosting used for web.

## Checklists Emitted by CI When Secrets Are Missing

- If `EAS_TOKEN` missing → skip EAS steps; output instructions to create token
- If Play/Apple creds missing in preview → build Android APK only and post artifact link; iOS internal skipped
- If Firebase secrets missing → skip Hosting/App Distribution; output CLI one‑liners to generate tokens

---

Next step (Phase 1): Open PR `chore/eas-migration` to archive Codemagic and add docs scaffolding (no behavior change). After review, we’ll add EAS configs and GitHub Actions in separate small commits.


