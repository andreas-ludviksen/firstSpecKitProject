# Data Model

**Feature**: Modular Blog Posts with Interchangeable Design Templates  
**Date**: 2025-11-14  
**Phase**: 1 - Design

## Overview

This data model supports modular blog posts where content (photos, videos, text) is stored separately from design templates, enabling template changes without content modification (FR-001, FR-009).

---

## Core Entities

### BlogPost

Represents a published or draft blog post article.

**Fields**:
- `id` (string, UUID): Unique identifier
- `slug` (string, unique): URL-friendly identifier (e.g., "family-trip-norway-2024")
- `title` (string, max 200 chars): Post title
- `authorId` (string, FK → Contributor): Creator of the post
- `designTemplateId` (string, FK → DesignTemplate): Currently selected template
- `status` (enum: 'draft' | 'published'): Publication state
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last modification timestamp
- `publishedAt` (datetime, nullable): Publication timestamp
- `version` (integer): Optimistic concurrency version (for FR-018 last-save-wins)

**Relationships**:
- 1:N with PhotoContent (one post has many photos)
- 1:N with VideoContent (one post has many videos)
- 1:N with TextContent (one post has many text sections)
- N:1 with DesignTemplate (current template)
- 1:N with PostTemplateHistory (audit trail)

**Indexes**:
- Primary key: `id`
- Unique: `slug`
- Index: `authorId`, `status`, `publishedAt` (for queries)

**Validation Rules**:
- FR-016: No minimum content requirement (allow publishing with 0 photos/videos)
- Slug must be unique and URL-safe (lowercase, hyphens only)
- Title required, non-empty
- Template ID must reference valid DesignTemplate

