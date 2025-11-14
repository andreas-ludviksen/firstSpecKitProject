# Research & Architecture Decisions

**Feature**: Modular Blog Posts with Interchangeable Design Templates  
**Date**: 2025-11-14  
**Phase**: 0 - Research & Decision Making

## Overview

This document resolves all "NEEDS CLARIFICATION" items from the technical context and establishes architecture decisions for media storage, external integrations, and rendering strategies.

---

## 1. Video Storage & Delivery: Cloudflare Stream vs R2

### Decision: **Cloudflare R2 + Direct Video Hosting**

### Rationale

**Cloudflare Stream**:
- ✅ Purpose-built video platform with HLS/DASH adaptive streaming
- ✅ Automatic transcoding, thumbnail generation, analytics
- ✅ Easy embedding with player SDK
- ❌ Cost: $5 per 1,000 minutes stored + $1 per 1,000 minutes delivered
- ❌ Vendor lock-in to Cloudflare's video format/API
- ❌ Overkill for family blog with low traffic

**Cloudflare R2**:
- ✅ S3-compatible object storage: $0.015/GB-month (no egress fees)
- ✅ Direct video file hosting (MP4) - works with native HTML5 `<video>` tag
- ✅ Significantly cheaper for low-volume family blog
- ✅ No lock-in - videos are standard MP4 files
- ❌ No automatic transcoding (videos must be web-compatible format)
- ❌ No adaptive streaming (single bitrate delivery)

**For this use case** (family travel blog, GoPro videos):
- Expected volume: 1-5 videos per month (~100 videos/year)
- Average video size: 100-500MB (GoPro 1080p/4K)
- Expected traffic: <1000 views/month (friends and family)
- **Cost comparison**: Stream ~$60/year vs R2 ~$1/year

### Alternatives Considered

1. **YouTube/Vimeo Embedding**: 
   - Free/low-cost, but content not owned, embedding limitations, ads on free tier
   - Rejected: User wants control over content and presentation

2. **Self-hosted video (R2)**:
   - Maximum control, very low cost
   - **Selected**: Best fit for budget and use case

### Implementation Notes

- Store videos in R2 bucket: `blog-media/videos/{postId}/{videoId}.mp4`
- Use Cloudflare CDN for delivery (automatic with R2 public bucket)
- Require videos in web-compatible format (H.264/MP4) - document in upload UX
- Optionally: Add client-side video compression/format detection before upload
- For GoPro videos: Export to MP4 before upload (or build converter in Workers if needed later)

### Cost/Limits

- Cloudflare R2 Free Tier: 10 GB storage/month
- Paid: $0.015/GB-month storage (no egress fees on Cloudflare network)
- Expected: ~50 videos × 300MB = 15GB = ~$0.23/month
- Well within budget constraints

---

## 2. Photo Storage & Optimization: Cloudflare Images vs R2

### Decision: **Cloudflare Images (Flexible Variants)**

### Rationale

**Cloudflare Images**:
- ✅ Automatic optimization, resizing, format conversion (WebP/AVIF)
- ✅ Flexible variants (thumbnail, medium, large) with single URL
- ✅ Direct upload API + transform on-the-fly via URL parameters
- ✅ Pricing: $5/month for 100,000 images stored + $1/100,000 images delivered
- ✅ Perfect for responsive design templates (different sizes per template)
- ❌ Cost higher than raw R2 storage

**Cloudflare R2 + Manual Optimization**:
- ✅ Cheapest option (~$0.015/GB-month)
- ❌ Requires manual image processing (sharp/jimp in Workers or build-time)
- ❌ Need to generate/store multiple variants manually (1x, 2x, thumbnails)
- ❌ More complex implementation, higher maintenance
- ❌ Slower delivery without CDN optimization

