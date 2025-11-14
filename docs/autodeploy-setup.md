# Autodeploy Setup for Cloudflare

This guide shows how to set up automatic deployments for both Cloudflare Workers and Pages when you push to GitHub.

---

## Table of Contents

1. [Cloudflare Pages Autodeploy (Git Integration)](#cloudflare-pages-autodeploy-git-integration)
2. [Cloudflare Workers Autodeploy (GitHub Actions)](#cloudflare-workers-autodeploy-github-actions)
3. [Complete Workflow](#complete-workflow)

---

## Cloudflare Pages Autodeploy (Git Integration)

Cloudflare Pages supports two deployment methods:
1. **Git Integration** (recommended) - Automatic deploys on push
2. **Direct Upload** - Manual deploys via Wrangler CLI

Since you currently have a Direct Upload project (`travel-blog-4my`), you have two options:

### Option A: Add GitHub Actions for Pages (Easiest)

Keep your existing project and use GitHub Actions for automatic deployment.

Create `.github/workflows/deploy-pages.yml`:

```yaml
name: Deploy Pages

on:
  push:
    branches:
      - main
    paths:
      - 'travel-blog/**'
      - '.github/workflows/deploy-pages.yml'
  workflow_dispatch:

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Pages
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build Next.js site
        run: npm run build
      
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: pages deploy travel-blog/out --project-name=travel-blog-4my
```

**Pros:** Keep existing project, no data migration needed  
**Cons:** Requires GitHub Actions (but you need it for Workers anyway)

### Option B: Recreate with Git Integration (More Features)

Delete current project and create new one with Git integration for automatic preview deployments.

#### Step 1: Delete Existing Project (Optional - Backup First!)

1. Go to Cloudflare Dashboard → Workers & Pages
2. Find `travel-blog-4my`
3. Click **...** → **Delete**

#### Step 2: Create New Git-Connected Project

1. Click **Create application** → **Pages** → **Connect to Git**
2. Authorize GitHub access
3. Select repository: `andreas-ludviksen/firstSpecKitProject`
4. Configure build settings (see below)
5. Click **Save and Deploy**

**Pros:** Automatic preview URLs for branches, simpler workflow  
**Cons:** Need to delete and recreate project

---

## Recommended Approach: GitHub Actions for Both

Since Workers already require GitHub Actions, use the same approach for Pages.

### Setup Steps

#### 1. Connect GitHub Repository

**Via Cloudflare Dashboard:**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **Workers & Pages**
2. Click **Create application** → **Pages** → **Connect to Git**
3. Authorize Cloudflare to access your GitHub account
4. Select repository: `andreas-ludviksen/firstSpecKitProject`
5. Choose branch: `main` (or your default branch)
6. Set up build configuration (see next step)

**Note:** If you already have a Pages project deployed via Wrangler (like `travel-blog-4my`), you need to:
- Either delete the existing project and recreate it with Git integration
- Or keep using manual deployment via `npx wrangler pages deploy`

**Current State Check:**
- If you deployed Pages using `npx wrangler pages deploy`, it's a **Direct Upload** project
- Direct Upload projects don't have Git integration built-in
- You have two options:
  1. Keep using `npx wrangler pages deploy` (manual or via GitHub Actions)
  2. Create a new Pages project with Git integration (recommended for autodeploy)

#### 2. Configure Build Settings

Set these in the Cloudflare dashboard:

```
Framework preset: Next.js
Build command: npm run build
Build output directory: /out
Root directory: /travel-blog
Node version: 18
```

#### 3. Environment Variables (if needed)

Under **Settings** → **Environment variables**, add:

```
NEXT_PUBLIC_AUTH_API_URL=https://travel-blog-auth.andreas-e-ludviksen.workers.dev
NODE_VERSION=18
```

#### 4. Test Autodeploy

Push a change to your repository:

```bash
git add .
git commit -m "Test autodeploy"
git push
```

Within seconds, you'll see a new deployment start in the Cloudflare dashboard under **Deployments**.

### Branch Deployments

Cloudflare Pages automatically creates preview deployments for branches:

- **Production**: Deploys from `main` branch → `travel-blog-4my.pages.dev`
- **Preview**: Deploys from feature branches → `<commit-hash>.travel-blog-4my.pages.dev`

---

## Cloudflare Workers Autodeploy (GitHub Actions)

Workers require GitHub Actions to autodeploy since they don't have built-in Git integration.

### Setup Steps

#### 1. Create Cloudflare API Token

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/) → **My Profile** → **API Tokens**
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Set permissions:
   - Account → Workers Scripts → Edit
   - Account → Workers KV Storage → Edit
   - Account → D1 → Edit (if using D1)
5. Click **Continue to summary** → **Create Token**
6. **Copy the token** (you won't see it again!)

#### 2. Add Secrets to GitHub Repository

1. Go to your GitHub repository: `https://github.com/andreas-ludviksen/firstSpecKitProject`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these secrets:

| Name | Value | Description |
|------|-------|-------------|
| `CLOUDFLARE_API_TOKEN` | (token from step 1) | Allows GitHub Actions to deploy Workers |
| `CLOUDFLARE_ACCOUNT_ID` | (your account ID) | Found in Cloudflare dashboard sidebar |

**To find your Account ID:**
- Go to Cloudflare dashboard
- Click **Workers & Pages** in sidebar
- Your Account ID is shown in the right column

#### 3. Create GitHub Actions Workflow

Create `.github/workflows/deploy-workers.yml`:

```yaml
name: Deploy Workers

on:
  push:
    branches:
      - main
    paths:
      - 'workers/**'
      - 'wrangler.toml'
      - '.github/workflows/deploy-workers.yml'
  workflow_dispatch:  # Allow manual trigger

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare Workers
    
    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Deploy to Cloudflare Workers
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy
```

#### 4. Commit and Push Workflow

```bash
git add .github/workflows/deploy-workers.yml
git commit -m "Add Workers autodeploy with GitHub Actions"
git push
```

The workflow will run automatically on push!

### Workflow Features

✅ **Automatic**: Runs on every push to `main` that changes Workers files  
✅ **Manual trigger**: Can run manually via GitHub Actions tab  
✅ **Tests first**: Runs `npm test` before deploying (fails if tests fail)  
✅ **Path filtering**: Only runs when Worker files change  

### Viewing Deployment Status

1. Go to GitHub repository → **Actions** tab
2. See all workflow runs and their status
3. Click a run to see detailed logs

---

## Complete Workflow

Once both are set up, here's what happens when you push code:

### Scenario 1: Workers Code Changed

```bash
# Edit workers/auth/login.ts
git add workers/
git commit -m "Fix login rate limiting"
git push
```

**Result:**
- ✅ GitHub Actions triggers Workers deployment
- ✅ Tests run automatically
- ✅ If tests pass, deploys to Cloudflare Workers
- ⏭️ Pages deployment skipped (no changes)

### Scenario 2: Pages Code Changed

```bash
# Edit travel-blog/src/components/Header.tsx
git add travel-blog/
git commit -m "Update header styling"
git push
```

**Result:**
- ✅ Cloudflare Pages triggers automatic build
- ✅ Deploys new static site
- ⏭️ Workers deployment skipped (no changes)

### Scenario 3: Both Changed

```bash
# Edit both Workers and Pages
git add .
git commit -m "Update authentication flow"
git push
```

**Result:**
- ✅ GitHub Actions deploys Workers
- ✅ Cloudflare Pages deploys site
- ✅ Both happen in parallel

---

## Advanced: Environment-Specific Deployments

### Deploy to Different Environments

Modify `.github/workflows/deploy-workers.yml` to deploy to staging/production:

```yaml
name: Deploy Workers

on:
  push:
    branches:
      - main          # Production
      - develop       # Staging

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      
      - run: npm ci
      - run: npm test

      # Production deployment
      - name: Deploy to Production
        if: github.ref == 'refs/heads/main'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env production
      
      # Staging deployment
      - name: Deploy to Staging
        if: github.ref == 'refs/heads/develop'
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
          command: deploy --env staging
```

Then add environments to `wrangler.toml`:

```toml
# Production (default)
name = "travel-blog-auth"
main = "workers/index.ts"

[env.staging]
name = "travel-blog-auth-staging"
vars = { ENVIRONMENT = "staging" }

[env.production]
vars = { ENVIRONMENT = "production" }
```

---

## Monitoring Deployments

### Cloudflare Dashboard

- **Workers**: Dashboard → Workers & Pages → Your Worker → View logs
- **Pages**: Dashboard → Workers & Pages → Your Page → Deployments

### GitHub Actions

- Repository → **Actions** tab
- See all runs, logs, and deployment status
- Enable email notifications in GitHub settings

### Notifications

Set up Slack/Discord notifications for deployments:

```yaml
# Add to .github/workflows/deploy-workers.yml
- name: Notify on Deployment
  if: success()
  run: |
    curl -X POST YOUR_WEBHOOK_URL \
      -H 'Content-Type: application/json' \
      -d '{"text":"Workers deployed successfully to production!"}'
```

---

## Rollback Strategy

### Cloudflare Pages

1. Go to Dashboard → Pages → Deployments
2. Click **...** on a previous deployment
3. Click **Rollback to this deployment**

### Cloudflare Workers

Use Wrangler to deploy a previous version:

```bash
# View deployments
npx wrangler deployments list

# Rollback to specific version
npx wrangler rollback --message "Rollback due to bug"
```

Or redeploy from a previous commit:

```bash
git checkout <commit-hash>
npx wrangler deploy
git checkout main
```

---

## Troubleshooting

### Workers Not Deploying

**Problem**: GitHub Actions fails with "Unauthorized"

**Solution**: Check API token has correct permissions:
- Workers Scripts: Edit
- Workers KV Storage: Edit
- D1: Edit (if using D1)

### Pages Build Failing

**Problem**: Build fails with "Command not found"

**Solution**: Check build settings in Cloudflare dashboard:
- Root directory: `/travel-blog`
- Build command: `npm run build`
- Node version: `18`

### Secrets Not Working

**Problem**: Environment variables not available

**Solution**: 
- For Workers: Add to `wrangler.toml` under `[vars]`
- For Pages: Add in Cloudflare dashboard under Settings → Environment variables
- Redeploy after adding secrets

---

## Security Best Practices

✅ **Never commit API tokens** to git  
✅ **Use GitHub Secrets** for sensitive values  
✅ **Rotate API tokens** regularly (every 90 days)  
✅ **Limit token permissions** to only what's needed  
✅ **Enable branch protection** on `main` to require PR reviews  
✅ **Use environment-specific tokens** for staging/production  

---

## Next Steps

- ✅ Set up autodeploy for Pages (Git integration)
- ✅ Set up autodeploy for Workers (GitHub Actions)
- 📝 Configure branch protection rules
- 📝 Set up deployment notifications
- 📝 Create staging environment
- 📝 Document rollback procedures

---

## Additional Resources

- [Cloudflare Pages Docs](https://developers.cloudflare.com/pages/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler Action (GitHub)](https://github.com/cloudflare/wrangler-action)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
