# API Contract: Media Upload

**Endpoint**: Media Upload API  
**Feature**: 004-modular-blog-posts  
**Version**: 1.0  
**Date**: 2025-11-14

## Overview

Handles photo and video uploads from contributors, storing photos in Cloudflare Images and videos in Cloudflare R2. Supports direct uploads and external URL validation.

---

## Upload Photo

### Request

**Method**: `POST`  
**Path**: `/api/media/upload-photo`  
**Content-Type**: `multipart/form-data`  
**Authentication**: Required (Contributor role from feature 003)

**Form Fields**:
```typescript
{
  file: File;              // Image file (JPEG, PNG, HEIC, WebP)
  postId: string;          // UUID of associated blog post
  caption?: string;        // Photo caption (max 500 chars)
  altText: string;         // Accessibility alt text (max 200 chars, required)
  displayOrder: number;    // Sort order (0-indexed)
  source: 'upload' | 'apple-photos'; // Origin indicator
}
```

**Constraints**:
- Max file size: 10MB
- Accepted formats: JPEG, PNG, HEIC, WebP, GIF
- Image dimensions: No minimum, max 8000x8000 pixels
- Alt text required for accessibility

### Response

**Success (201 Created)**:
```typescript
{
  photoId: string;              // UUID
  url: string;                  // Cloudflare Images delivery URL (desktop variant)
  cloudflareImageId: string;    // CF Images ID for variant generation
  variants: {
    thumbnail: string;          // 200x200 URL
    mobile: string;             // 800x600 URL
    desktop: string;            // 1920x1080 URL
    original: string;           // Full resolution URL
  };
  width: number;                // Original width in pixels
  height: number;               // Original height in pixels
  uploadedAt: string;           // ISO 8601 timestamp
}
```

**Error Responses**:

*400 Bad Request*:
```typescript
{
  error: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "MISSING_ALT_TEXT" | "INVALID_POST_ID";
  message: string;
  details?: any;
}
```

*401 Unauthorized*:
```typescript
{
  error: "AUTHENTICATION_REQUIRED";
  message: "Contributor authentication required";
}
```

*413 Payload Too Large*:
```typescript
{
  error: "FILE_TOO_LARGE";
  message: "File size exceeds 10MB limit";
  maxSizeBytes: 10485760;
}
```

*500 Internal Server Error*:
```typescript
{
  error: "UPLOAD_FAILED";
  message: "Failed to upload photo to Cloudflare Images";
}
```

### Example

**Request**:
```bash
curl -X POST https://api.example.com/api/media/upload-photo \
  -H "Authorization: Bearer {token}" \
  -F "file=@IMG_5432.HEIC" \
  -F "postId=550e8400-e29b-41d4-a716-446655440000" \
  -F "caption=Stunning fjord view at sunset" \
  -F "altText=Aerial view of blue fjord surrounded by green mountains" \
  -F "displayOrder=0" \
  -F "source=apple-photos"
```

**Response**:
```json
{
  "photoId": "photo-abc123",
  "url": "https://imagedelivery.net/{account}/abc123def/desktop",
  "cloudflareImageId": "abc123def",
  "variants": {
    "thumbnail": "https://imagedelivery.net/{account}/abc123def/thumbnail",
    "mobile": "https://imagedelivery.net/{account}/abc123def/mobile",
    "desktop": "https://imagedelivery.net/{account}/abc123def/desktop",
    "original": "https://imagedelivery.net/{account}/abc123def/public"
  },
  "width": 4032,
  "height": 3024,
  "uploadedAt": "2025-11-14T10:15:30Z"
}
```

---

## Upload Video

### Request

**Method**: `POST`  
**Path**: `/api/media/upload-video`  
**Content-Type**: `multipart/form-data`  
**Authentication**: Required (Contributor role)

**Form Fields**:
```typescript
{
  file: File;              // Video file (MP4, MOV)
  postId: string;          // UUID of associated blog post
  caption?: string;        // Video caption (max 500 chars)
  displayOrder: number;    // Sort order (0-indexed)
  source: 'upload' | 'gopro-cloud'; // Origin indicator
}
```

**Constraints**:
- Max file size: 500MB
- Accepted formats: MP4 (H.264/H.265), MOV
- Recommend web-compatible codec: H.264 with AAC audio
- Max duration: 30 minutes (configurable)

### Response

**Success (201 Created)**:
```typescript
{
  videoId: string;              // UUID
  url: string;                  // R2 public URL
  r2Key: string;                // R2 object key
  thumbnailUrl?: string;        // Video thumbnail/poster (if generated)
  durationSeconds: number;      // Video duration
  fileSizeMB: number;           // File size in MB
  format: string;               // Detected format (e.g., "mp4")
  uploadedAt: string;           // ISO 8601 timestamp
}
```

**Error Responses**:

*400 Bad Request*:
```typescript
{
  error: "INVALID_FILE_TYPE" | "FILE_TOO_LARGE" | "INVALID_CODEC" | "INVALID_POST_ID";
  message: string;
  details?: { 
    detectedFormat?: string;
    suggestedFormat?: string;
  };
}
```