**For this use case** (Apple Photos, high-res images, responsive templates):
- Expected volume: 5-10 photos per post, ~50 posts/year = ~500 photos/year
- Average source size: 3-8MB (iPhone HEIC/JPEG)
- Need multiple variants for responsive design (thumbnail, mobile, desktop, 2x)
- **Cost comparison**: Images $5/month (covers 100k images) vs R2 $0.05/month + dev time for variants

### Alternatives Considered

1. **R2 + Sharp.js in Workers**:
   - Cheaper storage but higher complexity
   - Rejected: Developer time > $5/month savings; Images API is simpler

2. **next/image with R2**:
   - Next.js Image Optimization works with external URLs
   - Rejected: Static export doesn't support next/image optimization server

3. **Cloudflare Images**:
   - **Selected**: Best balance of cost, simplicity, and responsive image features

### Implementation Notes

- Upload to Cloudflare Images via direct upload API
- Store image ID in database, generate URLs with variants:
  - `https://imagedelivery.net/{account}/{imageId}/thumbnail` (200x200)
  - `https://imagedelivery.net/{account}/{imageId}/mobile` (800x600)
  - `https://imagedelivery.net/{account}/{imageId}/desktop` (1920x1080)
- Define variants in Cloudflare Images dashboard per design template needs
- Support HEIC uploads (Images converts automatically)
- Alt text and captions stored in D1 database (not in Images metadata)

### Cost/Limits

- Cloudflare Images: $5/month up to 100,000 images (family blog will never hit this)
- Delivery: $1 per 100,000 requests (free tier covers low traffic)
- Expected: ~500 images/year × $5/month = $5/month (well within budget)

---

## 3. Apple Photos Integration

### Decision: **Manual Export Workflow with Future iCloud Sync Option**

### Rationale

**iCloud Photos API**:
- ❌ Requires Apple Developer account ($99/year)
- ❌ Complex OAuth flow, token management
- ❌ API limited to apps (not web apps without app)
- ❌ Over-engineered for "select photos" use case

**PhotoKit (iOS/macOS App)**:
- ✅ Native access to Photos library
- ❌ Requires building native app (Swift/SwiftUI)
- ❌ Not accessible from web browser
- ❌ Out of scope for current project

**Manual Export + Web Upload**:
- ✅ Simple: User exports photos from Apple Photos → uploads to blog
- ✅ Works immediately, no API complexity
- ✅ User retains full control over which photos to share
- ✅ Standard web file upload (drag-and-drop, file picker)
- ❌ Extra manual step (export from Photos first)

**For this use case** (family blog, occasional posts):
- User workflow: Select photos in Apple Photos → Export → Upload to blog
- Frequency: 1-4 times/month (not daily)
- Photos already organized in Apple Photos albums
- **Simplicity wins**: Manual export acceptable for low frequency

### Alternatives Considered

1. **iCloud Photos Web API**:
   - Rejected: Requires Apple Developer account, complex OAuth

2. **Third-party sync services (Zapier/IFTTT)**:
   - Rejected: Ongoing subscription costs, limited control

3. **Manual export workflow**:
   - **Selected**: Simple, free, user-controlled, works today

### Implementation Notes

**Phase 1 (MVP - Manual)**:
- Web upload interface with drag-and-drop
- Support HEIC format (Cloudflare Images converts automatically)
- Batch upload up to 50 photos at once
- Show upload progress for each photo
- Document workflow: "Export from Apple Photos → Upload here"

**Phase 2 (Future Enhancement - Optional)**:
- Consider iOS Shortcuts integration (no app needed, free)
- Shortcut: Select photos → Share → Run shortcut → Auto-upload to blog
- Uses Cloudflare Workers API with auth token

### Cost/Limits

- Phase 1: Free (web upload only)
- Phase 2: Free (iOS Shortcuts uses existing Workers API)
- No ongoing API costs

---

## 4. GoPro Cloud Integration

### Decision: **Manual Download + Upload Workflow (Phase 1), Evaluate GoPro API for Phase 2**

### Rationale

