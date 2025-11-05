# Google Authentication Debug Guide

## Changes Made

### 1. Fixed App Configuration (`app.config.ts`)
- **Uncommented** the `scheme: 'fithass'` line
- This is CRITICAL - without this, the redirect URI is undefined and Google can't redirect back to the app

### 2. Fixed Redirect URI in SocialLogin (`components/auth/SocialLogin.tsx`)
- Changed from conditional/broken redirect URI to: `fithass://auth/callback`
- Added extensive logging throughout the authentication flow

### 3. Created Auth Callback Route (`app/auth/callback.tsx`)
- This is the page Google redirects to after authentication
- Shows "Loading... Waiting to redirect" message
- The actual auth handling happens in SocialLogin component via deep links

### 4. Added Debug Logging

The following logs will now appear in your console when you authenticate with Google:

```
[SocialLogin] Starting Google Sign In...
[SocialLogin] Using redirect URI: fithass://auth/callback
[SocialLogin] Opening auth session with URL: [google oauth url]
[SocialLogin] Auth session result: [result object]
[SocialLogin] ====== AUTH CALLBACK STARTED ======
[SocialLogin] Callback URL received: [url]
[SocialLogin] Query params: [params]
[SocialLogin] Setting session with access token...
[SocialLogin] Session set successfully, user ID: [id]
[SocialLogin] Existing user, checking onboarding status
[SocialLogin] Onboarding completed: [true/false]
[SocialLogin] Redirecting existing user to: /(main)/home
[SocialLogin] ====== AUTH CALLBACK COMPLETED ======
```

## How to Debug

### Step 1: Test Google Login
1. Run your app: `npx expo start`
2. Click "Continue with Google"
3. Complete the Google authentication

### Step 2: Check Console Logs
Watch for the logs in your terminal. They will tell you:
- What redirect URI is being used
- If the callback is being received
- What params are in the callback URL
- Whether the session is being set
- Where the app is trying to redirect

### Step 3: Check Supabase Configuration

**IMPORTANT**: You need to add the redirect URI to your Supabase project:

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add to "Redirect URLs": 
   - `fithass://auth/callback`
   - For testing: `exp://[your-ip]:8081/--/auth/callback` (if using Expo Go)

### Step 4: Common Issues & Solutions

#### Issue: Still seeing "Page doesn't exist"
**Possible causes:**
1. Supabase redirect URL not configured correctly
2. The deep link isn't being handled properly
3. The scheme in app.config.ts doesn't match

**Check:**
- Console logs to see what URL is being redirected to
- Supabase dashboard to ensure redirect URLs are correct

#### Issue: Redirects to callback but nothing happens
**Possible causes:**
1. The deep link handler in SocialLogin isn't catching the URL
2. Access token not in the URL params

**Check:**
- `[SocialLogin] Deep link received:` log
- `[SocialLogin] Query params:` log to see if access_token is present

#### Issue: Session sets but user isn't redirected
**Possible causes:**
1. Onboarding status check is failing
2. Router.replace is not working

**Check:**
- `[SocialLogin] Redirecting [type] user to: [route]` log
- Make sure the route exists

## What Each Log Means

| Log Message | Meaning |
|-------------|---------|
| `Starting Google Sign In...` | User clicked the Google button |
| `Using redirect URI: fithass://auth/callback` | This is where Google will redirect after auth |
| `Auth session successful` | User completed Google authentication |
| `====== AUTH CALLBACK STARTED ======` | The app received the callback from Google |
| `No access token found in URL` | The callback URL is missing auth tokens (BAD) |
| `Session set successfully` | User is now authenticated in Supabase (GOOD) |
| `New user, creating onboarding record` | First-time user |
| `Existing user, checking onboarding status` | Returning user |
| `Redirecting [type] user to: [route]` | Where the user should go next |
| `====== AUTH CALLBACK COMPLETED ======` | Auth flow finished successfully |

## Next Steps

1. **Rebuild the app** after changing app.config.ts:
   ```
   npx expo prebuild --clean
   ```

2. **Test the flow** and share the console logs

3. **Check if you still see the not-found page**

4. **If yes**, the logs will tell us exactly where the flow is breaking

## Supabase Dashboard Check

Make sure in your Supabase project:
- Navigate to: Authentication → URL Configuration → Redirect URLs
- Should include: `fithass://auth/callback`
- Without this, Google will redirect to a URL that Supabase rejects
