# Static Web App Constitution

## Core Principles

### I. Static-First Architecture
All content must be deliverable as static files (HTML, CSS, JavaScript, assets). No server-side rendering or backend required for core functionality. Build process generates deployable static files.

### II. Performance Standards
Pages must load in under 3 seconds on standard broadband. Optimize assets: minify CSS/JS, compress images, lazy-load non-critical resources. Lighthouse performance score target: 90+.

### III. Responsive Design (NON-NEGOTIABLE)
All pages must be fully responsive and accessible on mobile, tablet, and desktop. Mobile-first approach mandatory. Test on common viewports (320px, 768px, 1024px, 1920px).

### IV. Browser Compatibility
Support latest two versions of Chrome, Firefox, Safari, and Edge. Graceful degradation for older browsers. No reliance on experimental/non-standard features without polyfills.

### V. Build and Deployment
Automated build process required. Version all releases. Support for static hosting (GitHub Pages, Netlify, Vercel, S3, etc.). Environment-specific configuration must be build-time injected.

## Technology Constraints

- HTML5 semantic markup required
- CSS: Modern standards (Flexbox/Grid); preprocessors optional but must compile to standard CSS
- JavaScript: ES6+ with transpilation for compatibility
- No backend dependencies for core features
- External APIs allowed via client-side fetch only
- All dependencies must be versioned and documented

## Development Workflow

- Version control (Git) mandatory
- Branch protection: main/production branch requires review
- Build must succeed before deployment
- Asset optimization automated in build pipeline
- Local development server for testing
- No sensitive data or secrets in static files

## Governance

This constitution defines the non-negotiable standards for the static web app. All features and changes must comply with these principles. Deviations require documented justification and approval. Complexity must serve user needs, not developer convenience.

**Version**: 1.0.0 | **Ratified**: 2025-11-12 | **Last Amended**: 2025-11-12
