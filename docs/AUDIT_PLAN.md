# Code Audit Action Plan

## Immediate Fixes (To Get App Working)

1. **Remove Native Dependencies Temporarily**
   - Remove expo-notifications and expo-location from package.json
   - Use mock implementations until proper native build
   - This will eliminate native module errors

2. **Fix SecureStore Token Size**
   - Split large tokens into chunks
   - Or use AsyncStorage for larger data

3. **Clean Up Duplicate Code**
   - Delete old PermissionsScreen.tsx
   - Keep only UnifiedPermissionsScreen.tsx
   - Remove NotificationProvider if unused

4. **Simplify Navigation Flow**
   - Start with Welcome → Auth → Dashboard
   - Add onboarding screens incrementally

## Technical Debt to Address Later

1. **Proper Native Module Setup**
   - Configure expo-notifications properly
   - Configure expo-location properly
   - Run proper prebuild and pod install

2. **Design System Migration**
   - Complete migration from old Spacing to new Space
   - Remove migration scripts and test files

3. **Error Handling**
   - Proper error boundaries
   - Better error messages

## Current App Flow
Welcome → Auth → BasicInfo → (13 more onboarding screens) → Dashboard

## Simplified Flow (For Now)
Welcome → Auth → Dashboard