**GoPro Plus API**:
- ⚠️ **Needs verification**: GoPro Plus API availability (not publicly documented)
- ✅ If available: Direct sync from GoPro Cloud
- ❌ Requires GoPro Plus subscription ($49.99/year)
- ❌ API documentation unclear (may not exist for third-party access)

**Manual Download + Upload**:
- ✅ Works immediately without API research
- ✅ User downloads video from GoPro Cloud → uploads to blog
- ✅ No additional subscription required
- ❌ Extra manual step

**For this use case** (GoPro videos, occasional uploads):
- Frequency: 1-3 videos per post, 1-2 posts/month
- GoPro Cloud already stores videos
- **Pragmatic approach**: Start with manual workflow, evaluate API if painful

### Alternatives Considered

1. **GoPro Plus API (if exists)**:
   - Deferred: Needs API documentation research
   - May not be available for third-party integrations

2. **Manual download + upload**:
   - **Selected for Phase 1**: Simple, works today, no API dependency

3. **Email-to-upload (future)**:
   - Share video from GoPro app → Email → Magic email address → Auto-upload
   - Possible future enhancement

### Implementation Notes

**Phase 1 (MVP)**:
- Web upload interface accepts MP4 videos up to 500MB
- Document workflow: "Download from GoPro Cloud → Upload here"
- Support drag-and-drop video upload
- Show progress bar for large uploads
- Accept common video formats: MP4, MOV (convert MOV to MP4 if needed)

**Phase 2 (Research Required)**:
- Research GoPro Plus API availability and documentation
- If API exists: Build direct sync integration
- If not: Consider alternative workflows (email, webhooks, IFTTT)

**Video Format Handling**:
- GoPro videos are typically H.264/H.265 MP4
- Workers can validate format and reject unsupported codecs
- Optionally: Add client-side compression before upload (Web API)

### Cost/Limits

- Phase 1: Free (manual upload)
- Phase 2: TBD based on GoPro API research
- R2 storage costs covered in Decision #1 (~$0.23/month for 50 videos)

---

## 5. Content-Template Rendering Strategy

### Decision: **React Component-Based Templates with Static Generation**

### Rationale

**React Component Templates**:
- ✅ Each design template = React component
- ✅ Receives blog post data as props
- ✅ Renders content according to template layout rules
- ✅ Type-safe with TypeScript interfaces
- ✅ Testable with React Testing Library
- ✅ Works with Next.js static export

**Template Engine (Handlebars/Mustache)**:
- ❌ String-based, less type safety
- ❌ Harder to test complex layouts
- ❌ Doesn't leverage existing React ecosystem

**Component-Based Approach**:
```tsx
// Example template structure
interface TemplateProps {
  post: BlogPost;
  photos: PhotoContent[];
  videos: VideoContent[];
  text: TextContent[];
}

const Template01: React.FC<TemplateProps> = ({ post, photos, videos, text }) => {
  const displayPhotos = photos.slice(0, 10); // FR-017: Template limits
  return (
    <div className="grid grid-cols-2 gap-4">
      {displayPhotos.map(photo => <img key={photo.id} src={photo.url} />)}
      {/* Placeholders for missing photos (FR-016) */}
      {displayPhotos.length < 10 && <PlaceholderImages count={10 - displayPhotos.length} />}
    </div>
  );
};
```

### Alternatives Considered

1. **Template Engine (Handlebars)**:
   - Rejected: Less type safety, harder to integrate with React/Next.js

2. **CSS-only layout switching**:
   - Rejected: Doesn't handle content overflow/underflow logic (FR-016, FR-017)

3. **React Components**:
   - **Selected**: Type-safe, testable, integrates with Next.js, handles FR-016/FR-017 logic

### Implementation Notes

**Template Structure**:
- 10 template components: `Template01.tsx` through `Template10.tsx`
- Each exports: component, metadata (name, description, maxPhotos, maxVideos)
- Template registry: `design-templates.ts` maps template IDs to components

