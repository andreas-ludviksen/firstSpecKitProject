# Quickstart Guide: Creating Modular Blog Posts

**Feature**: Modular Blog Posts with Interchangeable Design Templates  
**Audience**: Contributors  
**Date**: 2025-11-14

## Overview

This guide walks you through creating and managing blog posts with modular content (photos, videos, text) and interchangeable design templates.

---

## Prerequisites

1. **Contributor Account**: You must be logged in as a contributor (see feature 003-user-authentication)
2. **Media Sources**: 
   - Photos from Apple Photos (export to HEIC/JPEG first)
   - Videos from GoPro Cloud (download to MP4 first)
3. **Browser**: Latest Chrome, Firefox, Safari, or Edge

---

## Quick Start: Create Your First Post

### Step 1: Log In

1. Navigate to `https://blog.example.com/login`
2. Enter your contributor credentials
3. You'll be redirected to the contributor dashboard

### Step 2: Create New Post

1. Click **"Create New Post"** button
2. Fill in:
   - **Title**: e.g., "Our Norwegian Fjords Adventure"
   - **Design Template**: Select from gallery of 10 templates (preview each)
   - **Status**: Choose "Draft" (can publish later)
3. Click **"Create Post"**
4. You'll be redirected to the post editor

### Step 3: Add Photos

**Option A: Upload from Apple Photos**

1. Open Apple Photos on your Mac/iPhone
2. Select photos you want in your blog post
3. Export: `File → Export → Export Unmodified Originals`
   - Format: JPEG or HEIC (both supported)
   - Quality: Maximum (Cloudflare Images will optimize)
4. In blog editor, click **"Add Photos"**
5. Drag and drop exported photos or click to browse
6. For each photo:
   - Add caption (optional, recommended)
   - Add alt text (required for accessibility)
   - Photos appear in order uploaded
7. Wait for upload progress bars to complete
8. Photos appear in your post preview

**Option B: External Photo URLs**

1. Click **"Add Photo from URL"**
2. Paste image URL (must be HTTPS)
3. System validates URL is accessible
4. Add caption and alt text
5. Photo added to post

### Step 4: Add Videos

**From GoPro Cloud**:

1. Log in to GoPro Cloud (`https://plus.gopro.com`)
2. Find video you want to add
3. Download video to your computer (MP4 format)
4. In blog editor, click **"Add Video"**
5. Drag and drop MP4 file or click to browse
6. Add caption (optional)
7. Wait for upload (may take 1-2 minutes for large files)
8. Video appears with preview thumbnail

**Supported Formats**:
- MP4 (H.264 or H.265 codec, recommended)
- MOV (converted to MP4 automatically)
- Max size: 500MB per video

### Step 5: Add Text Content

1. Click **"Add Text Section"**
2. Name section (e.g., "intro", "day-1", "conclusion")
3. Write content using Markdown or rich text editor:
   - **Bold**: `**bold text**`
   - *Italic*: `*italic text*`
   - Headings: `## Heading 2`
   - Lists: `- List item`
4. Text sections can be reordered by dragging
5. Multiple text sections supported (e.g., intro, body, conclusion)

### Step 6: Preview Your Post

1. Click **"Preview"** button
2. See how content appears in current design template
3. Try different templates:
   - Click **"Browse Templates"**
   - Hover over template to see preview
   - Click template to see YOUR content in that layout
   - No changes saved until you click **"Save"**

### Step 7: Publish

1. Review your post in preview mode
2. Click **"Publish"** button (or save as draft for later)
3. Post is now live at `https://blog.example.com/posts/your-post-slug`
4. Share URL with friends and family!

---

## Managing Existing Posts

### Change Design Template

Want to try a different layout after publishing?

1. Open post in editor
2. Click **"Change Template"**
3. Select new template from gallery
4. Preview how content looks in new template
5. Click **"Apply Template"**
6. All content preserved, only layout changes
7. Change is logged in post history (visible in editor)

**Notes**:
- Content (photos, videos, text) never changes
- Some templates show more/fewer items:
  - If new template shows fewer photos: Extra photos hidden (but not deleted)
  - If new template shows more photos: Hidden photos become visible
  - Placeholders shown for missing content

### Reorder Content

1. Open post in editor
2. Drag and drop photos/videos/text sections to reorder
3. Click **"Save Order"**
4. Order preserved when switching templates

### Edit Content

**Edit Photo**:
- Click photo in editor
- Update caption or alt text
- Click **"Save"**

**Edit Video**:
- Click video in editor
- Update caption
- Click **"Save"**

**Edit Text**:
- Click text section in editor
- Modify content
- Click **"Save"**

**Remove Content**:
- Hover over item
- Click **"Remove"** (trash icon)
- Content deleted from post (but media files preserved)

### View Template History

See which templates were used for this post:

1. Open post in editor
2. Click **"View History"** tab
3. See timeline of template changes:
   - When changed
   - Who changed it
   - Previous template
   - Reason (if provided)

