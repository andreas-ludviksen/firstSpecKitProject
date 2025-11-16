# MVP Local Testing & Production Deployment Guide

**Feature**: 004-modular-blog-posts  
**Date**: November 15, 2025  
**Status**: Ready for Testing

## Overview

This guide walks you through:
1. Setting up local testing environment
2. Testing the complete MVP workflow
3. Deploying to production on Cloudflare

---

## Part 1: Local Testing Setup

### Prerequisites

- [x] Node.js 20+ installed
- [x] npm installed
- [x] Cloudflare account (for API keys)
- [ ] Local environment configured

### Step 1: Install Dependencies

```powershell
# In travel-blog/ directory
npm install

# In workers/ directory
cd workers
npm install
cd ..
```

### Step 2: Configure Local Environment Variables

Create `workers/.dev.vars` from the example:

```powershell
cd workers
copy .dev.vars.example .dev.vars
```

Edit `workers/.dev.vars` with your credentials:

```ini
# Get these from Cloudflare Dashboard
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_IMAGES_API_TOKEN=your-images-api-token

# R2 credentials (for video uploads)
CLOUDFLARE_R2_ACCESS_KEY_ID=your-r2-access-key
CLOUDFLARE_R2_SECRET_ACCESS_KEY=your-r2-secret-key

# JWT secret (from feature 003 - already configured)
JWT_SECRET=your-existing-jwt-secret

NODE_ENV=development
```

**Where to find these values:**

1. **Account ID**: Dashboard → Account ID (right sidebar)
2. **Images API Token**: Dashboard → Images → Use API → Create API Token
3. **R2 Access Keys**: Dashboard → R2 → Manage R2 API Tokens → Create API Token

### Step 3: Apply Database Migrations

```powershell
# Apply blog posts schema
npx wrangler d1 execute travel-blog-users --local --file=workers/migrations/0003_create_blog_posts_schema.sql

# Seed templates
npx wrangler d1 execute travel-blog-users --local --file=workers/migrations/0004_seed_templates.sql
```

**Verify migrations:**

```powershell
# Check tables exist
npx wrangler d1 execute travel-blog-users --local --command="SELECT name FROM sqlite_master WHERE type='table'"

# Check templates seeded (should show 10 templates)
npx wrangler d1 execute travel-blog-users --local --command="SELECT COUNT(*) as count FROM design_templates"
```

### Step 4: Create R2 Bucket for Local Testing

```powershell
# Create local R2 bucket (Wrangler handles this automatically in dev mode)
# No action needed - Wrangler uses local storage in .wrangler/state/
```

---

## Part 2: Start Development Servers

You'll need to run **3 workers** and **1 Next.js server** simultaneously.

### Terminal 1: Auth Worker

```powershell
cd workers
npx wrangler dev auth/index.ts --name travel-blog-auth --local --port 8787
```

Expected output:
```
⛅️ wrangler 3.x.x
------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Terminal 2: Media Upload Worker

```powershell
cd workers
npx wrangler dev media-upload/index.ts --name travel-blog-media --local --port 8788
```

Expected output:
```
[wrangler:inf] Ready on http://localhost:8788
```

### Terminal 3: Posts Worker

```powershell
cd workers
npx wrangler dev posts/index.ts --name travel-blog-posts --local --port 8789
```

Expected output:
```
[wrangler:inf] Ready on http://localhost:8789
```

### Terminal 4: Next.js Frontend

```powershell
# From travel-blog/ root directory
npm run dev
```

Expected output:
```
  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  - Ready in 2.3s
```

---

## Part 3: Testing the MVP

### Test 1: Verify Workers Are Running

Open a new terminal:

```powershell
# Test auth worker
curl http://localhost:8787/api/auth/health

# Test media worker
curl http://localhost:8788/api/media/health