**Static Generation**:
- Blog posts generated at build time with `getStaticProps` (or runtime if dynamic)
- Template component imported dynamically based on post.designTemplateId
- Content fetched from D1 database (or JSON for static)
- Rendered to static HTML

**Template Switching**:
- When template changes: Regenerate post with new template component
- Content data unchanged, only presentation changes
- Build-time regeneration OR client-side re-render (both work with static export)

**Content Overflow/Underflow**:
- FR-016: Placeholders implemented as `<PlaceholderImage />` component
- FR-017: Array slicing in template component: `photos.slice(0, maxPhotos)`

### Cost/Limits

- No additional costs (uses existing Next.js/React stack)
- Build time may increase with more posts (regenerate all on template change)
- Mitigation: Incremental Static Regeneration (ISR) if needed (requires server mode, not static export)

---

## Architecture Summary

### Media Storage Stack

```
┌─────────────────┐
│ Apple Photos    │──Export──┐
└─────────────────┘          │
                             │
┌─────────────────┐          │         ┌──────────────────┐
│ GoPro Cloud     │──Download┼────────>│ Web Upload Form  │
└─────────────────┘          │         └──────────────────┘
                             │                  │
                             │                  │ POST /api/media/upload
                             │                  ▼
                             │         ┌──────────────────┐
                             │         │ Cloudflare Worker│
                             │         └──────────────────┘
                             │                  │
                             │         ┌────────┴─────────┐
                             │         │                  │
                             │         ▼                  ▼
                        ┌─────────────────┐    ┌──────────────────┐
                        │ Cloudflare Images│    │ Cloudflare R2    │
                        │ (Photos)         │    │ (Videos)         │
                        └─────────────────┘    └──────────────────┘
                                  │                      │
                                  └──────────┬───────────┘
                                             │
                                             ▼
                                  ┌──────────────────┐
                                  │ Blog Post Display│
                                  │ (Static HTML)    │
                                  └──────────────────┘
```

### Design Template Rendering

```
┌──────────────┐       ┌─────────────────┐       ┌──────────────┐
│ BlogPost     │──────>│ TemplateSelector│──────>│ Template03   │
│ (D1 Data)    │       │ (React)         │       │ Component    │
└──────────────┘       └─────────────────┘       └──────────────┘
      │                                                  │
      │                                                  │
      ▼                                                  ▼
┌──────────────┐                               ┌──────────────┐
│ PhotoContent │                               │ Rendered HTML│
│ VideoContent │───────────────────────────────>│ (Static)     │
│ TextContent  │                               └──────────────┘
└──────────────┘
```

### Technology Stack Summary

| Component | Technology | Cost |
|-----------|-----------|------|
| Photos | Cloudflare Images | $5/month (100k images) |
| Videos | Cloudflare R2 | ~$0.23/month (15GB) |
| Database | Cloudflare D1 | Free tier (5GB) |
| Upload API | Cloudflare Workers | Free tier (100k req/day) |
| Frontend | Next.js 14 Static Export | Free (Cloudflare Pages) |
| Templates | React Components | Free |
| **Total** | | **~$5.25/month** |

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| Cloudflare Images quota exceeded | Low | Medium | Monitor usage, alert at 80% quota |
| Large video uploads timeout | Medium | Medium | Implement chunked upload, progress UI |
| HEIC format not supported in older browsers | Low | Low | Cloudflare Images converts to JPEG/WebP |
| Manual export workflow too cumbersome | Medium | Low | Phase 2: Add iOS Shortcuts integration |
| Video format incompatibility | Low | Medium | Validate format in upload UI, provide conversion guidance |

---

## Next Steps

1. ✅ Research complete
2. → Proceed to Phase 1: Design & Contracts
   - Create data-model.md with entities
   - Define API contracts for upload/CRUD operations
   - Generate quickstart.md for contributor workflow
   - Update agent context with chosen technologies