**Example**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "norway-fjords-adventure",
  "title": "Our Amazing Norwegian Fjords Adventure",
  "authorId": "user-123",
  "designTemplateId": "template-03",
  "status": "published",
  "createdAt": "2025-11-14T10:00:00Z",
  "updatedAt": "2025-11-14T15:30:00Z",
  "publishedAt": "2025-11-14T15:30:00Z",
  "version": 3
}
```

---

### DesignTemplate

Defines a visual layout and presentation rules for blog posts.

**Fields**:
- `id` (string): Unique identifier (e.g., "template-01")
- `name` (string): Display name (e.g., "Classic Grid")
- `description` (string): Template description for contributors
- `component` (string): React component name (e.g., "Template01")
- `maxPhotos` (integer): Maximum photos displayed (FR-017)
- `maxVideos` (integer): Maximum videos displayed (FR-017)
- `requiredTextSections` (array<string>): Required text section names (e.g., ["intro", "conclusion"])
- `previewImageUrl` (string): Thumbnail for template gallery (User Story 3)
- `gridLayout` (enum: 'masonry' | 'grid-2col' | 'grid-3col' | 'single-column'): Layout type
- `createdAt` (datetime): Creation timestamp
- `isActive` (boolean): Whether template is available for selection

**Relationships**:
- 1:N with BlogPost (one template used by many posts)

**Indexes**:
- Primary key: `id`
- Index: `isActive` (for active template queries)

**Validation Rules**:
- FR-002: Approximately 10 templates total
- Only administrators can create/modify templates (enforced at API level)
- Component name must match existing React component file

**Example**:
```json
{
  "id": "template-03",
  "name": "Photo Grid Showcase",
  "description": "Highlights photos in a 3-column responsive grid with video sidebar",
  "component": "Template03",
  "maxPhotos": 12,
  "maxVideos": 2,
  "requiredTextSections": ["intro"],
  "previewImageUrl": "https://imagedelivery.net/account/template-03-preview/public",
  "gridLayout": "grid-3col",
  "createdAt": "2025-11-01T00:00:00Z",
  "isActive": true
}
```

---

### PhotoContent

Represents an individual photo in a blog post.

**Fields**:
- `id` (string, UUID): Unique identifier
- `postId` (string, FK → BlogPost): Associated blog post
- `url` (string): Full image URL (Cloudflare Images delivery URL)
- `cloudflareImageId` (string): Cloudflare Images ID for variant generation
- `caption` (string, max 500 chars, nullable): Photo caption
- `altText` (string, max 200 chars): Accessibility alt text
- `displayOrder` (integer): Sort order within post (0-indexed)
- `source` (enum: 'upload' | 'apple-photos' | 'external-url'): Origin of photo
- `originalFilename` (string, nullable): Original filename from upload
- `uploadedAt` (datetime): Upload timestamp
- `width` (integer, nullable): Original image width in pixels
- `height` (integer, nullable): Original image height in pixels

**Relationships**:
- N:1 with BlogPost (many photos belong to one post)

**Indexes**:
- Primary key: `id`
- Index: `postId`, `displayOrder` (for ordered queries)

**Validation Rules**:
- URL must be valid HTTPS URL
- Display order must be unique within same postId
- Alt text required for accessibility

**Image Variants** (Cloudflare Images):
- Thumbnail: 200x200 (cropped square)
- Mobile: 800x600 (max dimensions, maintain aspect ratio)
- Desktop: 1920x1080 (max dimensions, maintain aspect ratio)
- Original: Full resolution (for downloads)

**Example**:
```json
{
  "id": "photo-001",
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://imagedelivery.net/account/abc123def/desktop",
  "cloudflareImageId": "abc123def",
  "caption": "Stunning view of Geirangerfjord at sunset",
  "altText": "Aerial view of blue fjord surrounded by green mountains",
  "displayOrder": 0,
  "source": "apple-photos",
  "originalFilename": "IMG_5432.HEIC",
  "uploadedAt": "2025-11-14T10:15:00Z",
  "width": 4032,
  "height": 3024
}
```

---

### VideoContent

Represents an individual video in a blog post.

**Fields**:
- `id` (string, UUID): Unique identifier
- `postId` (string, FK → BlogPost): Associated blog post
- `url` (string): Full video URL (R2 public URL)
- `r2Key` (string): R2 object key (e.g., "videos/{postId}/{videoId}.mp4")
- `caption` (string, max 500 chars, nullable): Video caption
- `displayOrder` (integer): Sort order within post (0-indexed)
- `source` (enum: 'upload' | 'gopro-cloud' | 'external-url'): Origin of video
- `originalFilename` (string, nullable): Original filename from upload
- `uploadedAt` (datetime): Upload timestamp
- `durationSeconds` (integer, nullable): Video duration in seconds
- `fileSizeMB` (float, nullable): File size in megabytes
- `format` (string, nullable): Video format (e.g., "mp4", "mov")
- `thumbnailUrl` (string, nullable): Video thumbnail/poster image URL

**Relationships**:
- N:1 with BlogPost (many videos belong to one post)

**Indexes**:
- Primary key: `id`
- Index: `postId`, `displayOrder` (for ordered queries)

**Validation Rules**:
- URL must be valid HTTPS URL
- Display order must be unique within same postId
- Format must be web-compatible (mp4 preferred)
- Max file size: 500MB (enforced at upload)

**Example**:
```json
{
  "id": "video-001",
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "url": "https://pub-bucket.r2.dev/videos/550e8400/video-001.mp4",
  "r2Key": "videos/550e8400-e29b-41d4-a716-446655440000/video-001.mp4",
  "caption": "Kayaking through the narrow fjord channels",
  "displayOrder": 0,
  "source": "gopro-cloud",
  "originalFilename": "GX010245.MP4",
  "uploadedAt": "2025-11-14T10:20:00Z",
  "durationSeconds": 127,
  "fileSizeMB": 245.3,
  "format": "mp4",
  "thumbnailUrl": "https://pub-bucket.r2.dev/videos/550e8400/video-001-thumb.jpg"
}
```

---

### TextContent

Represents a text section in a blog post.

**Fields**:
- `id` (string, UUID): Unique identifier
- `postId` (string, FK → BlogPost): Associated blog post
- `sectionName` (string): Section identifier (e.g., "intro", "day1", "conclusion")
- `content` (text): Formatted text content (Markdown or HTML)
- `format` (enum: 'markdown' | 'html' | 'plaintext'): Content format
- `displayOrder` (integer): Sort order within post (0-indexed)
- `createdAt` (datetime): Creation timestamp
- `updatedAt` (datetime): Last modification timestamp

**Relationships**:
- N:1 with BlogPost (many text sections belong to one post)

**Indexes**:
- Primary key: `id`
- Index: `postId`, `displayOrder` (for ordered queries)

**Validation Rules**:
- Section name required (for template rendering)
- Content can be empty (for placeholders)
- Display order must be unique within same postId

**Example**:
```json
{
  "id": "text-001",
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "sectionName": "intro",
  "content": "## Our Norwegian Adventure\n\nIn June 2025, we embarked on an incredible journey...",
  "format": "markdown",
  "displayOrder": 0,
  "createdAt": "2025-11-14T10:10:00Z",
  "updatedAt": "2025-11-14T10:25:00Z"
}
```

---

### PostTemplateHistory

Audit trail for design template changes (supports User Story 2 acceptance scenario 3).

**Fields**:
- `id` (string, UUID): Unique identifier
- `postId` (string, FK → BlogPost): Associated blog post
- `templateId` (string, FK → DesignTemplate): Template applied
- `changedAt` (datetime): When template was changed
- `changedBy` (string, FK → Contributor): Who made the change
- `previousTemplateId` (string, nullable): Previous template ID

**Relationships**:
- N:1 with BlogPost (many history records per post)

**Indexes**:
- Primary key: `id`
- Index: `postId`, `changedAt` (for chronological queries)

**Example**:
```json
{
  "id": "history-001",
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "templateId": "template-05",
  "changedAt": "2025-11-14T15:30:00Z",
  "changedBy": "user-123",
  "previousTemplateId": "template-03"
}
```

---

## Entity Relationships Diagram

```
┌─────────────────┐
│   Contributor   │
│   (from 003)    │
└────────┬────────┘
         │ 1:N
         │
         ▼