# Test posts worker
curl http://localhost:8789/api/posts/health
```

Expected: All should return `{"status":"ok"}`

### Test 2: Login

```powershell
# Login with test user (from feature 003)
curl -X POST http://localhost:8787/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"admin\",\"password\":\"your-password\"}'
```

Expected response:
```json
{
  "success": true,
  "message": "Login successful"
}
```

**Save the session cookie** from the response headers for subsequent requests.

### Test 3: Create a Blog Post

Open your browser and navigate to:
```
http://localhost:3000/posts/create
```

**Workflow to test:**

1. **Fill in metadata:**
   - Title: "Test Post - My Amazing Trip"
   - Description: "Testing the MVP locally"

2. **Upload a photo:**
   - Use MediaUploader component
   - Drag and drop a test image (JPG/PNG)
   - Add caption: "Beautiful sunset"
   - Add alt text: "Sunset over mountains"

3. **Upload a video (optional):**
   - Upload a small MP4 file
   - Add caption: "Timelapse video"

4. **Add text blocks:**
   - Click "Add Text Block"
   - Write Markdown content:
     ```markdown
     ## My Journey
     
     This is a **test** of the modular blog post system.
     
     - Photo upload ✓
     - Video upload ✓
     - Text blocks ✓
     ```

5. **Reorder content:**
   - Use drag handles to reorder photos, videos, text
   - Verify the order updates

6. **Select template:**
   - Click "Select Template" tab
   - Choose "Classic Grid" (Template01)
   - Preview should show your content in the template

7. **Publish:**
   - Click "Publish Post"
   - Wait for success message
   - Note the post slug

### Test 4: View Published Post

Navigate to:
```
http://localhost:3000/posts/test-post-my-amazing-trip
```

**Verify:**
- [ ] Title displays correctly
- [ ] Description appears
- [ ] Photos render with Next.js Image component
- [ ] Videos play in HTML5 player
- [ ] Text blocks render with Markdown formatting
- [ ] Template layout (Classic Grid) displays properly
- [ ] Placeholders appear if content < template capacity
- [ ] Excess content hidden if content > template capacity

### Test 5: Test Different Templates

Repeat Test 3-4 with different templates:
- Template02: Story Layout
- Template03: Photo Grid Showcase (upload 10+ photos)
- Template04: Video-First Layout (upload 2+ videos)
- Template05: Masonry Layout

**Verify each template:**
- [ ] Renders correctly
- [ ] Respects content capacity
- [ ] Shows placeholders (FR-016)
- [ ] Hides excess content (FR-017)
- [ ] Responsive on mobile/tablet/desktop

### Test 6: Content Limits

Create a post that **exceeds** Template06 limits:
- Max: 8 photos, 1 video, 10 text blocks
- Upload: 12 photos, 3 videos, 15 text blocks

**Verify:**
- [ ] Only first 8 photos displayed
- [ ] Only first 1 video displayed
- [ ] Only first 10 text blocks displayed
- [ ] No errors in console

### Test 7: Minimal Content

Create a post with **minimal** content:
- Only 2 photos
- No videos
- 1 text block

**Verify:**
- [ ] Placeholders appear for missing photos (FR-016)
- [ ] Template renders gracefully
- [ ] No layout breaks

---

## Part 4: Production Deployment

### Prerequisites

- [ ] Cloudflare account with Workers plan
- [ ] Custom domain (optional but recommended)
- [ ] All local tests passing

### Step 1: Create Production Resources

#### 1.1 Create Production D1 Database

```powershell
# Create database
npx wrangler d1 create travel-blog-users-prod

# Note the database_id from output, update wrangler.toml:
# database_id = "your-prod-database-id"
```

Apply migrations:

```powershell
npx wrangler d1 execute travel-blog-users-prod --file=workers/migrations/0001_create_users.sql
npx wrangler d1 execute travel-blog-users-prod --file=workers/migrations/0002_add_users.sql
npx wrangler d1 execute travel-blog-users-prod --file=workers/migrations/0003_create_blog_posts_schema.sql
npx wrangler d1 execute travel-blog-users-prod --file=workers/migrations/0004_seed_templates.sql
```

#### 1.2 Create Production R2 Bucket

```powershell
npx wrangler r2 bucket create travel-blog-media-prod
```

#### 1.3 Create Production KV Namespace

```powershell
npx wrangler kv:namespace create RATE_LIMITER
npx wrangler kv:namespace create SESSIONS
```

Note the IDs and update `wrangler.toml`.

#### 1.4 Configure Cloudflare Images

1. Go to Dashboard → Images
2. Enable Cloudflare Images ($5/month)
3. Create API token for production
4. Note your Account ID

### Step 2: Configure Production Secrets

```powershell
cd workers

# Set JWT secret
npx wrangler secret put JWT_SECRET
# Enter your production JWT secret when prompted

# Set Cloudflare Images API token
npx wrangler secret put CLOUDFLARE_IMAGES_API_TOKEN
# Enter your production Images API token

# Set R2 credentials
npx wrangler secret put CLOUDFLARE_R2_ACCESS_KEY_ID
npx wrangler secret put CLOUDFLARE_R2_SECRET_ACCESS_KEY

# Set Account ID
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID
```

### Step 3: Update Production Configuration

Create `workers/wrangler.prod.toml`:

```toml
name = "travel-blog-prod"
main = "workers/auth/index.ts"
compatibility_date = "2024-09-23"
compatibility_flags = ["nodejs_compat"]

[[kv_namespaces]]
binding = "RATE_LIMITER"
id = "YOUR_PROD_KV_ID"

[[kv_namespaces]]
binding = "SESSIONS"
id = "YOUR_PROD_SESSIONS_KV_ID"

[[d1_databases]]
binding = "DB"
database_name = "travel-blog-users-prod"
database_id = "YOUR_PROD_D1_ID"

[[r2_buckets]]
binding = "MEDIA_BUCKET"
bucket_name = "travel-blog-media-prod"

[vars]
NODE_ENV = "production"

# Add your production routes
routes = [
  { pattern = "yourdomain.com/api/auth/*", zone_name = "yourdomain.com" },
  { pattern = "yourdomain.com/api/posts/*", zone_name = "yourdomain.com" },
  { pattern = "yourdomain.com/api/media/*", zone_name = "yourdomain.com" }
]
```

### Step 4: Deploy Workers

```powershell
cd workers

