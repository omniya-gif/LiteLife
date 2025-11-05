# Supabase Redirect URLs Configuration

## ⚠️ CRITICAL: Add These URLs to Supabase

The "requested path is invalid" error means Supabase is rejecting the redirect URL because it's not in the allowed list.

### Step-by-Step Fix:

1. **Go to your Supabase Dashboard**
   - URL: https://supabase.com/dashboard
   - Select your project: `zvbgtmlxzhiuxmimcqpd`

2. **Navigate to Authentication Settings**
   - Click on "Authentication" in the left sidebar
   - Click on "URL Configuration"

3. **Add These Redirect URLs**

   Add the following URLs to the "Redirect URLs" section (click "Add URL" for each):

   **For Development (Expo Go):**
   ```
   exp://192.168.1.100:8081/--/auth/callback
   ```
   ⚠️ Replace `192.168.1.100` with YOUR computer's actual IP address
   - To find your IP: Run `npx expo start` and look at the "Metro waiting" screen
   - The IP will be shown like: `exp://192.168.x.x:8081`

   **For Production (Standalone App):**
   ```
   fithass://auth/callback
   ```

   **Common Development URLs to Add:**
   ```
   exp://localhost:8081/--/auth/callback
   exp://127.0.0.1:8081/--/auth/callback
   http://localhost:8081/--/auth/callback
   ```

4. **Click "Save"** at the bottom of the page

## How to Find Your Exact Redirect URL

Run your app and check the console logs when you click "Continue with Google":

```
[SocialLogin] Production Redirect URI: fithass://auth/callback
[SocialLogin] Development Redirect URI: exp://192.168.x.x:8081/--/auth/callback
[SocialLogin] Using redirect URI: exp://192.168.x.x:8081/--/auth/callback
```

**Copy the "Using redirect URI" value** and add it to Supabase!

## Quick Test Commands

### 1. Check what URL is being used:
```cmd
npx expo start
```
Look at the console output when you click Google login.

### 2. Find your machine's IP:
```cmd
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

## Common Issues & Solutions

### Issue: Still getting "requested path is invalid"
**Solution:** 
- Double-check the URL you added to Supabase EXACTLY matches the console log
- Make sure there are NO extra spaces
- The URL is case-sensitive
- Wait 1-2 minutes after saving in Supabase for changes to propagate

### Issue: Different IP address each time
**Solution:**
- Your router is assigning different IPs
- Add multiple URLs with different IPs to Supabase
- Or set a static IP for your development machine

### Issue: Works in development but not in production
**Solution:**
- Make sure `fithass://auth/callback` is added to Supabase
- Run `npx expo prebuild --clean` after adding the scheme to app.config.ts

## Screenshot Location in Supabase

```
Supabase Dashboard
└── Your Project
    └── Authentication (left sidebar)
        └── URL Configuration
            └── Redirect URLs section
                └── [Add URL button]
```

## Example Configuration

Your Redirect URLs list should look like:

```
✓ fithass://auth/callback
✓ exp://192.168.1.100:8081/--/auth/callback
✓ exp://localhost:8081/--/auth/callback
✓ http://localhost:8081/--/auth/callback
```

## Test After Configuration

1. Save the URLs in Supabase
2. Wait 1 minute
3. Close your Expo app completely
4. Restart: `npx expo start -c` (clear cache)
5. Try Google login again
6. Check console logs for success messages

## Success Indicators

When it works, you'll see:
```
[SocialLogin] ====== AUTH CALLBACK STARTED ======
[SocialLogin] Callback URL received: exp://...
[SocialLogin] Session set successfully, user ID: [uuid]
[SocialLogin] Redirecting existing user to: /(main)/home
[SocialLogin] ====== AUTH CALLBACK COMPLETED ======
```

## Still Not Working?

Share these console logs:
1. `[SocialLogin] Using redirect URI: ...`
2. Any error messages from Supabase
3. Screenshot of your Supabase Redirect URLs configuration
