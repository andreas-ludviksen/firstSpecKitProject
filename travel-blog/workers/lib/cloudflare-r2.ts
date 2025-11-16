/**
 * Cloudflare R2 Upload Helper
 * Feature: 004-modular-blog-posts
 * 
 * Handles video uploads to Cloudflare R2 object storage
 */

export interface R2UploadResult {
  key: string;
  url: string;
  size: number;
  etag: string;
}

export class CloudflareR2Client {
  constructor(private bucket: R2Bucket, private publicBucketUrl?: string) {}

  /**
   * Upload a file to R2
   */
  async upload(
    key: string,
    file: File | Blob | ArrayBuffer,
    options?: {
      contentType?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<R2UploadResult> {
    try {
      const fileData = file instanceof ArrayBuffer ? file : await this.fileToArrayBuffer(file);
      
      const object = await this.bucket.put(key, fileData, {
        httpMetadata: {
          contentType: options?.contentType || this.guessContentType(key),
        },
        customMetadata: options?.metadata,
      });

      if (!object) {
        throw new Error('Failed to upload file to R2');
      }

      return {
        key,
        url: this.getPublicUrl(key),
        size: object.size,
        etag: object.etag,
      };
    } catch (error) {
      console.error('R2 upload error:', error);
      throw new Error(`R2 upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Upload video with automatic format detection
   */
  async uploadVideo(
    postId: string,
    videoId: string,
    file: File | Blob,
    options?: {
      originalFilename?: string;
      metadata?: Record<string, string>;
    }
  ): Promise<R2UploadResult> {
    const extension = options?.originalFilename?.split('.').pop()?.toLowerCase() || 'mp4';
    const key = `videos/${postId}/${videoId}.${extension}`;
    
    const contentType = this.getVideoContentType(extension);
    
    return this.upload(key, file, {
      contentType,
      metadata: {
        postId,
        videoId,
        originalFilename: options?.originalFilename || '',
        ...options?.metadata,
      },
    });
  }

  /**
   * Get file from R2
   */
  async get(key: string): Promise<R2ObjectBody | null> {
    try {
      return await this.bucket.get(key);
    } catch (error) {
      console.error('R2 get error:', error);
      return null;
    }
  }

  /**
   * Delete file from R2
   */
  async delete(key: string): Promise<boolean> {
    try {
      await this.bucket.delete(key);
      return true;
    } catch (error) {
      console.error('R2 delete error:', error);
      return false;
    }
  }

  /**
   * Check if file exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const object = await this.bucket.head(key);
      return object !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get public URL for an object
   */
  getPublicUrl(key: string): string {
    if (this.publicBucketUrl) {
      return `${this.publicBucketUrl}/${key}`;
    }
    // Fallback to R2.dev URL format (requires public access configured)
    return `https://pub-bucket.r2.dev/${key}`;
  }

  /**
   * Validate video file
   */
  validateVideo(file: File | Blob, maxSizeMB: number = 500): { valid: boolean; error?: string } {
    // Check file size
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      return { valid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    // Check file type for File objects
    if (file instanceof File) {
      const validTypes = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
      if (!validTypes.includes(file.type)) {
        return { valid: false, error: 'Invalid video type. Supported: MP4, MOV, AVI, WebM' };
      }
    }

    return { valid: true };
  }

  /**
   * Convert File/Blob to ArrayBuffer
   */
  private async fileToArrayBuffer(file: File | Blob): Promise<ArrayBuffer> {
    return await file.arrayBuffer();
  }

  /**
   * Guess content type from file extension
   */
  private guessContentType(key: string): string {
    const extension = key.split('.').pop()?.toLowerCase();
    
    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
    };

    return mimeTypes[extension || ''] || 'application/octet-stream';
  }

  /**
   * Get video content type from extension
   */
  private getVideoContentType(extension: string): string {
    const videoTypes: Record<string, string> = {
      mp4: 'video/mp4',
      mov: 'video/quicktime',
      avi: 'video/x-msvideo',
      webm: 'video/webm',
      m4v: 'video/x-m4v',
    };

    return videoTypes[extension.toLowerCase()] || 'video/mp4';
  }
}

/**
 * Create R2 client instance
 */
export function createR2Client(bucket: R2Bucket, publicBucketUrl?: string): CloudflareR2Client {
  return new CloudflareR2Client(bucket, publicBucketUrl);
}

/**
 * Extract video metadata (duration, dimensions) - requires external service or client-side processing
 * Note: Workers don't have native video processing, would need to use external service
 */
export interface VideoMetadata {
  duration?: number;
  width?: number;
  height?: number;
  format?: string;
}
