# Travel Blog - Family Adventures Around the World

A modern, static travel blog built with Next.js 14, TypeScript, and TailwindCSS. Features stunning photography highlights, detailed travel stories, and practical family travel tips.

## 🚀 Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the site.

The development server includes:
- Hot module replacement (HMR)
- Fast refresh for instant updates
- TypeScript type checking
- ESLint warnings and errors

### Build for Production

```bash
# Create optimized production build
npm run build
```

This generates a static export in the `out/` directory that can be deployed to any static hosting service.

### Preview Production Build

```bash
# Build and serve the static export locally
npm run build
npx serve out
```

## 📁 Project Structure

```
travel-blog/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── layout.tsx    # Root layout with navigation
│   │   ├── page.tsx      # Landing page (protected)
│   │   ├── login/        # Login page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── Navigation.tsx      # Header with auth state
│   │   ├── LoginForm.tsx       # Login form with validation
│   │   ├── LogoutButton.tsx    # Logout functionality
│   │   └── HighlightPhotoCard.tsx
│   ├── hooks/            # Custom React hooks
│   │   └── useAuth.ts    # Authentication state management
│   ├── lib/              # Utility libraries
│   │   └── auth-api.ts   # Authentication API client
│   ├── data/             # Mock data (embedded storage)
│   │   ├── travels.ts    # 8 travel stories
│   │   ├── highlights.ts # 5 highlight photos
│   │   ├── familyTips.ts # 12 family tips
│   │   └── navigation.ts # Navigation menu items
│   ├── types/            # TypeScript type definitions
│   │   └── index.ts
│   └── middleware.ts     # Route protection middleware
├── workers/              # Cloudflare Workers (authentication backend)
│   ├── auth/             # Authentication endpoints
│   │   ├── index.ts      # Main router
│   │   ├── login.ts      # POST /api/auth/login
│   │   ├── verify-session.ts  # GET /api/auth/verify
│   │   └── logout.ts     # POST /api/auth/logout
│   ├── lib/              # Worker utilities
│   │   ├── jwt.ts        # JWT token generation/verification
│   │   ├── password.ts   # bcrypt password hashing
│   │   ├── sanitize.ts   # Input validation/sanitization
│   │   ├── rate-limiter.ts    # Failed login tracking (KV)
│   │   ├── user-service.ts    # User data management (D1)
│   │   └── cors.ts       # CORS configuration
│   ├── migrations/       # D1 database migrations
│   │   ├── 0001_create_users_table.sql
│   │   └── 0002_seed_test_users.sql
│   ├── types.ts          # Worker type definitions
│   └── users.json        # Legacy (migrated to D1)
│   └── wrangler.toml     # Cloudflare Workers config
├── tests/                # Test suites
│   └── workers/          # Workers unit tests (42 tests, 57.83% coverage)
├── docs/                 # Documentation
│   ├── README.md         # Documentation overview
│   ├── cloudflare-setup.md    # Deployment guide
│   └── user-management.md     # Adding/managing users
├── public/
│   └── images/           # Static images
│       ├── highlights/   # 5 highlight photos
│       └── travels/      # 8 travel story images
├── next.config.mjs       # Next.js configuration (static export)
├── tailwind.config.ts    # TailwindCSS configuration
├── jest.config.js        # Jest test configuration
├── TESTING_AUTH.md       # Local authentication testing guide
└── SECURITY_AUDIT.md     # Security audit report
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build (static export) |
| `npm run start` | Start production server (not applicable for static export) |
| `npm run lint` | Run ESLint to check code quality |
| `npm test` | Run all tests (client + workers) |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |

### Workers Scripts (Authentication Backend)

Run from `workers/` directory:

| Command | Description |
|---------|-------------|
| `wrangler dev` | Start local Workers development server on port 8787 |
| `wrangler deploy` | Deploy Workers to Cloudflare |
| `wrangler secret put JWT_SECRET` | Set JWT secret environment variable |
| `wrangler kv:namespace create RATE_LIMIT_KV` | Create KV namespace for rate limiting |

## 🎨 Features

### Current Implementation

- ✅ **User Authentication** - Secure password-based login with JWT sessions
  - Reader and Contributor roles (upload features coming soon)
  - HTTP-only cookie sessions with 7-day or 24-hour expiry
  - Rate limiting (5 failed attempts = 15-minute lockout)
  - Generic error messages to prevent username enumeration
  - bcrypt password hashing (cost factor 10)
  - Cloudflare Workers backend with KV storage
- ✅ **Protected Content** - All blog pages require authentication
  - Middleware-based route protection
  - Session verification on each request
  - Automatic redirect to login for unauthenticated users
  - Session expiry handling with return URL preservation
- ✅ **Landing Page** - Hero section with 5 featured highlight photos
- ✅ **Responsive Design** - Mobile-first approach with breakpoints at 640px, 768px, 1024px
- ✅ **Interactive Photo Grid** - Hover effects with image zoom and overlay details
- ✅ **Navigation** - Header with active route highlighting and auth state display
- ✅ **Static Export** - Next.js static site deployed to Cloudflare Pages

### Coming Soon

- 🚧 **Contributor Uploads** - Image/video upload and blog post creation for contributors
- 🚧 **Travels Page** - Browse all 8 travel stories with filtering
- 🚧 **Family Tips Page** - 12 practical tips organized by category
- 🚧 **Image Optimization** - WebP/AVIF support with lazy loading
- 🚧 **SEO Optimization** - Meta tags and Open Graph support

## 🌐 Deployment

This site requires deployment to **Cloudflare Pages** (frontend) and **Cloudflare Workers** (authentication backend).

### Cloudflare Pages + Workers (Recommended)

See the comprehensive deployment guide: **[docs/cloudflare-setup.md](./docs/cloudflare-setup.md)**

**Quick Overview**:

1. **Deploy Workers** (authentication backend):
   ```bash
   cd workers
   wrangler login
   wrangler kv:namespace create RATE_LIMIT_KV
   wrangler secret put JWT_SECRET
   wrangler deploy
   ```

2. **Deploy Pages** (frontend):
   ```bash
   cd ..
   npm run build
   wrangler pages deploy out --project-name=travel-blog
   ```

3. **Configure Environment Variables**:
   - Set `NEXT_PUBLIC_AUTH_API_URL` in Pages settings to your Workers URL

**Estimated Setup Time**: 30 minutes  
**Cost**: Free (Cloudflare Free Tier)

### Test Credentials

For development and testing:

| Username | Password | Role |
|----------|----------|------|
| testuser | testpassword123 | Reader |
| testcontributor | testpassword123 | Contributor |

**⚠️ Important**: Change these credentials before production deployment!

## ⚙️ Configuration

### Static Export

The site is configured for static export in `next.config.mjs`:

```javascript
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
};
```

### TailwindCSS

Mobile-first breakpoints configured in `tailwind.config.ts`:

- `sm`: 640px (Mobile)
- `md`: 768px (Tablet)
- `lg`: 1024px (Desktop)
- `xl`: 1280px (Large Desktop)
- `2xl`: 1536px (Extra Large)

### TypeScript

Strict mode enabled with path aliases:
- `@/*` maps to `./src/*`

## 🧪 Testing & Quality

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

**Test Results**:
- ✅ 42/42 tests passing
- ✅ 57.83% overall coverage
- ✅ 80%+ coverage on critical authentication paths

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Security Audit

See **[SECURITY_AUDIT.md](./SECURITY_AUDIT.md)** for comprehensive security review.

**Security Features**:
- ✅ bcrypt password hashing (cost factor 10)
- ✅ JWT with HS256 signing
- ✅ HTTP-only, Secure, SameSite=Strict cookies
- ✅ Rate limiting (5 attempts, 15-min lockout)
- ✅ Generic error messages (no username enumeration)
- ✅ Input sanitization and validation
- ✅ Timing attack prevention

## 📝 Data Management

Currently using **embedded TypeScript constants** for data storage (no database/CMS required).

To modify content:
1. Edit files in `src/data/`
2. Follow TypeScript interfaces in `src/types/`
3. Rebuild the site

## 🎯 Performance Goals

- ⚡ Page load time: < 3 seconds
- 📊 Lighthouse score: 90+
- 📱 Fully responsive across all devices
- ♿ WCAG 2.1 Level AA accessibility

## 📄 License

Copyright © 2024 Travel Blog. All rights reserved.

## 🤝 Contributing

This is a personal travel blog. For suggestions or issues, please open a GitHub issue.

---

Built with ❤️ using [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [TailwindCSS](https://tailwindcss.com/)
