# Testing Authentication Locally

This guide explains how to test the authentication flow in development.

## Prerequisites

1. Node.js installed
2. Dependencies installed: `npm install` in both `travel-blog/` and `travel-blog/workers/`

## Step 1: Start the Cloudflare Workers Dev Server

In the `travel-blog/workers` directory:

```bash
cd travel-blog/workers
npx wrangler dev --port 8787
```

This starts the authentication API server at `http://localhost:8787`.

**Note**: You'll need to set the `JWT_SECRET` environment variable. Create a `.dev.vars` file:

```bash
# travel-blog/workers/.dev.vars
JWT_SECRET=your-secret-key-for-development
NODE_ENV=development
```

## Step 2: Start the Next.js Dev Server

In the `travel-blog/` directory:

```bash
cd travel-blog
npm run dev
```

This starts the Next.js app at `http://localhost:3000`.

## Step 3: Configure Environment Variables

Create `.env.local` in the `travel-blog/` directory:

```bash
# travel-blog/.env.local
NEXT_PUBLIC_AUTH_API_URL=http://localhost:8787
```

## Step 4: Test the Authentication Flow

1. **Visit the app**: Open `http://localhost:3000`
2. **Middleware redirect**: You should be redirected to `/login` (requires authentication)
3. **Login**:
   - Username: `testuser`
   - Password: `testpassword123`
   - Check "Remember me" for 7-day session (optional)
4. **Success**: After login, you'll be redirected to the home page
5. **Navigation**: You should see your username in the navigation bar
6. **Logout**: Click the "Logout" button to clear the session

## Test Accounts

From `travel-blog/workers/users.json`:

- **Reader**: `testuser` / `testpassword123`
- **Contributor**: `testcontributor` / `testpassword123`

## Verify JWT Cookie

Use browser DevTools:

1. Open DevTools → Application/Storage → Cookies
2. Look for cookie named `session`
3. Verify flags:
   - `HttpOnly`: ✓ (cookie hidden from JavaScript)
   - `Secure`: ✓ (HTTPS only in production)
   - `SameSite`: Strict

## Test Session Expiry

1. Login without "Remember me" → Session expires in 24 hours
2. Login with "Remember me" → Session expires in 7 days
3. To test expiry manually:
   - Delete the `session` cookie in DevTools
   - Refresh the page → Should redirect to `/login?expired=true`

## Test Rate Limiting (Optional)

Rate limiting requires Cloudflare KV. For now, it fails gracefully (allows all requests).

To test:
1. Enter wrong password 5+ times
2. Currently: All attempts allowed (KV not configured)
3. With KV: 6th attempt returns "Too many failed attempts"

## Troubleshooting

**"Failed to connect to authentication server"**:
- Ensure Wrangler dev server is running on port 8787
- Check `NEXT_PUBLIC_AUTH_API_URL` in `.env.local`

**CORS errors**:
- Workers CORS config allows `localhost:3000`
- Check browser console for specific errors

**Session not persisting**:
- Check that cookies are enabled in browser
- Verify `session` cookie exists in DevTools
- Check Workers logs for JWT generation errors

**Middleware not redirecting**:
- Verify middleware is enabled in `src/middleware.ts`
- Check middleware `config.matcher` patterns
- Review Next.js console for middleware errors
