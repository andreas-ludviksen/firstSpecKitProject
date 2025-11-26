# Cloudflare Stream Setup Guide

This document explains how to set up and test Cloudflare Stream for automatic video encoding and delivery.

## What is Cloudflare Stream?

Cloudflare Stream is a video encoding and delivery service that:
- **Automatically encodes** videos to web-compatible formats (H.264/AAC)
- **Supports all devices** including iOS Safari  
- **Adaptive bitrate streaming** for optimal quality based on connection
- **Built-in player** with HLS and DASH support
- **Thumbnails** automatically generated

### Pricing
- $5/1,000 minutes of video storage
- $1/1,000 minutes of video delivered
- No upfront costs, pay only for what you use

## Setup Instructions

### 1. Enable Cloudflare Stream

1. Log in to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Select your account
3. Go to **Stream** in the sidebar
4. Click **Get Started** or **Enable Stream**

### 2. Get API Credentials

1. In the Stream dashboard, go to **API tokens**
2. Click **Create Token**
3. Template: **Edit Cloudflare Stream**
4. Permissions: `Stream:Edit`
5. Copy the generated API token
6. Note your **Account ID** from the dashboard

### 3. Configure Worker Secrets

```bash
# Navigate to media worker directory
cd travel-blog/workers/media-upload

# Set Account ID (same for both environments)
npx wrangler secret put CLOUDFLARE_ACCOUNT_ID

# Set Stream API Token for production
npx wrangler secret put CLOUDFLARE_STREAM_API_TOKEN

# Set Stream API Token for dev environment
npx wrangler secret put CLOUDFLARE_STREAM_API_TOKEN --env dev
```

### 4. Create Dev R2 Bucket (Optional)

If you want to test in dev environment:

```bash
npx wrangler r2 bucket create travel-blog-media-dev
```

### 5. Deploy Workers

```bash
# Deploy to production
npx wrangler deploy

# Deploy to dev environment
npx wrangler deploy --env dev
```

## Testing

### Using the New Endpoint

The Stream endpoint is separate from the R2 endpoint:

- **R2 Upload (existing)**: `POST /api/media/upload-video`
- **Stream Upload (new)**: `POST /api/media/upload-video-stream`

### Test Stream Upload

```bash
curl -X POST https://travel-blog-media.YOUR-ACCOUNT.workers.dev/api/media/upload-video-stream \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "video=@test-video.mp4" \
  -F "postId=YOUR_POST_ID" \
  -F "caption=Test video via Stream"
```

### Response Format

```json
{
  "success": true,
  "video": {
    "id": "uuid-in-database",
    "streamId": "cloudflare-stream-uid",
    "url": "https://customer-xxx.cloudflarestream.com/xxx/manifest/video.m3u8",
    "thumbnailUrl": "https://customer-xxx.cloudflarestream.com/xxx/thumbnails/thumbnail.jpg",
    "duration": 30.5,
    "width": 1920,
    "height": 1080,
    "fileSizeMB": 12.5,
    "format": "video/mp4",
    "readyToStream": false,
    "status": "queued"
  }
}
```

### Video Processing States

- `queued` - Waiting to be encoded
- `inprogress` - Currently encoding
- `ready` - Ready to stream
- `error` - Failed to encode

Stream videos take time to encode (usually 1-5 minutes depending on length).

## Frontend Integration

### Option 1: Use Stream's Built-in Player

The `url` field contains an HLS manifest that works with Stream's player or any HLS-compatible player.

```tsx
<video
  src={video.url}
  controls
  playsInline
  preload="metadata"
/>
```

### Option 2: Use Cloudflare Stream Player

```html
<stream src="STREAM_VIDEO_ID" controls></stream>
<script src="https://embed.cloudflarestream.com/embed/sdk.latest.js"></script>
```

## Switching Between R2 and Stream

You can choose which upload method to use per video:

1. **R2** - For videos you've already converted to web-compatible format
2. **Stream** - For raw videos that need automatic encoding

The database schema supports both via the `stream_id` column.

## Environments

### Production
- Worker: `travel-blog-media`
- R2 Bucket: `travel-blog-media`
- Deploy: `npx wrangler deploy`

### Development  
- Worker: `travel-blog-media-dev`
- R2 Bucket: `travel-blog-media-dev`
- Deploy: `npx wrangler deploy --env dev`

## Cost Estimation

Example for a travel blog with moderate usage:

- **10 videos/month** × 2 minutes average = 20 minutes stored
- **100 views/month** × 2 minutes = 200 minutes delivered

**Monthly cost:**
- Storage: 20 ÷ 1000 × $5 = $0.10
- Delivery: 200 ÷ 1000 × $1 = $0.20
- **Total: ~$0.30/month**

## Troubleshooting

### Video not playing on iOS

1. Check if `readyToStream` is `true` - encoding may still be in progress
2. Ensure `playsInline` attribute is set on `<video>` tag
3. Verify CORS headers are properly configured

### Upload fails with 401

- Check that `CLOUDFLARE_STREAM_API_TOKEN` secret is set correctly
- Verify the API token has `Stream:Edit` permissions

### Video shows "processing" forever

1. Check Stream dashboard for errors
2. Look at worker logs: `npx wrangler tail travel-blog-media`
3. Verify video file is in a supported format (MP4, MOV, WebM, AVI)

## Reverting to R2 Only

If you decide not to use Stream:

1. Update frontend to use `/api/media/upload-video` endpoint only
2. Remove `CLOUDFLARE_STREAM_API_TOKEN` secret
3. Optionally remove the Stream route from `media-upload/index.ts`

No data is lost - videos uploaded to R2 will continue working.
