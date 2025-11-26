-- Cleanup script for test posts
-- Run with: npx wrangler d1 execute travel-blog-users --remote --file=scripts/cleanup-test-posts.sql

-- Delete test posts (cascades to all related content via FK constraints)
DELETE FROM blog_posts WHERE title LIKE 'Test%';

-- Verify cleanup
SELECT 'Remaining posts:' as status, COUNT(*) as count FROM blog_posts;
