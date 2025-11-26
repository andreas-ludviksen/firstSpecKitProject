/**
 * Delete Blog Post Endpoint
 * Feature: 004-modular-blog-posts
 * DELETE /api/posts/:postId
 * 
 * Deletes a blog post and all its content
 */

import { createDatabaseClient } from '../lib/db';
import { createR2Client } from '../lib/cloudflare-r2';
import { createCloudflareImagesClient } from '../lib/cloudflare-images';
import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  NotFoundError,
  UnauthorizedError, 
  ServerError,
  successResponse 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  CLOUDFLARE_STREAM_API_TOKEN: string;
  JWT_SECRET: string;
}

export const deletePost = withAuth(async (request: Request & { params?: any }, user, env: Env, params: any) => {
  try {
    // Extract params from request object (itty-router)
    const routeParams = (request as any).params || params;
    const { postId } = routeParams;

    if (!postId) {
      throw new NotFoundError('Post not found');
    }

    const db = createDatabaseClient(env.DB);

    // Get post to check ownership
    const post = await db.queryOne(
      'SELECT id, author_id FROM blog_posts WHERE id = ?',
      [postId]
    );

    if (!post) {
      throw new NotFoundError('Post not found');
    }

    // Check if user is the author (or admin in the future)
    if (post.author_id !== user.sub) {
      throw new UnauthorizedError('You do not have permission to delete this post');
    }

    // Get video content to delete from R2 and Stream
    const videos = await db.query(
      'SELECT r2_key, stream_id FROM video_content WHERE post_id = ?',
      [postId]
    );

    // Get photo content to delete from Cloudflare Images
    const photos = await db.query(
      'SELECT cloudflare_image_id FROM photo_content WHERE post_id = ?',
      [postId]
    );

    console.log(`[DELETE POST] Deleting post ${postId} with ${photos.length} photos and ${videos.length} videos`);

    // Delete all content from database (cascade through foreign keys)
    await db.batch([
      { query: 'DELETE FROM photo_content WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM video_content WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM text_content WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM post_template_history WHERE post_id = ?', params: [postId] },
      { query: 'DELETE FROM blog_posts WHERE id = ?', params: [postId] },
    ]);

    // Delete photos from Cloudflare Images (best effort)
    if (photos.length > 0) {
      const imagesClient = createCloudflareImagesClient({
        accountId: env.CLOUDFLARE_ACCOUNT_ID,
        accountHash: 'QxBDcO6nSQt1EuhABg3fCg', // Hardcoded delivery hash
        apiToken: env.CLOUDFLARE_IMAGES_API_TOKEN,
      });

      let deletedPhotos = 0;
      let failedPhotos = 0;

      for (const photo of photos) {
        try {
          const success = await imagesClient.delete(photo.cloudflare_image_id);
          if (success) {
            deletedPhotos++;
            console.log(`[DELETE POST] Deleted image: ${photo.cloudflare_image_id}`);
          } else {
            failedPhotos++;
            console.warn(`[DELETE POST] Failed to delete image: ${photo.cloudflare_image_id}`);
          }
        } catch (error) {
          failedPhotos++;
          console.error(`[DELETE POST] Error deleting image ${photo.cloudflare_image_id}:`, error);
          // Continue deleting other photos even if one fails
        }
      }

      console.log(`[DELETE POST] Photos deleted: ${deletedPhotos}, failed: ${failedPhotos}`);
    }

    // Delete videos from Cloudflare Stream and R2 (best effort)
    if (videos.length > 0) {
      let deletedStreamVideos = 0;
      let failedStreamVideos = 0;
      let deletedR2Videos = 0;
      let failedR2Videos = 0;

      for (const video of videos) {
        // Delete from Cloudflare Stream if it's a Stream video
        if (video.stream_id) {
          try {
            const streamResponse = await fetch(
              `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream/${video.stream_id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
                },
              }
            );

            if (streamResponse.ok) {
              deletedStreamVideos++;
              console.log(`[DELETE POST] Deleted Stream video: ${video.stream_id}`);
            } else {
              failedStreamVideos++;
              const errorText = await streamResponse.text();
              console.warn(`[DELETE POST] Failed to delete Stream video ${video.stream_id}: ${errorText}`);
            }
          } catch (error) {
            failedStreamVideos++;
            console.error(`[DELETE POST] Error deleting Stream video ${video.stream_id}:`, error);
          }
        }

        // Delete from R2 if it's a legacy R2 video (not a Stream placeholder)
        if (video.r2_key && !video.r2_key.startsWith('stream/')) {
          try {
            const r2Client = createR2Client(env.MEDIA_BUCKET);
            await r2Client.delete(video.r2_key);
            deletedR2Videos++;
            console.log(`[DELETE POST] Deleted R2 video: ${video.r2_key}`);
          } catch (error) {
            failedR2Videos++;
            console.error(`[DELETE POST] Error deleting R2 video ${video.r2_key}:`, error);
          }
        }
      }

      console.log(`[DELETE POST] Stream videos deleted: ${deletedStreamVideos}, failed: ${failedStreamVideos}`);
      console.log(`[DELETE POST] R2 videos deleted: ${deletedR2Videos}, failed: ${failedR2Videos}`);
    }

    // Return response
    return successResponse({
      message: 'Post deleted successfully',
      postId,
      deletedPhotos: photos.length,
      deletedVideos: videos.length,
    });

  } catch (error) {
    console.error('Delete post error:', error);
    
    if (error instanceof NotFoundError || error instanceof UnauthorizedError) {
      throw error;
    }
    
    throw new ServerError('Failed to delete blog post');
  }
});
