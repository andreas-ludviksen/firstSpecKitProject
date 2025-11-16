# Cloudflare Infrastructure Setup Guide

**Feature**: 004-modular-blog-posts  
**Date**: November 15, 2025  
**Purpose**: Set up Cloudflare resources for local development and production

---

## Overview

We need to set up:
1. ✅ D1 Database (already exists: `travel-blog-users`)
2. 🔲 R2 Bucket for video storage
3. 🔲 Cloudflare Images (enable service)
4. 🔲 KV Namespace for sessions/rate limiting
5. 🔲 API Tokens and credentials

---

## Step 1: Verify Existing D1 Database

Your D1 database `travel-blog-users` already exists from feature 003.

**Verify it's set up:**

```powershell
# List databases
npx wrangler d1 list

# Check if blog posts tables exist
npx wrangler d1 execute travel-blog-users --local --command="SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
```

**Expected tables:**
- `blog_posts`
- `design_templates`
- `post_photos`
- `post_videos`
- `post_text_blocks`
- `users`

**If blog tables don't exist, run migrations:**

```powershell
cd workers

# Apply blog schema
npx wrangler d1 execute travel-blog-users --local --file=migrations/0003_create_blog_posts_schema.sql

# Seed templates
npx wrangler d1 execute travel-blog-users --local --file=migrations/0004_seed_templates.sql
```

---

## Step 2: Create R2 Bucket for Videos

R2 is Cloudflare's S3-compatible object storage for videos.

### Create Bucket

```powershell
# Create bucket for local development
npx wrangler r2 bucket create travel-blog-media

# Verify bucket created
npx wrangler r2 bucket list
```

**Expected output:**
```
travel-blog-media
```

### Get R2 API Tokens

R2 API tokens must be created via the Cloudflare Dashboard:

1. Go to: https://dash.cloudflare.com → **R2** → **Manage R2 API Tokens**
2. Click **"Create API Token"**
3. **Token name**: `travel-blog-media-token`
4. **Permissions**: Select **"Object Read & Write"** or **"Admin Read & Write"**
5. **TTL**: Leave as default (never expires) or set custom
6. **(Optional) Specify bucket**: Select `travel-blog-media` to restrict access
7. Click **"Create API Token"**

**Save these values:**
- Access Key ID: `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- Secret Access Key: `yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy`

⚠️ **Important:** Save the Secret Access Key now - you can't view it again!

---

## Step 3: Enable Cloudflare Images

Cloudflare Images optimizes and serves photos with automatic format conversion (WebP/AVIF).

### Enable Images Service

1. Go to: https://dash.cloudflare.com → Images
2. Click "Purchase Cloudflare Images" ($5/month for 100k images)
3. OR click "Start Free Trial" (if available)

### Create Images API Token

1. In Images dashboard, click "Use API"
2. Click "Create API Token"
3. Name: `travel-blog-images-token`
4. Permissions: "Cloudflare Images - Edit"
5. Click "Create Token"

**Save this value:**
- Images API Token: `zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz`

### Get Account ID

1. Still in Cloudflare Dashboard
2. Look at the right sidebar
3. Copy your "Account ID": `abc123def456...`

---

## Step 4: Create KV Namespaces

KV namespaces store rate limiting data and sessions.

### Create Namespaces

```powershell
# Create rate limiting namespace
npx wrangler kv namespace create RATE_LIMITER

# Create sessions namespace (optional, for future use)
npx wrangler kv namespace create SESSIONS
```

**Save the IDs from output:**
```
🌀 Creating namespace with title "workers-RATE_LIMITER"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
{ binding = "RATE_LIMITER", id = "06c6c3b1bb6d455abdf8dea2feef2796" }
```

Copy the `id` value from each namespace creation.

---

## Step 5: Update wrangler.toml Configuration

Now update your `workers/wrangler.toml` with the created resources:

```toml
name = "travel-blog-auth"
main = "workers/auth/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

# KV Namespace for rate limiting
[[kv_namespaces]]
binding = "RATE_LIMITER"
id = "YOUR_RATE_LIMITER_KV_ID"  # ← Update this

# D1 Database (already configured)
[[d1_databases]]
binding = "DB"
database_name = "travel-blog-users"
database_id = "13a81283-7ad4-4879-8287-c435eac578e4"

