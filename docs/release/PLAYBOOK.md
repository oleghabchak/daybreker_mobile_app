# Release Playbook (EAS + Firebase)

## Roles
- Owner: daybreakerportal
- Release Engineer: delegated per PR

## Pipelines
- Preview (PRs/branches): EAS Build (Android APK + iOS internal), EAS Update to channel `preview`, Firebase Hosting preview for web.
- Release (tags v* on main): EAS Build production, EAS Submit (Play/TestFlight), EAS Update to `production`, Firebase Hosting production.

## Versioning
- EAS remote versioning: `cli.appVersionSource=remote`, `build.production.autoIncrement=true`.

## Updates (OTA)
- `runtimeVersion.policy=nativeVersion`.
- Channels: `preview`, `production`.

## Secrets (GitHub + EAS)
- EAS_TOKEN
- FIREBASE_TOKEN, FIREBASE_PROJECT_ID (daybreaker-health-portal)
- GOOGLE_PLAY_SERVICE_ACCOUNT_JSON
- APPLE_ASC_KEY, APPLE_ASC_KEY_ID, APPLE_ASC_ISSUER_ID
- Optional: keystore if not managed

## Runbooks
- Preview: open PR → Actions run → artifacts + preview URLs.
- Release: push tag `vX.Y.Z` on `main` → builds + submit + Hosting prod.

## Recovery
- OTA rollback: `eas update:republish` previous commit on channel.
- Binary rollback: unpublish Play/TestFlight release, reissue prior tag.
