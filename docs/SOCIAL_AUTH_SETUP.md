# Social Authentication Setup Guide

This guide explains how to set up Google, Apple, and Facebook authentication for the Daybreaker app.

## 🔧 Prerequisites

1. **Supabase Project**: Ensure your Supabase project is set up
2. **Development Team**: Apple Developer account for Apple Sign-In
3. **Google Cloud Console**: For Google OAuth
4. **Meta for Developers**: For Facebook OAuth

## 📱 1. Supabase Configuration

### Enable Social Providers
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to Authentication > Providers
3. Enable the following providers:

#### Google OAuth
- Enable Google provider
- Add your Google OAuth credentials (see Google setup below)

#### Apple OAuth  
- Enable Apple provider
- Add your Apple OAuth credentials (see Apple setup below)

#### Facebook OAuth
- Enable Facebook provider
- Add your Facebook OAuth credentials (see Facebook setup below)

### Redirect URLs
Add these redirect URLs in Supabase:
- `daybreaker://` (for mobile deep linking)
- `https://ngyanbicjhvdmwuoxevb.supabase.co/auth/v1/callback` (for web)

## 🔍 2. Google OAuth Setup

### Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API

### Configure OAuth Consent Screen
1. Go to APIs & Services > OAuth consent screen
2. Fill in app information:
   - App name: "Daybreaker"
   - User support email: your email
   - Developer contact: your email

### Create OAuth Credentials
1. Go to APIs & Services > Credentials
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Create two client IDs:

#### Web Client (for Supabase)
- Application type: Web application
- Authorized redirect URIs: `https://ngyanbicjhvdmwuoxevb.supabase.co/auth/v1/callback`

#### iOS Client (for mobile app)
- Application type: iOS
- Bundle ID: `com.daybreaker.portal`

### Update Configuration
1. Copy the Web Client ID to Supabase Google provider settings
2. Update `src/services/socialAuth.ts`:
```typescript
GoogleSignin.configure({
  webClientId: 'YOUR_GOOGLE_WEB_CLIENT_ID', // Replace with your Web Client ID
  iosClientId: 'YOUR_GOOGLE_IOS_CLIENT_ID', // Replace with your iOS Client ID
  offlineAccess: true,
});
```

## 🍎 3. Apple Sign-In Setup

### Apple Developer Configuration
1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Navigate to Certificates, Identifiers & Profiles
3. Go to Identifiers > App IDs
4. Select your app ID or create new one with Bundle ID: `com.daybreaker.portal`
5. Enable "Sign In with Apple" capability

### Supabase Apple Configuration
1. In Supabase Dashboard > Authentication > Providers > Apple
2. Enable Apple provider
3. Add your Service ID and Key configurations

### EAS Build Configuration
The app.json already includes Apple authentication plugin:
```json
"plugins": [
  [
    "@react-native-google-signin/google-signin",
    {
      "iosUrlScheme": "com.googleusercontent.apps.YOUR_IOS_CLIENT_ID_HERE"
    }
  ],
]
```

**Note**: The `iosUrlScheme` should be your iOS Client ID prefixed with `com.googleusercontent.apps.`

## 📘 4. Facebook OAuth Setup

### Create Facebook App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product

### Configure Facebook Login
1. Go to Facebook Login > Settings
2. Add redirect URIs:
   - `https://ngyanbicjhvdmwuoxevb.supabase.co/auth/v1/callback`
   - `daybreaker://`

### Get App Credentials
1. Go to App Settings > Basic
2. Copy App ID and App Secret
3. Add these to Supabase Facebook provider settings

## 🔑 **Android SHA Key Setup (CRITICAL)**

### Get SHA Key for Development
```bash
keytool -list -v -keystore ./android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
```

### Common Issues:
- **Developer Error**: Usually means wrong SHA key
- **Package Name**: Must match `android.package` in app.json
- **Path**: SHA key command must be run from project root

### Steps:
1. Run SHA key command from project root
2. Copy the SHA1 fingerprint (long hex string)
3. Add to Google Cloud Console Android client
4. **Important**: No extra spaces in SHA key!

## 🚀 5. Build and Deploy

### Update Build Configuration
After setting up OAuth providers and updating app.json:

```bash
# CRITICAL: Clean prebuild after app.json changes
npx expo prebuild --clean

# Build new version
eas build --platform ios --profile preview --non-interactive

# Submit to TestFlight when ready
eas submit --platform ios --latest
```

### ⚠️ **IMPORTANT**: 
- **Always run `expo prebuild --clean`** after changing app.json
- The `--clean` flag removes existing native directories
- Failing to do this causes configuration issues

### Testing
1. Install the new build via TestFlight
2. Test each social authentication method:
   - Google Sign-In
   - Apple Sign-In (iOS only)
   - Facebook Sign-In
3. Verify user profiles are created correctly in Supabase

## 🔐 6. Security Considerations

### Environment Variables
Consider moving sensitive keys to environment variables:

1. Create `.env` file:
```
GOOGLE_WEB_CLIENT_ID=your_google_web_client_id
GOOGLE_IOS_CLIENT_ID=your_google_ios_client_id
FACEBOOK_APP_ID=your_facebook_app_id
```

2. Update `src/services/socialAuth.ts` to use environment variables

### Production Setup
- Ensure all OAuth apps are verified and approved for production
- Test thoroughly on both iOS and Android devices
- Monitor authentication success rates in Supabase dashboard

## 📞 Support

If you encounter issues:
1. Check Supabase logs for authentication errors
2. Verify OAuth app configurations match exactly
3. Test on physical devices (simulators may have limitations)
4. Check that all required capabilities are enabled in iOS

## 🎯 Next Steps

After completing social authentication setup:
1. Test all authentication flows thoroughly
2. Implement proper error handling for edge cases
3. Add analytics to track authentication method preferences
4. Consider adding additional providers (Twitter, LinkedIn, etc.)