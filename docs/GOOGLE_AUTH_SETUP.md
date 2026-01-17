# Google OAuth Setup for Daybreaker Portal

## Issue: Nonce Mismatch Error

When using Google Sign-In with Supabase on iOS, you may encounter:
```
AuthApiError: Passed nonce and nonce in id_token should either both exist or not.
```

## Root Cause

Google's iOS SDK doesn't include nonces in ID tokens by default, but Supabase expects them to match. This is a known issue between react-native-google-signin and Supabase.

## Solution

### Option 1: Skip Nonce Checks (Recommended for MVP)

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Providers > Google
3. Enable "Skip nonce checks"
4. Save the configuration

This is the quickest solution for getting your MVP working.

### Option 2: Production-Ready Solution

The code now properly handles nonces:
- Extracts nonce from ID token if present
- Only passes nonce to Supabase if it exists
- Provides clear error messages for debugging

## Configuration Required

1. **Google Cloud Console**:
   - Web Client ID: `755246463428-3sdg64j09joeengmir43hetrk8gqpvdn.apps.googleusercontent.com`
   - iOS Client ID: `755246463428-tork0ofjurkfmb0to95skcrierm0pg3r.apps.googleusercontent.com`

2. **Supabase Dashboard**:
   - Enable Google provider
   - Add authorized client IDs
   - Consider enabling "Skip nonce checks" for iOS

## Testing

1. Clear app data/cache
2. Try Google Sign-In
3. Check console logs for any nonce-related errors
4. If errors persist, verify Supabase configuration

## Long-term Considerations

For production:
- Monitor Google SDK updates for native nonce support
- Consider implementing server-side token validation
- Add proper error tracking and analytics