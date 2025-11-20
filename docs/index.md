---
layout: default
title: Home
nav_order: 1
description: "Travel Bloggg - Family Adventures Around the World"
permalink: /
---

# Travel Blog
{: .fs-9 }

A modern, static travel blog showcasing family adventures around the world !
{: .fs-6 .fw-300 }

[View on GitHub](https://github.com/andreas-ludviksen/firstSpecKitProject){: .btn .btn-primary .fs-5 .mb-4 .mb-md-0 .mr-2 }
[Quick Start](quickstart){: .btn .fs-5 .mb-4 .mb-md-0 }

---

## What is This Project?

This is a **production-ready static travel blog** built using **Spec-Driven Development** methodology with the GitHub Spec Kit. The project demonstrates how specifications can drive the entire development process, from initial requirements to working implementation.

### Key Features

- 📸 **Stunning Photo Galleries** - Showcase travel highlights with responsive image grids
- 🌍 **Travel Stories** - Detailed narratives from 8+ destinations worldwide
- 👨‍👩‍👧‍👦 **Family Tips** - Practical advice for traveling with children
- 🚀 **Static Export** - No server required, deploy anywhere
- ⚡ **Performance** - Sub-3 second page loads with Lighthouse 90+ scores
- 📱 **Fully Responsive** - Mobile-first design from 320px to 4K displays

## Technology Stack

Built with modern web technologies:

- **Next.js 14** - App Router with static export
- **TypeScript 5** - Type-safe development
- **React 18** - Server and client components
- **TailwindCSS 3** - Utility-first styling with mobile-first breakpoints
- **Embedded Data** - No database or CMS required

## Development Approach

This project was built using **Spec-Driven Development**:

1. **Specification First** - Define requirements and user stories before code
2. **Technical Planning** - Choose technology stack and architecture
3. **Task Breakdown** - Create actionable, independent implementation tasks
4. **Iterative Implementation** - Build MVP, then enhance with additional features

### Spec-Driven Benefits

✅ Clear requirements before coding  
✅ Reduced rework and technical debt  
✅ Faster onboarding for new contributors  
✅ Living documentation that stays current  
✅ Technology-agnostic approach

## Project Structure

```
firstSpecKitProject/
├── .specify/              # Spec Kit configuration
│   └── memory/           # Project constitution
├── specs/                # Feature specifications
│   └── 001-travel-blog-website/
│       ├── spec.md       # Requirements & user stories
│       ├── plan.md       # Technical implementation plan
│       ├── tasks.md      # Task breakdown (60 tasks)
│       ├── data-model.md # Entity schemas
│       └── contracts/    # Component interfaces
├── travel-blog/          # Next.js application
│   ├── src/
│   │   ├── app/         # Pages (App Router)
│   │   ├── components/  # React components
│   │   ├── data/        # Mock data
│   │   └── types/       # TypeScript definitions
│   └── public/          # Static assets
└── docs/                # Documentation (this site)
```

## Getting Started

### Quick Start

```bash
# Clone the repository
git clone https://github.com/andreas-ludviksen/firstSpecKitProject.git
cd firstSpecKitProject/travel-blog

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the site.

### Build for Production

```bash
# Create static export
npm run build

# Preview production build
npx serve out
```

The `out/` directory contains your deployable static site.

## Documentation

- [Quick Start Guide](quickstart) - Get up and running in 5 minutes
- [Architecture](architecture) - System design and technical decisions
- [Development Guide](development) - Contributing and local development
- [Deployment](deployment) - Deploy to Vercel, Netlify, or GitHub Pages

## Live Demo

The travel blog is deployed and accessible at:

🌐 **[View Live Site](#)** *(Update with your deployment URL)*

## Contributing

This project serves as a reference implementation for Spec-Driven Development. For contributions:

1. Review the [feature specification](https://github.com/andreas-ludviksen/firstSpecKitProject/blob/main/specs/001-travel-blog-website/spec.md)
2. Check the [task breakdown](https://github.com/andreas-ludviksen/firstSpecKitProject/blob/main/specs/001-travel-blog-website/tasks.md)
3. Follow the development workflow in the [contribution guide](development#contributing)

## License

Copyright © 2024 Travel Blog. All rights reserved.

---

Built with ❤️ using [Next.js](https://nextjs.org/), [TypeScript](https://www.typescriptlang.org/), and [TailwindCSS](https://tailwindcss.com/)
