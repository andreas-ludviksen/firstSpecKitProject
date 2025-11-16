/**
 * Upload Video Endpoint
 * Feature: 004-modular-blog-posts
 * POST /api/media/upload-video
 * 
 * Handles video uploads to Cloudflare R2
 */

import { createR2Client } from '../lib/cloudflare-r2';
import { createDatabaseClient } from '../lib/db';
import { generateUUID } from '../lib/uuid';
import { withAuth } from '../lib/auth-middleware';
import type { SessionPayload } from '../lib/jwt';
import { 
  ValidationError, 
  TooLargeError, 
  ServerError,
  successResponse 
} from '../lib/errors';

interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  JWT_SECRET: string;
}

export const uploadVideo = withAuth(async (request: Request, user, env: Env) => {
  try {
    // Parse multipart form data
    const formData = await request.formData();
    
    const fileEntry = formData.get('file');
    const postId = formData.get('postId') as string;
    const caption = formData.get('caption') as string | null;
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
    
    const displayOrder = displayOrderStr ? parseInt(displayOrderStr as string, 10) : 0;
    if (isNaN(displayOrder)) {
      throw new ValidationError('displayOrder must be a number');
    }

    // Validate file type and size
    const maxSizeMB = 500;
    const maxBytes = maxSizeMB * 1024 * 1024;
    
    if (file.size > maxBytes) {
      throw new TooLargeError(`File size exceeds ${maxSizeMB}MB limit`, maxBytes);
    }

    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm'];
    if (!validTypes.includes(file.type)) {
      throw new ValidationError('Invalid file type. Supported: MP4, MOV, WebM');
    }

    // Upload to Cloudflare R2
    const r2Client = createR2Client(env.MEDIA_BUCKET);
    const videoId = generateUUID();
    const objectKey = `videos/${videoId}/${file.name}`;

    const arrayBuffer = await file.arrayBuffer();
    await r2Client.upload(objectKey, arrayBuffer, {
      contentType: file.type,
    });

    // Generate public URL
    const videoUrl = `https://media.yourdomain.com/${objectKey}`;

    // Store video metadata in database
    const db = createDatabaseClient(env.DB);
    const now = new Date().toISOString();

    await db.execute(
      `INSERT INTO video_content (
        id, post_id, url, r2_object_key, caption, display_order, 
        source, original_filename, uploaded_at, file_size_bytes, mime_type
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        videoId,
        postId,
        videoUrl,
        objectKey,
        caption || null,
        displayOrder,
        source,
        file.name,
        now,
        file.size,
        file.type,
      ]
    );

    // Return response
    return successResponse({
      videoId,
      url: videoUrl,
      r2ObjectKey: objectKey,
      fileSizeBytes: file.size,
      mimeType: file.type,
      uploadedAt: now,
    }, 201);

  } catch (error) {
    console.error('Video upload error:', error);
    
    if (error instanceof ValidationError || error instanceof TooLargeError) {
      throw error;
    }
    
    throw new ServerError('Failed to upload video to R2');
  }
});
