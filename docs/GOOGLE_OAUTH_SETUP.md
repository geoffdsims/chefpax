# Setting Up Google OAuth for ChefPax Admin Authentication

## Why Google OAuth?
- ✅ Much more secure than password-only
- ✅ Uses Google's 2FA and security monitoring
- ✅ No passwords stored in your code
- ✅ Free to use
- ✅ Professional and trusted

## Step-by-Step Setup (5 minutes)

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Create a New Project (or select existing)
- Click "Select a project" at the top
- Click "New Project"
- Name: **ChefPax**
- Click "Create"

### 3. Enable Google+ API
- In the left menu, go to **APIs & Services** → **Library**
- Search for "Google+ API"
- Click it and click "Enable"

### 4. Create OAuth Credentials
- Go to **APIs & Services** → **Credentials**
- Click **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
- If prompted, configure OAuth consent screen first:
  - User Type: **External**
  - App name: **ChefPax**
  - User support email: Your email
  - Developer contact: Your email
  - Click **Save and Continue** (skip scopes, test users)

### 5. Configure OAuth Client
- Application type: **Web application**
- Name: **ChefPax Production**
- Authorized JavaScript origins:
  ```
  http://localhost:3000
  https://chefpax.com
  https://www.chefpax.com
  https://chefpax-d60mmkqcu-geoff-sims-projects.vercel.app
  ```
- Authorized redirect URIs:
  ```
  http://localhost:3000/api/auth/callback/google
  https://chefpax.com/api/auth/callback/google
  https://www.chefpax.com/api/auth/callback/google
  https://chefpax-d60mmkqcu-geoff-sims-projects.vercel.app/api/auth/callback/google
  ```
- Click **Create**

### 6. Copy Your Credentials
You'll see a popup with:
- **Client ID** - looks like: `123456789-abc123.apps.googleusercontent.com`
- **Client Secret** - looks like: `GOCSPX-abc123xyz789`

**COPY THESE NOW!** (You can view them again later from the credentials page)

### 7. Add to .env.local
```bash
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

### 8. Add to Vercel
Go to Vercel → Your Project → Settings → Environment Variables
Add the same two variables for Production, Preview, and Development

### 9. Test It
1. Restart your dev server: `npm run dev`
2. Go to `/admin/production`
3. Click "Sign in with Google"
4. Use `geoff@chefpax.com`
5. You should be redirected to admin dashboard!

---

## Security Benefits

With Google OAuth:
- ✅ Google manages password security
- ✅ 2-factor authentication available
- ✅ Login alerts and suspicious activity monitoring
- ✅ Can revoke access instantly from Google account
- ✅ No password in your codebase

**This is production-ready security!** 🔒

