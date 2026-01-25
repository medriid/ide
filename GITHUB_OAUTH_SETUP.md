# GitHub OAuth App Setup Guide

This guide will walk you through setting up a GitHub OAuth App for your application.

## Prerequisites

- A GitHub account
- Your application's domain URL (for production) or localhost URL (for development)

## Step-by-Step Instructions

### Step 1: Create a GitHub OAuth App

1. **Log in to GitHub** and navigate to your account settings:
   - Click your profile picture in the top right
   - Click **Settings**

2. **Navigate to Developer Settings**:
   - Scroll down in the left sidebar
   - Click **Developer settings** (at the bottom)

3. **Access OAuth Apps**:
   - Click **OAuth Apps** in the left sidebar
   - Click the **New OAuth App** button (or **Register a new application**)

### Step 2: Fill in OAuth App Details

Fill in the following fields:

#### Application Name
- **Example**: `Your App Name` or `Your Site - Code Platform`
- Choose a descriptive name that users will recognize
- This appears on the GitHub authorization screen

#### Homepage URL
- **For Production**: `https://yourdomain.com`
- **For Development**: `http://localhost:3000`
- This is your application's main URL

#### Authorization Callback URL
- **For Production**: `https://yourdomain.com/api/github/callback`
- **For Development**: `http://localhost:3000/api/github/callback`
- ⚠️ **CRITICAL**: This must match exactly, including the protocol (http/https) and port

4. **Click "Register application"**

### Step 3: Get Your Credentials

After creating the app, you'll see:

1. **Client ID** (public, can be exposed)
   - Copy this value
   - Example: `Iv1.8a61f9b7a7f8c123`

2. **Client Secret** (private, NEVER expose)
   - Click **Generate a new client secret** if needed
   - Copy this value immediately (you can only see it once!)
   - Example: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Step 4: Configure Environment Variables

Add these to your `.env` file (or your hosting platform's environment variables):

```bash
# GitHub OAuth Configuration
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

# Token Encryption Key (generate a secure random string)
GITHUB_TOKEN_ENCRYPTION_KEY=your_secure_random_key_here

# Your application URL (used for OAuth redirects)
NEXTAUTH_URL=http://localhost:3000  # Development
# NEXTAUTH_URL=https://yourdomain.com  # Production
```

#### Generate Encryption Key

Generate a secure random key for token encryption:

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32

# Using Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

**Important**: 
- Use a different key for production and development
- Store this key securely (never commit to git)
- If you lose this key, you'll need to re-authenticate all users

### Step 5: Choose OAuth Scopes

The application requests the following scopes:

- `read:user` - Read user profile information
- `user:email` - Access user email addresses
- `repo` - Full repository access (read/write)

#### Scope Details

| Scope | Permission | Required For |
|-------|-----------|--------------|
| `read:user` | Read user profile | Display GitHub username, avatar |
| `user:email` | Read user email | Email access (optional) |
| `repo` | Full repo access | Read/write repos, create commits, push code |

⚠️ **Security Note**: Only request scopes you actually need. Users are sensitive to permissions.

#### To Modify Scopes

Edit `/app/api/github/connection/route.ts`:

```typescript
const scope = "read:user user:email repo" // Add/remove scopes here
```

### Step 6: Test the Integration

1. **Start your application**:
   ```bash
   npm run dev
   ```

2. **Navigate to Settings**:
   - Go to `/settings` in your app
   - Find the "GitHub Integration" section

3. **Click "Connect GitHub"**:
   - You'll be redirected to GitHub
   - Review the permissions requested
   - Click "Authorize"

4. **Verify Connection**:
   - You should be redirected back to your app
   - The settings page should show "Connected" with your GitHub username

### Step 7: Production Deployment

#### For Heroku

```bash
heroku config:set GITHUB_CLIENT_ID=your_client_id
heroku config:set GITHUB_CLIENT_SECRET=your_client_secret
heroku config:set GITHUB_TOKEN_ENCRYPTION_KEY=your_encryption_key
heroku config:set NEXTAUTH_URL=https://yourdomain.com
```

#### For Vercel

Add environment variables in the Vercel dashboard:
- Settings → Environment Variables

#### For Other Platforms

Add the environment variables through your platform's dashboard or CLI.

### Step 8: Update OAuth App for Production

1. **Create a separate OAuth App for production** (recommended):
   - Follow Steps 1-3 again
   - Use your production domain
   - Use production environment variables

2. **Or update the existing app**:
   - Edit your OAuth App in GitHub
   - Update the "Authorization callback URL" to your production URL
   - Update environment variables in your production environment

## Security Best Practices

### ✅ DO:

1. **Use HTTPS in production** - OAuth requires HTTPS (except localhost)
2. **Store secrets securely** - Never commit secrets to git
3. **Use environment variables** - Don't hardcode credentials
4. **Encrypt tokens** - Access tokens are encrypted before storage
5. **Validate state parameter** - CSRF protection is implemented
6. **Rate limit API calls** - The service handles GitHub rate limits
7. **Allow token revocation** - Users can disconnect their GitHub account

### ❌ DON'T:

1. **Expose Client Secret** - Never put it in client-side code
2. **Store tokens in plain text** - Always encrypt (already implemented)
3. **Request unnecessary scopes** - Only ask for what you need
4. **Ignore rate limits** - GitHub has strict rate limits
5. **Skip HTTPS** - Required for production OAuth

## Troubleshooting

### "Invalid redirect URI"

- Check that your callback URL matches exactly in GitHub OAuth App settings
- Ensure protocol (http/https) and port match
- For development: `http://localhost:3000/api/github/callback`
- For production: `https://yourdomain.com/api/github/callback`

### "GitHub API rate limit exceeded"

- GitHub allows 5,000 requests/hour for authenticated requests
- The service handles rate limits automatically
- Check rate limit headers in API responses

### "Token decryption failed"

- Ensure `GITHUB_TOKEN_ENCRYPTION_KEY` is set correctly
- If you changed the key, users will need to reconnect
- The key must be the same across all instances

### "Unauthorized" error

- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are set
- Check that the user has authorized the app
- Ensure the token hasn't been revoked on GitHub

### Connection works but API calls fail

- Check that the requested scopes include what you need
- Verify the token hasn't expired (GitHub tokens don't expire, but can be revoked)
- Check GitHub API status: https://www.githubstatus.com/

