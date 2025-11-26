-- Migration: Add Cloudflare Stream support to video_content table
-- Date: 2025-11-26
-- Feature: cloudflare-stream-video

-- Add stream_id column for Cloudflare Stream UID
ALTER TABLE video_content ADD COLUMN stream_id TEXT;

-- Add width and height columns for video dimensions
ALTER TABLE video_content ADD COLUMN width INTEGER;
ALTER TABLE video_content ADD COLUMN height INTEGER;

-- Create index on stream_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_video_content_stream_id ON video_content(stream_id);
