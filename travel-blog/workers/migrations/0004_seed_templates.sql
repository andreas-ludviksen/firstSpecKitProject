-- Migration: Seed Design Templates
-- Feature: 004-modular-blog-posts
-- Date: 2025-11-14
-- Description: Seeds 10 design templates for blog posts

-- Template 01: Classic Grid
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-01',
  'Classic Grid',
  'Balanced 2-column photo grid with text sections. Perfect for posts with a good mix of photos and narrative.',
  'Template01',
  12,
  2,
  '["intro"]',
  '/images/templates/template-01-preview.jpg',
  'grid-2col',
  CURRENT_TIMESTAMP,
  1
);

-- Template 02: Story Layout
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-02',
  'Story Layout',
  'Single column layout with photos interspersed between text sections. Ideal for narrative-driven posts.',
  'Template02',
  10,
  3,
  '["intro", "conclusion"]',
  '/images/templates/template-02-preview.jpg',
  'single-column',
  CURRENT_TIMESTAMP,
  1
);

-- Template 03: Photo Grid Showcase
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-03',
  'Photo Grid Showcase',
  '3-column grid focused on photos. Best for photo-heavy galleries with minimal text.',
  'Template03',
  15,
  1,
  '["intro"]',
  '/images/templates/template-03-preview.jpg',
  'grid-3col',
  CURRENT_TIMESTAMP,
  1
);

-- Template 04: Video-First Layout
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-04',
  'Video-First Layout',
  'Large video header with smaller photo grid below. Perfect for video-centric stories.',
  'Template04',
  6,
  3,
  '["intro"]',
  '/images/templates/template-04-preview.jpg',
  'single-column',
  CURRENT_TIMESTAMP,
  1
);

-- Template 05: Masonry Layout
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-05',
  'Masonry Layout',
  'Pinterest-style masonry grid for photos of varying sizes. Great for artistic presentations.',
  'Template05',
  20,
  2,
  '[]',
  '/images/templates/template-05-preview.jpg',
  'masonry',
  CURRENT_TIMESTAMP,
  1
);

-- Template 06: Minimal Clean
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-06',
  'Minimal Clean',
  'Clean, minimalist layout with generous white space. Emphasizes content over decoration.',
  'Template06',
  8,
  1,
  '["intro"]',
  '/images/templates/template-06-preview.jpg',
  'single-column',
  CURRENT_TIMESTAMP,
  1
);

-- Template 07: Magazine Style
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-07',
  'Magazine Style',
  'Editorial magazine layout with hero image and asymmetric grid. Professional and polished.',
  'Template07',
  14,
  2,
  '["intro", "body"]',
  '/images/templates/template-07-preview.jpg',
  'grid-3col',
  CURRENT_TIMESTAMP,
  1
);

-- Template 08: Timeline Journey
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-08',
  'Timeline Journey',
  'Chronological timeline layout. Perfect for travel journals and day-by-day recaps.',
  'Template08',
  12,
  4,
  '["intro"]',
  '/images/templates/template-08-preview.jpg',
  'single-column',
  CURRENT_TIMESTAMP,
  1
);

-- Template 09: Split Screen
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-09',
  'Split Screen',
  'Side-by-side layout with photos on one side, text on the other. Modern and engaging.',
  'Template09',
  10,
  2,
  '["intro", "body"]',
  '/images/templates/template-09-preview.jpg',
  'grid-2col',
  CURRENT_TIMESTAMP,
  1
);

-- Template 10: Collage Mix
INSERT INTO design_templates (id, name, description, component, max_photos, max_videos, required_text_sections, preview_image_url, grid_layout, created_at, is_active)
VALUES (
  'template-10',
  'Collage Mix',
  'Dynamic collage with mixed sizes and orientations. Creative and eye-catching.',
  'Template10',
  18,
  3,
  '[]',
  '/images/templates/template-10-preview.jpg',
  'masonry',
  CURRENT_TIMESTAMP,
  1
);