## API Endpoints

After setup, you can use these endpoints:

### Check Connection
```
GET /api/github/connection
```

### List Repositories
```
GET /api/github/repos?type=all&sort=updated
```

### Get Repository Contents
```
GET /api/github/repos/{owner}/{repo}/contents?path=src
```

### Get File Content
```
GET /api/github/repos/{owner}/{repo}/contents?path=file.js&raw=true
```

### Create/Update File
```
PUT /api/github/repos/{owner}/{repo}/files
Body: { path, content, message, branch?, sha? }
```

### Delete File
```
DELETE /api/github/repos/{owner}/{repo}/files?path=file.js&message=Delete&sha=abc123
```

### List Commits
```
GET /api/github/repos/{owner}/{repo}/commits?sha=main
```

### List Branches
```
GET /api/github/repos/{owner}/{repo}/branches
```

### Create Branch
```
POST /api/github/repos/{owner}/{repo}/branches
Body: { name, fromSha }
```

### Create Pull Request
```
POST /api/github/repos/{owner}/{repo}/pulls
Body: { title, body, head, base }
```

## Database Migration

After setting up the OAuth app, run the database migration to create the `GitHubAccount` table:

```bash
# Generate Prisma client
npm run prisma:generate

# Push schema changes to database
npm run prisma:push

# Or create a migration
npx prisma migrate dev --name add_github_accounts
```

## Additional Resources

- [GitHub OAuth Documentation](https://docs.github.com/en/apps/oauth-apps/building-oauth-apps/authorizing-oauth-apps)
- [GitHub API Documentation](https://docs.github.com/en/rest)
- [GitHub Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)

## Support

If you encounter issues:

1. Check the browser console for errors
2. Check server logs for detailed error messages
3. Verify all environment variables are set correctly
4. Ensure your OAuth app callback URL matches exactly
5. Test with a fresh GitHub authorization

---

**Last Updated**: 2024
**Version**: 1.0
