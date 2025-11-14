# Quick Start: User Authentication Development

**Feature**: 003-user-authentication  
**Last Updated**: 2025-11-13  
**Estimated Setup Time**: 30 minutes

## Overview

This guide helps developers set up a local development environment for implementing password-based authentication with Cloudflare Workers.

---

## Prerequisites

- [x] Node.js 18+ and npm installed
- [x] Git repository cloned (`firstSpecKitProject`)
- [x] Existing Next.js travel blog working (`cd travel-blog && npm run dev`)
- [x] Cloudflare account (free tier) - [Sign up here](https://dash.cloudflare.com/sign-up)
- [x] Wrangler CLI installed: `npm install -g wrangler`

**Verify Prerequisites**:
```powershell
node --version    # Should be v18+
npm --version     # Should be 9+
wrangler --version  # Should be 3.x
```

---

## Part 1: Wrangler Setup (5 minutes)

### Step 1: Authenticate Wrangler

```powershell
# Login to Cloudflare account
wrangler login

# Browser window opens for authentication
# Follow prompts to authorize Wrangler
```

**Expected Output**:
```
Successfully logged in.
```

### Step 2: Verify Account

```powershell
# Check account details
wrangler whoami
```

**Expected Output**:
```
 ⛅️ wrangler 3.x.x
-------------------
Getting User settings...
👋 You are logged in with an OAuth Token, associated with the email '<your-email>'.
```

---

## Part 2: Workers Project Setup (10 minutes)

### Step 3: Create Workers Directory

```powershell
# From repository root
cd travel-blog
mkdir workers
cd workers
mkdir auth
```

### Step 4: Initialize Wrangler Configuration

Create `travel-blog/workers/wrangler.toml`:

```toml
name = "travel-blog-auth"
main = "auth/index.ts"
compatibility_date = "2025-11-13"

# Workers configuration
workers_dev = true  # Enable *.workers.dev preview URL

# Environment variables (secrets set via CLI)
[vars]
NODE_ENV = "development"

# KV namespace for rate limiting (optional in dev)
# [[kv_namespaces]]
# binding = "RATE_LIMIT_KV"
# id = "preview_id_here"  # Use wrangler kv:namespace create to generate
```

### Step 5: Install Workers Dependencies

```powershell
# From travel-blog/workers directory
npm init -y

# Install authentication libraries
npm install bcryptjs jsonwebtoken itty-router

# Install TypeScript and Workers types
npm install --save-dev @cloudflare/workers-types typescript @types/bcryptjs @types/jsonwebtoken
```

### Step 6: Configure TypeScript

Create `travel-blog/workers/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020"],
    "moduleResolution": "node",
    "types": ["@cloudflare/workers-types"],
    "resolveJsonModule": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "outDir": "./dist"
  },
  "include": ["**/*.ts"],
  "exclude": ["node_modules", "dist"]
}
```

---

## Part 3: Test Data Setup (5 minutes)

### Step 7: Generate Password Hashes

Create `travel-blog/workers/scripts/generate-hash.ts`:

```typescript
import bcrypt from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npx ts-node scripts/generate-hash.ts <password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('Password hash:');
console.log(hash);
```

Generate test user hashes:

```powershell
# Install ts-node for script execution
npm install --save-dev ts-node

# Generate hash for test password
npx ts-node scripts/generate-hash.ts "testpassword123"

# Copy the output hash for next step
```

### Step 8: Create Test Users File

Create `travel-blog/workers/users.json`:

```json
{
  "users": [
    {
      "username": "testuser",
      "passwordHash": "$2a$10$[PASTE_HASH_FROM_STEP_7]",
      "role": "reader",
      "displayName": "Test User"
    },
    {
      "username": "testcontributor",
      "passwordHash": "$2a$10$[GENERATE_ANOTHER_HASH]",
      "role": "contributor",
      "displayName": "Test Contributor"
    }
  ]
}
```

---

## Part 4: Local Development (5 minutes)

### Step 9: Set JWT Secret

```powershell
# Store JWT secret locally (dev only, use Cloudflare secrets in prod)
$env:JWT_SECRET = "dev-secret-key-change-in-production"

# Or add to wrangler.toml [vars] for local dev
```

### Step 10: Start Workers Dev Server

```powershell
# From travel-blog/workers directory
wrangler dev

# Workers dev server starts on http://localhost:8787
```

**Expected Output**:
```
 ⛅️ wrangler 3.x.x
-------------------
⎔ Starting local server...
[wrangler:inf] Ready on http://localhost:8787
```

### Step 11: Test Authentication Endpoint

Open new PowerShell terminal:

```powershell
# Test login endpoint (replace with your implementation)
$body = @{
  username = "testuser"
  password = "testpassword123"
  rememberMe = $true
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:8787/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body $body
```

**Expected Response** (after implementation):
```json
{
  "success": true,
  "user": {
    "username": "testuser",
    "role": "reader",
    "displayName": "Test User"
  },
  "expiresAt": "2025-11-20T..."
}
```

---

## Part 5: Next.js Integration (5 minutes)

### Step 12: Configure Next.js API Proxy (Development)

Add to `travel-blog/next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',  // Existing static export config
  
  // Development proxy to Workers (local dev only)
  async rewrites() {
    return process.env.NODE_ENV === 'development'
      ? [
          {
            source: '/api/auth/:path*',
            destination: 'http://localhost:8787/api/auth/:path*',
          },
        ]
      : [];
  },
};

module.exports = nextConfig;
```

### Step 13: Start Next.js Dev Server

```powershell
# Open new terminal, navigate to travel-blog/
cd travel-blog
npm run dev

# Next.js starts on http://localhost:3000
```

### Step 14: Test Full Stack

Open browser: `http://localhost:3000`

- Next.js serves frontend
- API calls to `/api/auth/*` proxy to Workers on port 8787
- Full authentication flow testable locally

---

## Development Workflow

### Daily Development

1. **Start Workers**:
   ```powershell
   cd travel-blog/workers
   wrangler dev
   ```

2. **Start Next.js** (separate terminal):
   ```powershell
   cd travel-blog
   npm run dev
   ```

3. **Make Changes**:
   - Edit Workers code in `workers/auth/*.ts`
   - Edit Next.js components in `src/components/`
   - Both hot-reload automatically

4. **Run Tests**:
   ```powershell
   # Unit tests
   npm test

   # Watch mode
   npm run test:watch
   ```

### Testing Endpoints

**Login**:
```powershell
curl http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{"username":"testuser","password":"testpassword123","rememberMe":true}' `
  -c cookies.txt
```

**Verify Session**:
```powershell
curl http://localhost:3000/api/auth/verify `
  -b cookies.txt
```

**Logout**:
```powershell
curl -X POST http://localhost:3000/api/auth/logout `
  -b cookies.txt
```

---

## Troubleshooting

### Issue: "wrangler: command not found"

**Solution**:
```powershell
npm install -g wrangler
# Restart terminal
```

### Issue: "Module not found: bcryptjs"

**Solution**:
```powershell
cd travel-blog/workers
npm install bcryptjs
```

### Issue: Workers dev server port conflict

**Solution**:
```powershell
# Use different port
wrangler dev --port 8788
# Update next.config.js proxy destination
```

### Issue: CORS errors in browser

**Solution**: Add CORS headers to Workers responses:

```typescript
return new Response(JSON.stringify(data), {
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': 'http://localhost:3000',
    'Access-Control-Allow-Credentials': 'true',
  },
});
```

### Issue: JWT_SECRET not found

**Solution**: Set environment variable:
```powershell
# PowerShell
$env:JWT_SECRET = "dev-secret-key"

# Or add to wrangler.toml [vars]
```

---

## Next Steps

✅ Local environment ready  
→ **Implement Phase 3+** per tasks.md (when generated)

### Recommended Reading

- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Next.js API Routes](https://nextjs.org/docs/api-routes/introduction)
- [bcrypt.js Documentation](https://github.com/dcodeIO/bcrypt.js)
- [JWT (jsonwebtoken) Documentation](https://github.com/auth0/node-jsonwebtoken)

### Production Deployment

See `docs/cloudflare-setup.md` (to be created) for production deployment guide with:
- Cloudflare Pages deployment
- Workers secrets configuration
- Custom domain setup
- KV namespace creation

---

## Summary

**Total Setup Time**: ~30 minutes

**What You've Accomplished**:
- ✅ Wrangler authenticated with Cloudflare account
- ✅ Workers project structure created
- ✅ Dependencies installed (bcryptjs, jsonwebtoken, itty-router)
- ✅ Test users with hashed passwords configured
- ✅ Local dev server running (Workers + Next.js)
- ✅ API proxy configured for full-stack testing

**Ready to Code**: Start implementing authentication endpoints in `workers/auth/` per contracts!
