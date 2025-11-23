# YouTube Data API v3 Setup Guide

## Overview
Switched from paid RapidAPI YouTube search to **FREE YouTube Data API v3**
- ✅ Completely FREE
- ✅ 10,000 requests/day quota (more than enough)
- ✅ Official Google API
- ✅ Better data quality

## How to Get Your FREE API Key

### Step 1: Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### Step 2: Create a Project (if you don't have one)
1. Click "Select a project" at the top
2. Click "New Project"
3. Name it (e.g., "LiteLife Exercise App")
4. Click "Create"

### Step 3: Enable YouTube Data API v3
1. In your project, go to "APIs & Services" > "Library"
2. Search for "YouTube Data API v3"
3. Click on it
4. Click "Enable"

### Step 4: Create API Key
1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy your API key (looks like: `AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`)

### Step 5: Secure Your API Key (Optional but Recommended)
1. Click "Edit API key" (the pencil icon)
2. Under "API restrictions", select "Restrict key"
3. Choose "YouTube Data API v3"
4. Under "Application restrictions", you can:
   - Add your app's package name (for Android)
   - Add your app's bundle ID (for iOS)
5. Click "Save"

### Step 6: Add to Your .env File
Open `.env` file and replace:
```
EXPO_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```

With your actual key:
```
EXPO_PUBLIC_YOUTUBE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Step 7: Restart Your Dev Server
```bash
# Stop current server (Ctrl+C)
# Restart
npx expo start
```

## API Quota
- **Free Tier**: 10,000 requests/day
- **Cost per video search**: 100 quota units
- **Daily capacity**: ~100 searches/day
- **More than enough** for your app!

## What Changed
- ✅ Removed paid RapidAPI subscription requirement
- ✅ Using official YouTube Data API v3
- ✅ Same functionality, zero cost
- ✅ Better reliability and data quality

## Troubleshooting

### Error 403: "YouTube Data API has not been used in project..."
- Go back to Step 3 and make sure you clicked "Enable"

### Error 400: "Bad Request"
- Check that your API key is correctly copied
- Make sure there are no extra spaces
- Verify API key is not restricted to wrong app

### No videos showing up
- Check console logs for errors
- Verify API key is in .env file
- Restart dev server after adding key

## Cost Comparison
| Service | Old (RapidAPI) | New (YouTube v3) |
|---------|---------------|------------------|
| Cost | ~$10-20/month | **FREE** |
| Quota | Variable | 10,000/day |
| Quality | Third-party | Official Google |
| Support | Limited | Full docs |

🎉 **Result**: Save money, get better data!