# Deploy auth worker
npx wrangler deploy auth/index.ts --name travel-blog-auth-prod --config wrangler.prod.toml

# Deploy media upload worker
npx wrangler deploy media-upload/index.ts --name travel-blog-media-prod --config wrangler.prod.toml

# Deploy posts worker
npx wrangler deploy posts/index.ts --name travel-blog-posts-prod --config wrangler.prod.toml
```

### Step 5: Deploy Next.js Static Site

#### Option A: Cloudflare Pages

```powershell
# Build static site
npm run build

# Deploy to Cloudflare Pages
npx wrangler pages deploy out --project-name=travel-blog
```

#### Option B: Manual Upload

```powershell
# Build
npm run build

# Upload the 'out/' directory to your hosting provider
# Configure your domain to point to the static files
```

### Step 6: Configure Environment Variables for Next.js

In Cloudflare Pages dashboard, add environment variables:
- `NEXT_PUBLIC_API_URL`: Your Workers URL (e.g., `https://api.yourdomain.com`)

### Step 7: Verify Production Deployment

1. **Test authentication:**
   ```powershell
   curl https://api.yourdomain.com/api/auth/health
   ```

2. **Test in browser:**
   - Navigate to `https://yourdomain.com/posts/create`
   - Login with production credentials
   - Create a test post
   - Verify post displays at `https://yourdomain.com/posts/[slug]`

3. **Test media uploads:**
   - Upload photo → verify in Cloudflare Images dashboard
   - Upload video → verify in R2 bucket

---

## Part 5: Post-Deployment Checklist

### Security

- [ ] All secrets configured (not in code)
- [ ] CORS configured correctly
- [ ] Rate limiting enabled
- [ ] Authentication working
- [ ] HTTPS enforced

### Performance

- [ ] Cloudflare Images serving optimized images
- [ ] R2 videos loading correctly
- [ ] Static site cached at edge
- [ ] No console errors

### Monitoring

- [ ] Check Workers Analytics in dashboard
- [ ] Monitor D1 query performance
- [ ] Track Cloudflare Images usage
- [ ] Monitor R2 storage costs

### Content

- [ ] All 10 templates rendering correctly
- [ ] Placeholders working (FR-016)
- [ ] Content overflow hidden (FR-017)
- [ ] SEO metadata correct

---

## Troubleshooting

### Issue: Workers not connecting to D1

**Solution:**
```powershell
# Verify D1 binding in wrangler.toml
npx wrangler d1 list

# Check migrations applied
npx wrangler d1 execute DB_NAME --command="SELECT * FROM blog_posts LIMIT 1"
```

### Issue: Images not uploading

**Solution:**
- Verify `CLOUDFLARE_IMAGES_API_TOKEN` secret
- Verify `CLOUDFLARE_ACCOUNT_ID` secret
- Check Images dashboard for quota
- Test with small image first (< 1MB)

### Issue: Videos not uploading

**Solution:**
- Verify R2 bucket exists: `npx wrangler r2 bucket list`
- Verify R2 credentials in secrets
- Check R2 binding in wrangler.toml
- Test with small video (< 5MB)

### Issue: Template not rendering

**Solution:**
- Check browser console for errors
- Verify template ID matches database (`template-01` to `template-10`)
- Check that template registry exports component
- Verify PostRenderer dynamic import

### Issue: 404 on post page

**Solution:**
- Verify Next.js static export includes dynamic routes
- Check `generateStaticParams` in `[slug]/page.tsx`
- Rebuild with `npm run build`
- Clear browser cache

---

## Cost Estimate (Production)

| Service | Usage | Monthly Cost |
|---------|-------|--------------|
| Cloudflare Workers | 100k requests | Free (included) |
| Cloudflare D1 | 5GB storage | Free (included) |
| Cloudflare Images | 100k images | $5.00 |
| Cloudflare R2 | 15GB storage | $0.23 |
| Cloudflare Pages | Static hosting | Free |
| **Total** | | **$5.23/month** |

---

## Success Criteria

Your MVP is successfully deployed when:

- [x] All local tests pass
- [ ] Production workers deployed
- [ ] Production database migrated
- [ ] Can create post with photos/videos/text
- [ ] Can select from 10 templates
- [ ] Post displays correctly with chosen template
- [ ] Placeholders work (FR-016)
- [ ] Content limits enforced (FR-017)
- [ ] SEO-friendly URLs work
- [ ] No console errors
- [ ] Mobile responsive

---

## Next Steps After Successful Deployment

1. **Create real content** - Replace test posts with actual travel stories
2. **User Story 2** - Add template switching for existing posts
3. **User Story 3** - Add template preview during creation
4. **User Story 4** - Add external media URL support (YouTube, Vimeo)
5. **Phase 8 Polish** - Performance optimization, UX enhancements

---

## Support Resources

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Cloudflare D1 Docs](https://developers.cloudflare.com/d1/)
- [Cloudflare Images Docs](https://developers.cloudflare.com/images/)
- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)

---

**Ready to start testing!** 🚀

Begin with Part 1, Step 1 and work through each section systematically.
