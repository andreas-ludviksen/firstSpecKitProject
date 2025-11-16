-- Migration: Create Blog Posts Schema
-- Feature: 004-modular-blog-posts
-- Date: 2025-11-14
-- Description: Creates tables for modular blog posts with interchangeable design templates

-- DesignTemplate table (admin-managed templates)
CREATE TABLE IF NOT EXISTS design_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  component TEXT NOT NULL,
  max_photos INTEGER NOT NULL,
  max_videos INTEGER NOT NULL,
  required_text_sections TEXT, -- JSON array
  preview_image_url TEXT,
  grid_layout TEXT NOT NULL CHECK(grid_layout IN ('masonry', 'grid-2col', 'grid-3col', 'single-column')),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_templates_active ON design_templates(is_active);

-- BlogPost table
CREATE TABLE IF NOT EXISTS blog_posts (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author_id TEXT NOT NULL,
  design_template_id TEXT NOT NULL,
  status TEXT CHECK(status IN ('draft', 'published')) NOT NULL DEFAULT 'draft',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at DATETIME,
  version INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (design_template_id) REFERENCES design_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_posts_author ON blog_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published ON blog_posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_slug ON blog_posts(slug);

-- PhotoContent table
CREATE TABLE IF NOT EXISTS photo_content (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  url TEXT NOT NULL,
  cloudflare_image_id TEXT NOT NULL,
  caption TEXT,
  alt_text TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  source TEXT CHECK(source IN ('upload', 'apple-photos', 'external-url')) NOT NULL,
  original_filename TEXT,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  width INTEGER,
  height INTEGER,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_photos_post ON photo_content(post_id, display_order);

-- VideoContent table
CREATE TABLE IF NOT EXISTS video_content (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  url TEXT NOT NULL,
  r2_key TEXT NOT NULL,
  caption TEXT,
  display_order INTEGER NOT NULL,
  source TEXT CHECK(source IN ('upload', 'gopro-cloud', 'external-url')) NOT NULL,
  original_filename TEXT,
  uploaded_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  duration_seconds INTEGER,
  file_size_mb REAL,
  format TEXT,
  thumbnail_url TEXT,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_videos_post ON video_content(post_id, display_order);

-- TextContent table
CREATE TABLE IF NOT EXISTS text_content (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  section_name TEXT NOT NULL,
  content TEXT,
  format TEXT CHECK(format IN ('markdown', 'html', 'plaintext')) NOT NULL DEFAULT 'markdown',
  display_order INTEGER NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_text_post ON text_content(post_id, display_order);

-- PostTemplateHistory table (audit trail for template changes)
CREATE TABLE IF NOT EXISTS post_template_history (
  id TEXT PRIMARY KEY,
  post_id TEXT NOT NULL,
  template_id TEXT NOT NULL,
  changed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  changed_by TEXT NOT NULL,
  previous_template_id TEXT,
  reason TEXT,
  FOREIGN KEY (post_id) REFERENCES blog_posts(id) ON DELETE CASCADE,
  FOREIGN KEY (template_id) REFERENCES design_templates(id)
);

CREATE INDEX IF NOT EXISTS idx_history_post ON post_template_history(post_id, changed_at DESC);
