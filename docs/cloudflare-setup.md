# Cloudflare Deployment Guide

**Estimated Time**: 30 minutes  
**Difficulty**: Beginner-Intermediate  
**Cost**: Free (Cloudflare Free Tier)

This guide walks you through deploying the Travel Blog authentication system to Cloudflare's free tier. You'll deploy:
- **Cloudflare Workers** for authentication API endpoints
- **Cloudflare KV** for rate limiting (optional)
- **Cloudflare Pages** for the Next.js static site

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Create Cloudflare Account](#step-1-create-cloudflare-account)
3. [Step 2: Install Wrangler CLI](#step-2-install-wrangler-cli)
3. [Step 3: Authenticate Wrangler](#step-3-authenticate-wrangler)
4. [Step 4: Create D1 Database](#step-4-create-d1-database)
5. [Step 5: Create KV Namespace (Rate Limiting)](#step-5-create-kv-namespace-rate-limiting)
6. [Step 6: Configure Environment Variables](#step-6-configure-environment-variables)
7. [Step 6: Deploy Workers](#step-6-deploy-workers)
8. [Step 7: Deploy Next.js to Pages](#step-7-deploy-nextjs-to-pages)
9. [Step 8: Configure CORS](#step-8-configure-cors)
10. [Step 9: Test Authentication](#step-9-test-authentication)
11. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ **Node.js** v18+ installed ([download](https://nodejs.org/))
- ✅ **Git** installed and repository cloned
- ✅ **npm** or **yarn** package manager
- ✅ Email address for Cloudflare account (free)
- ✅ Command line access (Terminal/PowerShell)

**Check your versions**:
```bash
node --version  # Should be v18 or higher
npm --version   # Should be v8 or higher
```

---

## Step 1: Create Cloudflare Account

### 1.1 Sign Up for Cloudflare

1. Go to [https://dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up)
2. Enter your email and create a password
3. Verify your email address (check inbox/spam)
4. Complete the account setup wizard

**💡 Tip**: Choose the **Free** plan - it includes everything needed for this project!

### 1.2 Navigate to Workers Dashboard

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Click **Workers & Pages** in the left sidebar
3. You should see the Workers overview page

**📸 Screenshot checkpoint**: You should see "Create application" button

---

## Step 2: Install Wrangler CLI

Wrangler is Cloudflare's command-line tool for managing Workers.

### 2.1 Install Globally

```bash
npm install -g wrangler
```

Or using `npx` (no global install needed):
```bash
npx wrangler --version
```

### 2.2 Verify Installation

```bash
wrangler --version
# Expected output: ⛅️ wrangler 3.x.x
```

**💡 Tip**: If you get "command not found", restart your terminal or use `npx wrangler` instead.

---

## Step 3: Authenticate Wrangler

### 3.1 Login to Cloudflare

```bash
wrangler login
```

This will:
1. Open your browser
2. Ask you to log in to Cloudflare
3. Request permission to access your account
4. Return to terminal with success message

**📸 Screenshot checkpoint**: Browser shows "Wrangler has been authorized" message

### 3.2 Verify Authentication

```bash
wrangler whoami
```

Expected output:
```
 ⛅️ wrangler 3.x.x
-------------------
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email 'your-email@example.com'!
┌──────────────────────┬──────────────────────────────┐
│ Account Name         │ Account ID                   │
├──────────────────────┼──────────────────────────────┤
│ Your Account         │ abc123...                    │
└──────────────────────┴──────────────────────────────┘
```

---

## Step 4: Create D1 Database

D1 is Cloudflare's SQL database for user storage. It replaces static JSON files with a proper database.

### 4.1 Create D1 Database

```bash
cd travel-blog
wrangler d1 create travel-blog-users
```

Expected output:
```
 ⛅️ wrangler 4.x.x
-------------------
✅ Successfully created DB 'travel-blog-users' in region EEUR
Created your new D1 database.

[[d1_databases]]
binding = "DB"
database_name = "travel-blog-users"
database_id = "13a81283-7ad4-4879-8287-c435eac578e4"
```

**🔑 Important**: Copy the `database_id` value!

### 4.2 Update wrangler.toml

Add the D1 binding to `wrangler.toml`:

```toml
# D1 Database for user storage
[[d1_databases]]
binding = "DB"
database_name = "travel-blog-users"
database_id = "YOUR_DATABASE_ID_HERE"  # ← Replace with your database ID
```

### 4.3 Run Database Migrations

Create the users table:

```bash
wrangler d1 execute travel-blog-users --remote --file=workers/migrations/0001_create_users_table.sql
```

Seed test users:

```bash
wrangler d1 execute travel-blog-users --remote --file=workers/migrations/0002_seed_test_users.sql
```

Expected output:
```
🚣 Executed 3 queries in 3.09ms (6 rows read, 7 rows written)
```

### 4.4 Verify Database

```bash
wrangler d1 execute travel-blog-users --remote --command="SELECT username, role FROM users"
```

Expected output:
```
┌────────────────┬─────────────┐
│ username       │ role        │
├────────────────┼─────────────┤
│ leser          │ reader      │
│ admin          │ contributor │
└────────────────┴─────────────┘
```

**💡 Why D1?**
- Proper database vs static JSON files
- User credentials not committed to git
- Ready for future features (blog posts, media metadata)
- Free tier: 100K reads/day, 50K writes/day

---

## Step 5: Create KV Namespace (Rate Limiting)

KV (Key-Value) storage is used for rate limiting failed login attempts.

### 4.1 Create Production KV Namespace

In the `travel-blog/workers` directory:

```bash
cd travel-blog/workers
wrangler kv:namespace create RATE_LIMIT_KV
```

Expected output:
```
 ⛅️ wrangler 3.x.x
-------------------
🌀 Creating namespace with title "workers-RATE_LIMIT_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMIT_KV", id = "abc123def456..." }
```

**🔑 Important**: Copy the `id` value - you'll need it in the next step!

### 4.2 Create Preview KV Namespace (Optional)

For testing before deployment:

```bash
wrangler kv:namespace create RATE_LIMIT_KV --preview
```

Copy the preview `id` as well.

### 4.3 Update wrangler.toml

Open `travel-blog/workers/wrangler.toml` and update the KV binding:

```toml
name = "travel-blog-auth"
main = "auth/index.ts"
compatibility_date = "2025-11-13"

# Add your KV namespace binding
[[kv_namespaces]]
binding = "RATE_LIMIT_KV"
id = "YOUR_PRODUCTION_ID_HERE"  # ← Replace with your KV namespace ID
preview_id = "YOUR_PREVIEW_ID_HERE"  # ← Optional: Replace with preview ID

[vars]
NODE_ENV = "production"
```

**📸 Screenshot checkpoint**: wrangler.toml has KV namespace configured

---

## Step 5: Configure Environment Variables

### 5.1 Generate a Secure JWT Secret

```bash
# On macOS/Linux:
openssl rand -base64 32

# On Windows (PowerShell):
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# Example output: X7n2Kp9Lm4Qr6Hs8Jt3Fy5Bv1Cw0Dx9Ez7Gk4
```

**🔒 Security**: Keep this secret private! Never commit it to Git.

### 5.2 Set Worker Secrets

```bash
cd travel-blog/workers

# Set JWT secret (paste the value you generated above)
wrangler secret put JWT_SECRET
# When prompted, paste your secret and press Enter
```

Expected output:
```
 ⛅️ wrangler 3.x.x
-------------------
✨ Success! Uploaded secret JWT_SECRET
```

### 5.3 Verify Secrets

```bash
wrangler secret list
```

Expected output:
```
┌────────────┬─────────────────────┐
│ Name       │ Value               │
├────────────┼─────────────────────┤
│ JWT_SECRET │ ****** (redacted)   │
└────────────┴─────────────────────┘
```

---

## Step 6: Deploy Workers

### 6.1 Build Workers Code

Ensure you're in the `workers` directory:

```bash
cd travel-blog/workers
npm install  # Install dependencies if not already done
```

### 6.2 Deploy to Cloudflare

```bash
wrangler deploy
```

Expected output:
```
 ⛅️ wrangler 3.x.x
-------------------
Total Upload: XX.XX KiB / gzip: XX.XX KiB
Uploaded travel-blog-auth (X.XX sec)
Published travel-blog-auth (X.XX sec)
  https://travel-blog-auth.YOUR-SUBDOMAIN.workers.dev
Current Deployment ID: abc123...
```

**🎉 Success!** Your authentication API is now live at:
```
https://travel-blog-auth.YOUR-SUBDOMAIN.workers.dev
```

**📸 Screenshot checkpoint**: Terminal shows deployment URL

### 6.3 Test Workers Endpoints

```bash
# Test health endpoint
curl https://travel-blog-auth.YOUR-SUBDOMAIN.workers.dev/api/auth/health

# Expected response: {"status":"ok","service":"auth"}
```

### 6.4 Test Login Endpoint

```bash
curl -X POST https://travel-blog-auth.YOUR-SUBDOMAIN.workers.dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}'

# Expected: 200 OK with JWT cookie in Set-Cookie header
```

**Note**: Use your actual user credentials. Test accounts (testuser, testcontributor) have been disabled as of 2025-12-15.

**💡 Tip**: If you get CORS errors in the browser, continue to Step 8.

---

## Step 7: Deploy Next.js to Pages

### 7.1 Build Next.js Static Export

In the `travel-blog` directory:

```bash
cd travel-blog
npm install  # Install dependencies if not already done
npm run build  # Creates static export in /out directory
```

Expected output:
```
Route (app)                              Size     First Load JS
┌ ○ /                                    ...      ...
├ ○ /login                               ...      ...
└ ○ /about                               ...      ...
...
✓ Generating static pages (X/X)
✓ Finalizing page optimization
```

### 7.2 Create Environment Variables File

Create `travel-blog/.env.production.local`:

```bash
# Replace with YOUR actual Workers URL from Step 6.2
NEXT_PUBLIC_AUTH_API_URL=https://travel-blog-auth.YOUR-SUBDOMAIN.workers.dev
```

**🔒 Important**: Add `.env.production.local` to `.gitignore` if not already present.

### 7.3 Rebuild with Production Environment

```bash
npm run build
```

This rebuilds the app with your Workers URL baked in.

### 7.4 Deploy to Cloudflare Pages

#### Option A: Using Wrangler CLI

```bash
npx wrangler pages deploy out --project-name=travel-blog
```

#### Option B: Using Git Integration (Recommended)

1. Push your code to GitHub/GitLab
2. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
3. Click **Create application** → **Pages** → **Connect to Git**
4. Select your repository
5. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `out`
   - **Environment variables**: Add `NEXT_PUBLIC_AUTH_API_URL` with your Workers URL
6. Click **Save and Deploy**

**📸 Screenshot checkpoint**: Pages dashboard shows successful deployment

### 7.5 Access Your Deployed Site

Your site will be available at:
```
https://travel-blog.pages.dev
```

Or with custom domain:
```
https://your-custom-domain.com
```

---

## Step 8: Configure CORS

### 8.1 Update Workers CORS Configuration

Edit `travel-blog/workers/lib/cors.ts`:

```typescript
// Update ALLOWED_ORIGINS with your Pages URL
const ALLOWED_ORIGINS = [
  'http://localhost:3000',                      // Development
  'https://travel-blog.pages.dev',              // Cloudflare Pages
  'https://YOUR-CUSTOM-DOMAIN.com',             // Custom domain (if any)
];
```

### 8.2 Redeploy Workers

```bash
cd travel-blog/workers
wrangler deploy
```

**📸 Screenshot checkpoint**: CORS configured for production domains

---

## Step 9: Test Authentication

### 9.1 Test Login Flow

1. Visit your deployed Pages URL: `https://travel-blog.pages.dev`
2. You should be redirected to `/login` (middleware protection)
3. Enter your user credentials (query database for active users)
4. Click **Login**
5. You should be redirected to home page with your display name in nav

**Note**: Test accounts (`testuser`, `testcontributor`) have been disabled. Use actual credentials from your database.

**📸 Screenshot checkpoint**: Successful login with username displayed

### 9.2 Inspect JWT Cookie

1. Open browser DevTools → Application/Storage → Cookies
2. Look for cookie named `session`
3. Verify flags:
   - ✅ `HttpOnly`: true
   - ✅ `Secure`: true (on HTTPS)
   - ✅ `SameSite`: Strict
   - ✅ `Max-Age`: 604800 (7 days) or 86400 (24 hours)

**📸 Screenshot checkpoint**: Cookie visible in DevTools with correct flags

### 9.3 Test Session Persistence

1. Refresh the page
2. You should remain logged in (no redirect to /login)
3. Username should still appear in navigation

### 9.4 Test Logout

1. Click **Logout** button in navigation
2. You should be redirected to `/login`
3. Cookie should be cleared (Max-Age=0)
4. Refreshing should keep you on login page

### 9.5 Test Contributor Role

1. Login with a user that has contributor role
2. Verify "Contributor" badge appears in navigation
3. Same access as reader (upload UI not yet implemented)

**Note**: Query your database to find contributor users: `wrangler d1 execute travel-blog-db --remote --command "SELECT username, role FROM users WHERE role='contributor'"`

---

## Troubleshooting

### Issue: "Wrangler command not found"

**Solution**:
```bash
# Use npx instead
npx wrangler login
npx wrangler deploy

# Or add to PATH (depends on OS)
```

---

### Issue: "CORS policy: No 'Access-Control-Allow-Origin' header"

**Symptoms**: Login fails with CORS error in browser console

**Solution**:
1. Verify CORS origins in `workers/lib/cors.ts` include your Pages URL
2. Redeploy Workers: `wrangler deploy`
3. Hard refresh browser (Ctrl+Shift+R)

---

### Issue: "Invalid or expired session" on every request

**Symptoms**: Constant redirect to login page

**Possible Causes**:
1. **JWT_SECRET mismatch**: Secret changed after tokens issued
   - Solution: Clear cookies and re-login
2. **Cookie domain mismatch**: Workers and Pages on different domains
   - Solution: Ensure Workers URL is set correctly in `NEXT_PUBLIC_AUTH_API_URL`
3. **Middleware verification failing**: Network issue calling Workers
   - Solution: Check Workers logs in Cloudflare Dashboard

**Debug Steps**:
```bash
# Check Workers logs
wrangler tail

# Test verify endpoint directly
curl https://travel-blog-auth.YOUR-SUBDOMAIN.workers.dev/api/auth/verify \
  -H "Cookie: session=YOUR_JWT_TOKEN"
```

---

### Issue: "Rate limiting not working"

**Symptoms**: Can attempt login unlimited times

**Possible Causes**:
1. **KV namespace not bound**: Missing or wrong ID in wrangler.toml
2. **KV graceful degradation**: Code allows requests when KV unavailable

**Solution**:
1. Verify KV binding in `wrangler.toml`:
   ```bash
   wrangler kv:namespace list
   ```
2. Check Workers logs for "Rate limiting disabled" warnings:
   ```bash
   wrangler tail
   ```
3. Ensure KV namespace exists in Cloudflare Dashboard

---

### Issue: "Build fails on Cloudflare Pages"

**Symptoms**: Pages deployment shows build error

**Common Errors**:
1. **Missing dependencies**: `package.json` not committed
   - Solution: Commit `package.json` and `package-lock.json`
2. **Build command wrong**: Should be `npm run build`
3. **Node version mismatch**: Pages uses Node 18 by default
   - Solution: Add `.nvmrc` file with `18` or `20`

**Debug Steps**:
1. Check Pages build logs in Cloudflare Dashboard
2. Test build locally:
   ```bash
   rm -rf .next out
   npm run build
   ```

---

### Issue: "Environment variables not working"

**Symptoms**: Auth API URL shows `undefined` or localhost in production

**Solution**:
1. Verify environment variable in Pages Dashboard → Settings → Environment Variables
2. Variable must start with `NEXT_PUBLIC_` to be available in browser
3. Redeploy Pages after adding environment variables

---

### Issue: "Workers deployment fails"

**Symptoms**: `wrangler deploy` shows error

**Common Errors**:
1. **Not authenticated**: Run `wrangler login` again
2. **Invalid wrangler.toml**: Check syntax (TOML format)
3. **Missing dependencies**: Run `npm install` in `workers/` directory
4. **Build errors**: Check TypeScript compilation

**Debug Steps**:
```bash
# Validate wrangler.toml
wrangler deploy --dry-run

# Check for TypeScript errors
cd workers
npx tsc --noEmit
```

---

### Issue: "Session cookie not set"

**Symptoms**: Login returns 200 but no cookie appears

**Possible Causes**:
1. **Secure flag on HTTP**: Cookies with `Secure` flag only sent over HTTPS
   - Solution: Use HTTPS or test on Cloudflare Pages
2. **SameSite policy**: Browser blocks cross-site cookies
   - Solution: Ensure Workers and Pages on same domain or use custom domain
3. **Cookie blocked by browser**: Privacy settings too strict
   - Solution: Check browser console for cookie warnings

---

### Getting Help

**Resources**:
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

**Community**:
- [Cloudflare Community](https://community.cloudflare.com/)
- [Cloudflare Discord](https://discord.gg/cloudflaredev)

**Project Issues**:
- Check `travel-blog/TESTING_AUTH.md` for local testing
- Review Workers logs: `wrangler tail`
- Check browser console for errors

---

## Next Steps

✅ **Authentication system deployed!**

**What's working**:
- Reader login/logout
- Contributor role tracking
- Session persistence (7-day/24-hour)
- Protected routes (Next.js middleware)
- Rate limiting (if KV configured)

**Future enhancements**:
- Custom domain setup
- Additional user roles
- Upload functionality for contributors
- Email verification
- Password reset flow

**Monitoring**:
- Check Workers analytics in Cloudflare Dashboard
- Monitor KV usage (free tier: 100K reads/day, 1K writes/day)
- Review Pages analytics for traffic

---

## Deployment Checklist

Use this checklist to ensure everything is configured correctly:

- [ ] Cloudflare account created
- [ ] Wrangler CLI installed and authenticated
- [ ] KV namespace created for rate limiting
- [ ] JWT_SECRET environment variable set
- [ ] Workers deployed successfully
- [ ] Workers endpoints tested (health, login, verify)
- [ ] Next.js built with production environment variables
- [ ] Pages deployed successfully
- [ ] CORS configured for Pages URL
- [ ] Login flow tested end-to-end
- [ ] JWT cookie verified in browser DevTools
- [ ] Session persistence tested
- [ ] Logout tested
- [ ] Contributor role tested
- [ ] Rate limiting tested (optional)

**Estimated completion time**: 25-35 minutes ⏱️

---

**🎉 Congratulations!** Your travel blog authentication system is now live on Cloudflare's global network!