---

## Design Template Gallery

Choose from ~10 pre-designed templates:

### Template 01: Classic Grid
- **Layout**: 2-column photo grid
- **Best for**: Balanced mix of photos and text
- **Max Photos**: 12
- **Max Videos**: 2

### Template 02: Story Layout
- **Layout**: Single column with photos between text
- **Best for**: Narrative-driven posts
- **Max Photos**: 10
- **Max Videos**: 3

### Template 03: Photo Grid Showcase
- **Layout**: 3-column grid, photo-focused
- **Best for**: Photo-heavy galleries
- **Max Photos**: 15
- **Max Videos**: 1

### Template 04: Video-First Layout
- **Layout**: Large video header, smaller photo grid
- **Best for**: Video-centric stories
- **Max Photos**: 6
- **Max Videos**: 3

### Template 05: Masonry Layout
- **Layout**: Pinterest-style masonry grid
- **Best for**: Photos of varying sizes
- **Max Photos**: 20
- **Max Videos**: 2

### Templates 06-10
- Additional layouts for different content types
- Preview each in template gallery

**Note**: Templates managed by administrators. Contributors can only select from available templates.

---

## Tips & Best Practices

### Photos

✅ **Do**:
- Export photos from Apple Photos before uploading
- Add descriptive alt text for accessibility
- Use captions to tell the story
- Upload in batch (up to 50 photos at once)

❌ **Don't**:
- Upload extremely large files (>10MB) - export "optimized" version instead
- Skip alt text (required for accessibility)
- Duplicate photos (each upload creates new copy)

### Videos

✅ **Do**:
- Convert GoPro videos to MP4 if in other formats
- Add captions describing video content
- Keep videos under 5 minutes for best performance
- Test video playback in preview before publishing

❌ **Don't**:
- Upload videos over 500MB (compress if needed)
- Use exotic codecs (stick to H.264)
- Upload same video multiple times

### Text

✅ **Do**:
- Break content into logical sections (intro, body, conclusion)
- Use headings (##, ###) to structure long text
- Keep paragraphs short for readability
- Proofread before publishing

❌ **Don't**:
- Put all text in one massive section
- Use excessive formatting (bold/italic sparingly)
- Copy-paste from Word (may include hidden formatting)

### Templates

✅ **Do**:
- Preview content in multiple templates before choosing
- Switch templates if content doesn't fit well
- Check template history to see what worked before
- Consider photo count when choosing template

❌ **Don't**:
- Choose template before adding content
- Worry about excess photos (they're hidden, not deleted)
- Be afraid to experiment with different templates

---

## Testing Your Posts

### With Mocked Media (For Development)

When testing the blog post creation flow:

1. **Text Content**: Use production format (real Markdown/HTML)
2. **Design Templates**: Use production React components
3. **Photos**: Use placeholder images or small test JPEGs
   - Placeholder: `https://via.placeholder.com/800x600`
   - Test image: Small JPEG files (<100KB)
4. **Videos**: Use test video URLs or small MP4 files
   - Test video: Short clip (<10MB)
   - Mock URL: Link to sample video

**Example Test Post**:
```json
{
  "title": "Test Post",
  "photos": [
    { "url": "https://via.placeholder.com/800x600", "altText": "Test photo 1" },
    { "url": "https://via.placeholder.com/800x600", "altText": "Test photo 2" }
  ],
  "videos": [
    { "url": "https://example.com/test-video.mp4", "caption": "Test video" }
  ],
  "text": [
    { "sectionName": "intro", "content": "## Test Content\n\nThis is a test post." }
  ]
}
```

---

## Troubleshooting

### Upload Issues

**"File too large" error**:
- Solution: Compress photo/video or export lower resolution from Apple Photos/GoPro

**"Invalid format" error**:
- Solution: Convert to supported format (JPEG/PNG for photos, MP4 for videos)

**"Upload failed" error**:
- Solution: Check internet connection, try again, or contact admin

### Preview Issues

**Content doesn't appear in preview**:
- Solution: Wait for upload to complete (check progress bars)
- Refresh page if stuck

**Template preview shows placeholders**:
- Solution: Normal if you have fewer items than template requires (FR-016)

**Some photos hidden in preview**:
- Solution: Normal if template displays fewer than you uploaded (FR-017)
  - Switch to template with higher photo limit to see all photos

### Publishing Issues

**"Cannot publish" error**:
- Solution: Ensure required fields are filled (title, at least one content item)

**Post not visible after publishing**:
- Solution: Check status is "published" not "draft", clear browser cache

---

## Next Steps

- **Explore Templates**: Try different layouts to see which fits your content best
- **Add More Posts**: Build your blog post library
- **Share Posts**: Send links to friends and family
- **Report Issues**: Contact administrator if you encounter problems

**Need Help?** Contact your blog administrator or see full documentation at `/docs/`.
