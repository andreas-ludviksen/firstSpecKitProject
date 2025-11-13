# Quickstart Guide: Modern Travel Blog Website

**Feature**: Modern Travel Blog Website  
**Date**: 2025-11-12  
**For**: Developers setting up the project for the first time

## Prerequisites

Before starting, ensure you have:

- **Node.js**: Version 18.17 or later ([Download](https://nodejs.org/))
- **npm**: Version 9.x or later (comes with Node.js)
- **Git**: For version control
- **Code Editor**: VS Code recommended (with extensions: ESLint, Prettier, Tailwind CSS IntelliSense)
- **Modern Browser**: Chrome, Firefox, Safari, or Edge (latest 2 versions)

**Verify installations**:
```bash
node --version    # Should show v18.17+
npm --version     # Should show 9.x+
git --version     # Any recent version
```

---

## Initial Setup

### 1. Clone Repository & Checkout Feature Branch

```bash
# Navigate to project directory
cd c:\git\speckit\firstSpecKitProject

# Ensure you're on the feature branch
git checkout 001-travel-blog-website

# Verify branch
git branch --show-current
# Should output: 001-travel-blog-website
```

---

### 2. Create Next.js Project

If the Next.js project doesn't exist yet, create it:

```bash
# Create Next.js app with TypeScript and TailwindCSS
npx create-next-app@14 travel-blog --typescript --tailwind --app --src-dir --import-alias "@/*"

# Navigate into project
cd travel-blog
```

**Options explained**:
- `--typescript`: Use TypeScript
- `--tailwind`: Include TailwindCSS
- `--app`: Use App Router (not Pages Router)
- `--src-dir`: Put code in `src/` directory
- `--import-alias "@/*"`: Enable `@/` path aliases

---

### 3. Install Dependencies

```bash
# Install required packages
npm install

# Install development dependencies
npm install --save-dev @testing-library/react @testing-library/jest-dom jest jest-environment-jsdom @playwright/test

# Optional: Helpful utilities
npm install clsx tailwind-merge
```

---

### 4. Configure for Static Export

Update `next.config.js`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  images: {
    unoptimized: true,  // Required for static export to non-Vercel hosts
  },
};

module.exports = nextConfig;
```

**Note**: If deploying to Vercel, you can remove `unoptimized: true` for better image optimization.

---

### 5. Set Up Project Structure

Create the directory structure:

```bash
# Create data directory
mkdir src\data

# Create types directory
mkdir src\types

# Create components directory (if not exists)
mkdir src\components

# Create tests directories
mkdir tests
mkdir tests\components
mkdir tests\e2e
```

---

### 6. Add Mock Data Files

Create the type definitions (`src/types/index.ts`):

```typescript
export interface TravelStory {
  id: number;
  destination: string;
  title: string;
  description: string;
  summary: string;
  images: string[];
  coverImage: string;
  date: string;
  duration: string;
  travelers: string[];
  tags: string[];
}

export interface HighlightPhoto {
  id: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  travelStoryId: number;
  destination: string;
  order: number;
}

export interface FamilyTip {
  id: number;
  category: TipCategory;
  title: string;
  description: string;
  icon?: string;
  order: number;
}

export enum TipCategory {
  PACKING = "Packing",
  ENTERTAINMENT = "Entertainment",
  SAFETY = "Safety",
  ACCOMMODATION = "Accommodation",
  FOOD = "Food & Dining",
  TRANSPORTATION = "Transportation",
  ACTIVITIES = "Activities",
  BUDGETING = "Budgeting"
}

export interface NavigationItem {
  label: string;
  href: string;
  order: number;
  isMobileVisible: boolean;
  isDesktopVisible: boolean;
}
```

Create sample data files (see `data-model.md` for complete examples):
- `src/data/travels.ts`
- `src/data/highlights.ts`
- `src/data/familyTips.ts`
- `src/data/navigation.ts`

---

### 7. Add Sample Images

Create image directories and add placeholder images:

```bash
# Create image directories
mkdir public\images
mkdir public\images\highlights
mkdir public\images\travels

# Add sample images (use free stock photos from Unsplash, Pexels, etc.)
# Name images descriptively: paris-eiffel.jpg, bali-beach.jpg, etc.
```

**Image requirements**:
- **Highlights**: 1920px wide, 3:2 ratio (e.g., 1920x1280)
- **Travel stories**: 1200px wide, 3:2 ratio (e.g., 1200x800)
- **Formats**: JPEG or PNG (Next.js will auto-convert to WebP/AVIF)
- **Optimization**: Compress images before adding (use ImageOptim, Squoosh, or TinyPNG)

**Free image sources**:
- [Unsplash](https://unsplash.com/) - Travel photos
- [Pexels](https://www.pexels.com/) - Free stock photos
- [Pixabay](https://pixabay.com/) - CC0 images

---

## Development Workflow

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Expected behavior**:
- Page loads instantly
- Hot reload on file changes
- TypeScript errors shown in terminal

---

### Build for Production

```bash
npm run build
```

**Output**: Static files in `out/` directory.

**Verify**:
- No build errors
- Check bundle size (should be < 500KB initial JS)
- Review build output for warnings

---

### Preview Production Build

```bash
# Build first
npm run build

# Serve static files locally
npx serve out
```

Open displayed URL (typically http://localhost:3000) to preview production build.

---

### Run Tests

```bash
# Run unit tests
npm test

# Run tests in watch mode (during development)
npm test -- --watch

# Run E2E tests
npx playwright test

# Run E2E tests in UI mode
npx playwright test --ui
```

---

## Code Quality Tools

### ESLint (Linting)

```bash
# Check for linting errors
npm run lint

# Auto-fix linting issues
npm run lint -- --fix
```

---

### Prettier (Code Formatting)

Install Prettier (if not included):

```bash
npm install --save-dev prettier
```

Create `.prettierrc.json`:

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

**VS Code**: Install Prettier extension and enable "Format on Save".

---

## Performance Optimization

### Lighthouse Audit

```bash
# Build production version
npm run build

# Serve locally
npx serve out

# Open Chrome DevTools > Lighthouse
# Run audit for Performance, Accessibility, Best Practices, SEO
```

**Target scores**:
- Performance: 90+
- Accessibility: 90+
- Best Practices: 90+
- SEO: 90+

---

### Bundle Analysis

```bash
# Install bundle analyzer
npm install --save-dev @next/bundle-analyzer

# Update next.config.js to wrap config
# (see Next.js bundle analyzer docs)

# Analyze bundle
ANALYZE=true npm run build
```

Opens visualization of bundle size in browser.

---

## Deployment

### Deploy to Vercel (Recommended)

1. **Push code to GitHub** (if not already)

2. **Import project on Vercel**:
   - Go to [vercel.com](https://vercel.com/)
   - Click "Import Project"
   - Select your repository
   - Vercel auto-detects Next.js

3. **Configure** (if needed):
   - Root directory: `travel-blog/` (or wherever your Next.js app is)
   - No environment variables needed

4. **Deploy**:
   - Vercel builds and deploys automatically
   - Each push to branch triggers new deployment

**URL**: `https://your-project.vercel.app`

---

### Deploy to Netlify

1. **Build command**: `npm run build`
2. **Publish directory**: `out`
3. **Node version**: 18 or later

**`netlify.toml`** (optional):
```toml
[build]
  command = "npm run build"
  publish = "out"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Deploy to GitHub Pages

1. **Update `next.config.js`**:
```javascript
const nextConfig = {
  output: 'export',
  basePath: '/travel-blog',  // Replace with your repo name
  images: { unoptimized: true },
};
```

2. **Build and deploy**:
```bash
npm run build
git add out -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix out origin gh-pages
```

3. **Enable GitHub Pages**:
   - Repo Settings > Pages
   - Source: `gh-pages` branch

**URL**: `https://yourusername.github.io/travel-blog/`

---

## Troubleshooting

### Build Errors

**Error**: `Module not found: Can't resolve '@/...'`  
**Solution**: Verify `tsconfig.json` has correct path mapping:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Error**: `Image optimization requires 'sharp'`  
**Solution**: Install sharp: `npm install sharp` (dev dependency)

---

### Performance Issues

**Slow page loads**:
- Check image sizes (compress large images)
- Verify lazy loading is enabled (default for next/image)
- Run Lighthouse audit to identify bottlenecks

**Large bundle size**:
- Run bundle analyzer
- Remove unused dependencies
- Check for duplicate packages (use `npm dedupe`)

---

### Development Server Issues

**Port already in use**:
```bash
# Run on different port
npm run dev -- -p 3001
```

**Hot reload not working**:
- Restart dev server
- Clear `.next` cache: `rm -rf .next` (or `rmdir /s .next` on Windows)

---

## Development Tips

1. **Use TypeScript autocomplete**: Let VS Code IntelliSense guide you
2. **Commit often**: Small, focused commits are easier to review
3. **Test as you build**: Write component tests alongside components
4. **Check mobile first**: Use Chrome DevTools device emulation
5. **Run Lighthouse regularly**: Catch performance regressions early
6. **Review accessibility**: Test keyboard navigation frequently

---

## Next Steps

1. ✅ **Setup complete** - Development environment ready
2. 📄 **Implement pages** - Start with landing page (highest priority)
3. 🧩 **Build components** - Create Navigation, HighlightPhoto components
4. 📊 **Add mock data** - Populate data files with 8 travel stories
5. 🧪 **Write tests** - Test each component as you build
6. 🎨 **Refine styling** - Polish design for "sleek, modern" look
7. 🚀 **Deploy** - Push to Vercel/Netlify for preview

---

## Helpful Resources

- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **TailwindCSS Docs**: [tailwindcss.com/docs](https://tailwindcss.com/docs)
- **React Testing Library**: [testing-library.com/react](https://testing-library.com/react)
- **Playwright Docs**: [playwright.dev](https://playwright.dev)
- **TypeScript Handbook**: [typescriptlang.org/docs](https://www.typescriptlang.org/docs)

---

## Support

If you encounter issues:

1. Check this quickstart guide
2. Review `research.md` for technical decisions
3. Check `data-model.md` for data structure details
4. Review `contracts/components.md` for component interfaces
5. Consult Next.js/TailwindCSS documentation

**Ready to build!** 🚀