*401 Unauthorized*:
```typescript
{
  error: "AUTHENTICATION_REQUIRED";
  message: "Contributor authentication required";
}
```

*413 Payload Too Large*:
```typescript
{
  error: "FILE_TOO_LARGE";
  message: "File size exceeds 500MB limit";
  maxSizeBytes: 524288000;
}
```

*500 Internal Server Error*:
```typescript
{
  error: "UPLOAD_FAILED";
  message: "Failed to upload video to R2 storage";
}
```

### Example

**Request**:
```bash
curl -X POST https://api.example.com/api/media/upload-video \
  -H "Authorization: Bearer {token}" \
  -F "file=@GX010245.MP4" \
  -F "postId=550e8400-e29b-41d4-a716-446655440000" \
  -F "caption=Kayaking through narrow fjord channels" \
  -F "displayOrder=0" \
  -F "source=gopro-cloud"
```

**Response**:
```json
{
  "videoId": "video-xyz789",
  "url": "https://pub-bucket.r2.dev/videos/550e8400/video-xyz789.mp4",
  "r2Key": "videos/550e8400-e29b-41d4-a716-446655440000/video-xyz789.mp4",
  "thumbnailUrl": "https://pub-bucket.r2.dev/videos/550e8400/video-xyz789-thumb.jpg",
  "durationSeconds": 127,
  "fileSizeMB": 245.3,
  "format": "mp4",
  "uploadedAt": "2025-11-14T10:20:15Z"
}
```

---

## Validate External URL

### Request

**Method**: `POST`  
**Path**: `/api/media/validate-url`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Body**:
```typescript
{
  url: string;                     // External media URL to validate
  mediaType: 'photo' | 'video';    // Type of media expected
}
```

**Validation Checks**:
- URL accessibility (HTTP HEAD request)
- Content-Type header matches expected media type
- File size within limits (if Content-Length header present)
- HTTPS required (no HTTP)

### Response

**Success (200 OK)**:
```typescript
{
  valid: boolean;
  accessible: boolean;
  contentType: string;        // MIME type from Content-Type header
  contentLength?: number;     // Size in bytes (if available)
  httpsOnly: boolean;         // Whether URL uses HTTPS
  warnings?: string[];        // Non-blocking issues (e.g., "No Content-Length header")
}
```

**Error Responses**:

*400 Bad Request*:
```typescript
{
  error: "INVALID_URL" | "UNSUPPORTED_PROTOCOL";
  message: string;
}
```

*404 Not Found* (for inaccessible URLs):
```typescript
{
  valid: false;
  accessible: false;
  error: "URL_NOT_ACCESSIBLE";
  message: "External URL returned 404 Not Found";
}
```

### Example

**Request**:
```bash
curl -X POST https://api.example.com/api/media/validate-url \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://i.imgur.com/abc123.jpg",
    "mediaType": "photo"
  }'
```

**Response (valid)**:
```json
{
  "valid": true,
  "accessible": true,
  "contentType": "image/jpeg",
  "contentLength": 1245678,
  "httpsOnly": true
}
```

**Response (invalid)**:
```json
{
  "valid": false,
  "accessible": false,
  "error": "URL_NOT_ACCESSIBLE",
  "message": "External URL returned 404 Not Found"
}
```

---

## Batch Upload (Future Enhancement)

**Method**: `POST`  
**Path**: `/api/media/batch-upload`  
**Content-Type**: `multipart/form-data`

Upload multiple photos in a single request (up to 50 files).

**Note**: Not required for MVP. Implement in Phase 2 if manual upload workflow becomes cumbersome.

---

## Security Considerations

1. **Authentication**: All endpoints require valid contributor session (feature 003)
2. **File Validation**: 
   - Verify file magic bytes match extension
   - Scan for malware (optional, using Cloudflare Workers)
   - Reject executable files disguised as images/videos
3. **Rate Limiting**: 
   - Max 100 uploads per hour per contributor
   - Implemented via Cloudflare KV or Workers rate limiting
4. **CORS**: Allow uploads only from blog domain
5. **Storage Quotas**: Monitor Cloudflare Images/R2 usage, alert at 80% quota

---

## Implementation Notes

### Cloudflare Images Upload Flow

1. Contributor uploads file via API
2. Worker validates file (type, size)
3. Worker uploads to Cloudflare Images API
4. Cloudflare Images returns image ID
5. Worker creates PhotoContent record in D1
6. Return image ID and variant URLs to client

### R2 Upload Flow

1. Contributor uploads file via API
2. Worker validates file (type, size, codec)
3. Worker uploads to R2 bucket with unique key
4. Generate thumbnail (optional, using FFmpeg in Worker or external service)
5. Worker creates VideoContent record in D1
6. Return R2 public URL to client

### Progress Tracking

For large files (videos), implement chunked upload:
- Client splits file into chunks (e.g., 5MB each)
- Upload chunks sequentially with progress updates
- Worker assembles chunks in R2
- Return final URL when complete

**Alternative**: Use Cloudflare Images/R2 direct upload (signed URLs) to bypass Worker for large files.
