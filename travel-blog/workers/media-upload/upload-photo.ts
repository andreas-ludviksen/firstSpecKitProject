/**
 * Upload Photo Endpoint
 * Feature: 004-modular-blog-posts
 * POST /api/media/upload-photo
 * 
 * Handles photo uploads to Cloudflare Images
 */

import { createCloudflareImagesClient } from '../lib/cloudflare-images';
import { createDatabaseClient } from '../lib/db';
import { generateUUID } from '../lib/uuid';
import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  ValidationError, 
  TooLargeError, 
  ServerError,
  successResponse,
  validateRequired 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_IMAGES_API_TOKEN: string;
  JWT_SECRET: string;
}

export const uploadPhoto = withAuth(async (request: Request, user, env: Env) => {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    const fileEntry = formData.get('file');
    const postId = formData.get('postId') as string;
    const caption = formData.get('caption') as string | null;
    const altText = formData.get('altText') as string;
    const displayOrderStr = formData.get('displayOrder');
    const source = formData.get('source') as string || 'upload';

    // Validate file
    if (!fileEntry || typeof fileEntry === 'string') {
      throw new ValidationError('File is required');
    }
    const file = fileEntry as File;
    
    // Validate required fields
    if (!postId) {
      throw new ValidationError('postId is required');
    }
    if (!altText) {
      throw new ValidationError('altText is required for accessibility');
    }
    
    const displayOrder = displayOrderStr ? parseInt(displayOrderStr as string, 10) : 0;
    if (isNaN(displayOrder)) {
      throw new ValidationError('displayOrder must be a number');
    }

    // Validate file type and size
    const maxSizeMB = 10;
    const maxBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxBytes) {
      throw new TooLargeError(`File size exceeds ${maxSizeMB}MB limit`, maxBytes);
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic'];
    if (!validTypes.includes(file.type)) {
      throw new ValidationError('Invalid file type. Supported: JPEG, PNG, WebP, GIF, HEIC');
    }

    // Upload to Cloudflare Images
    const imagesClient = createCloudflareImagesClient({
      accountId: env.CLOUDFLARE_ACCOUNT_ID,
      apiToken: env.CLOUDFLARE_IMAGES_API_TOKEN,
    });

    const uploadResult = await imagesClient.upload(file, {
      postId,
      uploadedBy: user.sub,
    });

    console.log('[UPLOAD PHOTO] Upload result:', uploadResult);

    // Get variant URLs
    const variants = imagesClient.getVariantUrls(uploadResult.id);
    
    console.log('[UPLOAD PHOTO] Variant URLs:', variants);

    // Extract image dimensions (if available from upload result)
    const width = (uploadResult as any).width || null;
    const height = (uploadResult as any).height || null;

    // Store photo metadata in database
    const db = createDatabaseClient(env.DB);
    const photoId = generateUUID();
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO photo_content (
        id, post_id, url, cloudflare_image_id, caption, alt_text, 
        display_order, source, original_filename, uploaded_at, width, height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        photoId,
        postId,
        variants.desktop,
        uploadResult.id,
        caption || null,
        altText,
        displayOrder,
        source,
        file.name,
        now,
        width,
        height,
      ]
    );

    // Return response
    return successResponse({
      photoId,
      url: variants.desktop,
      cloudflareImageId: uploadResult.id,
      variants,
      width,
      height,
      uploadedAt: now,
    }, 201);

  } catch (error) {
    console.error('Photo upload error:', error);
    
    if (error instanceof ValidationError || error instanceof TooLargeError) {
      throw error;
    }
    
    throw new ServerError('Failed to upload photo to Cloudflare Images');
  }
});
