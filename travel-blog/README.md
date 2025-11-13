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
│   │   ├── page.tsx      # Landing page
│   │   └── globals.css   # Global styles
│   ├── components/       # React components
│   │   ├── Navigation.tsx
│   │   └── HighlightPhotoCard.tsx
│   ├── data/             # Mock data (embedded storage)
│   │   ├── travels.ts    # 8 travel stories
│   │   ├── highlights.ts # 5 highlight photos
│   │   ├── familyTips.ts # 12 family tips
│   │   └── navigation.ts # Navigation menu items
│   └── types/            # TypeScript type definitions
│       └── index.ts
├── public/
│   └── images/           # Static images
│       ├── highlights/   # 5 highlight photos
│       └── travels/      # 8 travel story images
├── next.config.mjs       # Next.js configuration (static export)
├── tailwind.config.ts    # TailwindCSS configuration
└── tsconfig.json         # TypeScript configuration
```

## 🛠️ Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Create production build (static export) |
| `npm run start` | Start production server (not applicable for static export) |
| `npm run lint` | Run ESLint to check code quality |

## 🎨 Features

### Current Implementation (MVP)

- ✅ **Landing Page** - Hero section with 5 featured highlight photos
- ✅ **Responsive Design** - Mobile-first approach with breakpoints at 640px, 768px, 1024px
- ✅ **Interactive Photo Grid** - Hover effects with image zoom and overlay details
- ✅ **Navigation** - Header with active route highlighting
- ✅ **Static Export** - No server required, deploy anywhere

### Coming Soon

- 🚧 **Travels Page** - Browse all 8 travel stories with filtering
- 🚧 **Family Tips Page** - 12 practical tips organized by category
- 🚧 **Image Optimization** - WebP/AVIF support with lazy loading
- 🚧 **SEO Optimization** - Meta tags and Open Graph support

## 🌐 Deployment

This site is configured for static export and can be deployed to:

### Vercel (Recommended)

```bash
npm install -g vercel
vercel deploy
```

### Netlify

```bash
# Drag and drop the 'out/' folder to Netlify
# Or connect your Git repository
```

### GitHub Pages

```bash
# Build the site
npm run build

# The 'out/' directory contains your static site
# Push to gh-pages branch or configure GitHub Pages source
```

### Any Static Host

Simply upload the contents of the `out/` directory to your web server.

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

## 🧪 Code Quality

### Linting

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

### Formatting

```bash
# Format code with Prettier
npx prettier --write .
```

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