┌─────────────────┐       N:1      ┌──────────────────┐
│    BlogPost     │◄────────────────│ DesignTemplate   │
│                 │                 │  (admin-managed) │
└────────┬────────┘                 └──────────────────┘
         │
         │ 1:N
    ┌────┴────┬────────────┬────────────┐
    │         │            │            │
    ▼         ▼            ▼            ▼
┌─────────┐ ┌──────────┐ ┌──────────┐ ┌────────────────┐
│  Photo  │ │  Video   │ │   Text   │ │ TemplateHistory│
│ Content │ │ Content  │ │ Content  │ │                │
└─────────┘ └──────────┘ └──────────┘ └────────────────┘
```

---

## State Transitions

### BlogPost Status

```
┌───────┐
│ draft │ ──publish──> ┌───────────┐
└───────┘              │ published │
    ▲                  └───────────┘
    │                       │
    └───────unpublish───────┘
```

**Rules**:
- New posts start as 'draft'
- Publishing sets `publishedAt` timestamp
- Unpublishing clears `publishedAt` (returns to draft)
- Published posts visible to public (FR-012)

### Media Upload Status

```
┌───────────┐
│ uploading │
└─────┬─────┘
      │
      ├──success──> ┌───────┐
      │             │ ready │
      │             └───────┘
      │
      └───error───> ┌────────┐
                    │ failed │
                    └────────┘
```

**Rules**:
- Upload progress tracked client-side
- Failed uploads can be retried
- Ready media is immediately available for preview

---

## Database Schema (Cloudflare D1 / SQLite)

### Migration: Create Tables

```sql
-- BlogPost table
CREATE TABLE blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author_id TEXT NOT NULL,
  design_template_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'published')) NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  published_at DATETIME,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (design_template_id) REFERENCES design_templates(id)
);

CREATE INDEX idx_posts_author ON blog_posts(author_id);
CREATE INDEX idx_posts_status ON blog_posts(status);
CREATE INDEX idx_posts_published ON blog_posts(published_at);

-- DesignTemplate table
CREATE TABLE design_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  component TEXT NOT NULL,
  max_photos INTEGER NOT NULL,
  max_videos INTEGER NOT NULL,
  required_text_sections TEXT, -- JSON array
  preview_image_url TEXT,
  grid_layout TEXT NOT NULL,
  created_at DATETIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX idx_templates_active ON design_templates(is_active);

-- PhotoContent table
CREATE TABLE photo_content (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  url TEXT NOT NULL,
  cloudflare_image_id TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  source TEXT CHECK(source IN ('upload', 'apple-photos', 'external-url')) NOT NULL,
  original_filename TEXT,
  uploaded_at DATETIME NOT NULL,
  width INTEGER,
  height INTEGER,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_photos_post ON photo_content(post_id, display_order);

-- VideoContent table
CREATE TABLE video_content (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL,
  source TEXT CHECK(source IN ('upload', 'gopro-cloud', 'external-url')) NOT NULL,
  original_filename TEXT,
  uploaded_at DATETIME NOT NULL,
  duration_seconds INTEGER,
  file_size_mb REAL,
  format TEXT,
  thumbnail_url TEXT,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_videos_post ON video_content(post_id, display_order);

-- TextContent table
CREATE TABLE text_content (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  section_name TEXT NOT NULL,
  content TEXT,
  format TEXT CHECK(format IN ('markdown', 'html', 'plaintext')) NOT NULL,
  display_order INTEGER NOT NULL,
  created_at DATETIME NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX idx_text_post ON text_content(post_id, display_order);

-- PostTemplateHistory table
CREATE TABLE post_template_history (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  changed_at DATETIME NOT NULL,
  changed_by TEXT NOT NULL,
  previous_template_id TEXT,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES design_templates(id)
);

CREATE INDEX idx_history_post ON post_template_history(post_id, changed_at);
```

---

## Data Validation Summary

| Entity | Key Validations |
|--------|-----------------|
| BlogPost | Slug unique, title non-empty, valid template ID |
| DesignTemplate | Component file exists, max photos/videos > 0 |
| PhotoContent | HTTPS URL, alt text required, unique display order per post |
| VideoContent | HTTPS URL, web-compatible format, max 500MB |
| TextContent | Section name required, unique display order per post |

---

## Content Overflow/Underflow Handling

Per FR-016 and FR-017:

**Underflow (fewer items than template expects)**:
- Template renders with placeholders for missing items
- Implemented in template components: `<PlaceholderImage count={remaining} />`
- No blocking validation - posts can be published with 0 photos/videos

**Overflow (more items than template displays)**:
- Template uses array slicing: `photos.slice(0, template.maxPhotos)`
- Excess items stored in database but not rendered
- User can switch to template with higher max to display all items

**Example**:
- Post has 15 photos
- Template maxPhotos = 10
- Display: First 10 photos
- Storage: All 15 photos in photo_content table
- Switching to template with maxPhotos = 20 → all 15 photos now visible
