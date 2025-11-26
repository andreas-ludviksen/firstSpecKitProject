/**
 * Upload Video to Cloudflare Stream
 * 
 * Cloudflare Stream handles video encoding, optimization, and delivery
 * automatically with adaptive bitrate streaming for all devices.
 */

import { withAuth } from '../lib/auth-middleware';
import { errorResponse, ValidationError } from '../lib/errors';

interface Env {
  DB: D1Database;
  CLOUDFLARE_ACCOUNT_ID: string;
  CLOUDFLARE_STREAM_API_TOKEN: string;
}

interface StreamUploadResponse {
  result: {
    uid: string;
    thumbnail: string;
    thumbnailTimestampPct: number;
    readyToStream: boolean;
    status: {
      state: string;
      pctComplete: string;
      errorReasonCode?: string;
      errorReasonText?: string;
    };
    meta: Record<string, string>;
    created: string;
    modified: string;
    size: number;
    preview: string;
    allowedOrigins: string[];
    requireSignedURLs: boolean;
    uploaded: string;
    uploadExpiry: string | null;
    maxSizeBytes: number;
    maxDurationSeconds: number;
    duration: number;
    input: {
      width: number;
      height: number;
    };
    playback: {
      hls: string;
      dash: string;
    };
    watermark: string | null;
  };
  success: boolean;
  errors: Array<{ code: number; message: string }>;
  messages: string[];
}

export const uploadVideoStream = withAuth(async (request: Request, user, env: Env) => {
  try {
    // Get form data
    const formData = await request.formData();
    const fileEntry = formData.get('video');
    const postId = formData.get('postId') as string;
    const caption = formData.get('caption') as string;
    const source = formData.get('source') as string;

    if (!fileEntry || typeof fileEntry === 'string') {
      throw new ValidationError('No video file provided');
    }

    const file = fileEntry as File;

    if (!postId) {
      throw new ValidationError('Post ID is required');
    }

    // Validate file type
    const validTypes = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo'];
    if (!validTypes.includes(file.type)) {
      throw new ValidationError('Invalid video type. Supported: MP4, MOV, WebM, AVI');
    }

    // Prepare metadata for Stream
    const metadata = {
      postId,
      originalFilename: file.name,
      uploadedBy: user.sub, // username from JWT
      uploadedAt: new Date().toISOString(),
    };

    // Upload to Cloudflare Stream
    const uploadFormData = new FormData();
    uploadFormData.append('file', file);
    
    // Add metadata
    Object.entries(metadata).forEach(([key, value]) => {
      uploadFormData.append(`meta[${key}]`, value);
    });

    const streamResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${env.CLOUDFLARE_ACCOUNT_ID}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${env.CLOUDFLARE_STREAM_API_TOKEN}`,
        },
        body: uploadFormData,
      }
    );

    if (!streamResponse.ok) {
      const errorText = await streamResponse.text();
      console.error('Stream upload error:', errorText);
      throw new Error(`Stream upload failed: ${streamResponse.status}`);
    }

    const streamData = await streamResponse.json() as StreamUploadResponse;

    if (!streamData.success) {
      const errors = streamData.errors.map(e => e.message).join(', ');
      throw new Error(`Stream upload failed: ${errors}`);
    }

    const videoId = streamData.result.uid;
    const fileSizeMB = streamData.result.size / (1024 * 1024);

    // Store video metadata in D1
    const videoContentId = crypto.randomUUID();
    
    await env.DB.prepare(
      `INSERT INTO video_content (
        id, post_id, url, r2_key, stream_id, caption, display_order, 
        source, original_filename, uploaded_at, duration_seconds,
        file_size_mb, format, thumbnail_url, width, height
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      videoContentId,
      postId,
      streamData.result.playback.hls, // HLS playback URL
      `stream/${videoId}`, // Placeholder r2_key for Stream videos
      videoId, // Cloudflare Stream ID
      caption || null,
      0, // Default display order
      source || 'upload',
      file.name,
      new Date().toISOString(),
      streamData.result.duration || null,
      fileSizeMB,
      file.type,
      streamData.result.thumbnail,
      streamData.result.input?.width || null,
      streamData.result.input?.height || null
    ).run();

    return new Response(
      JSON.stringify({
        success: true,
        video: {
          id: videoContentId,
          streamId: videoId,
          url: streamData.result.playback.hls,
          thumbnailUrl: streamData.result.thumbnail,
          duration: streamData.result.duration,
          width: streamData.result.input?.width,
          height: streamData.result.input?.height,
          fileSizeMB,
          format: file.type,
          readyToStream: streamData.result.readyToStream,
          status: streamData.result.status.state,
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Video Stream upload error:', error);
    
    if (error instanceof ValidationError) {
      return errorResponse('Validation Error', error.message, 400);
    }
    
    return errorResponse(
      'Upload Failed',
      error instanceof Error ? error.message : 'Failed to upload video to Stream',
      500
    );
  }
});