# R2 Bucket for video storage
[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "travel-blog-media"  # ← Should match your bucket name

[vars]
NODE_ENV = "development"
```

---

## Step 6: Create Local Environment File

Now create `workers/.dev.vars` with all the credentials:

```powershell
cd workers
copy .dev.vars.example .dev.vars
notepad .dev.vars
```

Fill in with your saved values:

```ini
# Cloudflare Images Configuration
CLOUDFLARE_ACCOUNT_ID=abc123def456...  # ← From Step 3
CLOUDFLARE_IMAGES_API_TOKEN=zzzzz...   # ← From Step 3

# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCESS_KEY_ID=xxxxx...        # ← From Step 2
CLOUDFLARE_R2_SECRET_ACCESS_KEY=yyyyy...    # ← From Step 2

# JWT Secret (from feature 003 - use existing)
JWT_SECRET=your-existing-jwt-secret-here

# Node environment
NODE_ENV=development
```

**Get your existing JWT_SECRET:**

```powershell
# Check your existing secret (if you remember it)
# OR generate a new one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Step 7: Verify Infrastructure Setup

### Test D1 Connection

```powershell
npx wrangler d1 execute travel-blog-users --local --command="SELECT COUNT(*) as count FROM design_templates"
```

Expected: `count = 10`

### Test R2 Bucket

```powershell
# List buckets
npx wrangler r2 bucket list
```

Expected: Shows `travel-blog-media`

### Test KV Namespace

```powershell
# List namespaces
npx wrangler kv namespace list
```

Expected: Shows both RATE_LIMITER and SESSIONS namespaces

---

## Credentials Summary Checklist

Before proceeding, ensure you have:

- [ ] **CLOUDFLARE_ACCOUNT_ID** - From Dashboard sidebar
- [ ] **CLOUDFLARE_IMAGES_API_TOKEN** - From Images → API
- [ ] **CLOUDFLARE_R2_ACCESS_KEY_ID** - From R2 API token creation
- [ ] **CLOUDFLARE_R2_SECRET_ACCESS_KEY** - From R2 API token creation
- [ ] **JWT_SECRET** - Your existing secret from feature 003
- [ ] **R2_BUCKET_NAME** - Should be `travel-blog-media`
- [ ] **KV_RATE_LIMITER_ID** - From KV namespace creation
- [ ] **D1_DATABASE_ID** - Already configured: `13a81283-7ad4-4879-8287-c435eac578e4`

---

## Cost Summary

| Service | Usage | Cost |
|---------|-------|------|
| D1 Database | 5GB storage, 5M reads/day | **Free** |
| R2 Storage | First 10GB | **Free** |
| R2 Requests | First 1M/month | **Free** |
| KV Namespaces | First 100k reads/day | **Free** |
| Cloudflare Images | 100k images | **$5/month** |
| Workers | 100k requests/day | **Free** |

**Total: $5/month** (only for Cloudflare Images)

---

## Next Steps

After completing infrastructure setup:

1. ✅ All Cloudflare resources created
2. ✅ `workers/.dev.vars` configured
3. ✅ `wrangler.toml` updated
4. → **Start local development** (see TESTING_AND_DEPLOYMENT.md)
5. → Run all Workers and Next.js dev server
6. → Test the complete workflow

---

## Troubleshooting

### Issue: "Error: No account found"

**Solution:**
```powershell
# Login to Cloudflare
npx wrangler login
```

### Issue: "R2 bucket already exists"

**Solution:**
```powershell
# List existing buckets
npx wrangler r2 bucket list

# Use existing bucket name in wrangler.toml
```

### Issue: "Images API token invalid"

**Solution:**
1. Verify token has "Cloudflare Images - Edit" permission
2. Check Account ID matches the account where Images is enabled
3. Regenerate token if needed

### Issue: "D1 database not found"

**Solution:**
```powershell
# List databases
npx wrangler d1 list

# If not found, create it:
npx wrangler d1 create travel-blog-users
```

---

## Security Best Practices

- ✅ Never commit `.dev.vars` to git (already in `.gitignore`)
- ✅ Never commit API tokens or secrets
- ✅ Use different tokens for development and production
- ✅ Rotate tokens periodically
- ✅ Use minimal permissions for each token

---

**Ready to proceed!** Once you complete this setup, you'll be ready to start local development servers.
