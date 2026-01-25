# GitHub OAuth Redirect URI Configuration Fix

## Issue
The error "The redirect_uri is not associated with this application" occurs when the redirect_uri sent to GitHub doesn't match what's configured in your GitHub OAuth app settings.

## Solution

### 1. Updated Homepage to Use Same GitHub Connection System
- Changed homepage GitHub connect button from `/api/auth/signin/github` (NextAuth) to `/api/github/connection` POST endpoint
- This ensures consistent OAuth flow across the application

### 2. Fixed Redirect URI Construction
The redirect_uri is now constructed consistently:
- Priority: `NEXTAUTH_URL` > `VERCEL_URL` > `http://localhost:3000`
- Ensures trailing slashes are removed
- Logs the redirect_uri for debugging

### 3. GitHub OAuth App Configuration

**IMPORTANT**: You must configure your GitHub OAuth app with the exact redirect_uri that matches your environment:

#### For Development (localhost):
```
http://localhost:3000/api/github/callback
```

#### For Production:
Set `NEXTAUTH_URL` environment variable to your production URL, then configure GitHub with:
```
https://yourdomain.com/api/github/callback
```

### 4. How to Fix the Redirect URI Error

1. **Check your current redirect_uri**:
   - Look at the console logs when connecting (it will show: `[GitHub OAuth] Redirect URI: ...`)
   - Or check your GitHub OAuth app settings

2. **Update GitHub OAuth App Settings**:
   - Go to GitHub → Settings → Developer settings → OAuth Apps
   - Select your OAuth app
   - In "Authorization callback URL", add:
     - For development: `http://localhost:3000/api/github/callback`
     - For production: `https://yourdomain.com/api/github/callback`
   - Save the changes

3. **Verify Environment Variables**:
   - Ensure `NEXTAUTH_URL` is set correctly for your environment
   - For Vercel deployments, this is usually set automatically
   - For other platforms, set it manually:
     ```bash
     export NEXTAUTH_URL=https://yourdomain.com
     ```

### 5. Testing

After updating the GitHub OAuth app settings:
1. Try connecting from the homepage
2. Try connecting from settings
3. Both should redirect correctly after GitHub authorization

## Files Changed

1. `app/page.tsx` - Updated GitHub connect button to use `/api/github/connection`
2. `app/api/github/connection/route.ts` - Fixed redirect_uri construction and added source tracking
3. `app/api/github/callback/route.ts` - Updated to redirect to homepage or settings based on source
4. `app/(labs)/settings/page.tsx` - Updated to pass source parameter

## Notes

- The redirect_uri must match **exactly** (including protocol, domain, path)
- GitHub allows multiple redirect URIs, so you can add both localhost and production URLs
- The source parameter (`homepage` or `settings`) is stored in the OAuth state to determine redirect destination
