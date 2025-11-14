# API Contract: Create Blog Post

**Endpoint**: Post Creation API  
**Feature**: 004-modular-blog-posts  
**Version**: 1.0  
**Date**: 2025-11-14

## Overview

Creates a new blog post with initial metadata. Media and text content are added separately via update endpoints after post creation.

---

## Create Post

### Request

**Method**: `POST`  
**Path**: `/api/posts/create`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role from feature 003)

**Body**:
```typescript
{
  title: string;                // Post title (max 200 chars, required)
  designTemplateId: string;     // Template ID from DesignTemplate table
  slug?: string;                // Optional custom slug (auto-generated if omitted)
  status?: 'draft' | 'published'; // Default: 'draft'
}
```

**Validation Rules**:
- Title required, non-empty, max 200 characters
- Design template ID must reference existing, active template
- Slug auto-generated from title if not provided (lowercase, hyphens)
- Slug must be unique across all posts
- Status defaults to 'draft' if not specified

### Response

**Success (201 Created)**:
```typescript
{
  postId: string;               // UUID
  slug: string;                 // URL-friendly slug
  title: string;                // Post title
  authorId: string;             // Current user ID
  designTemplateId: string;     // Selected template ID
  status: 'draft' | 'published';
  createdAt: string;            // ISO 8601 timestamp
  updatedAt: string;            // ISO 8601 timestamp
  publishedAt?: string;         // ISO 8601 timestamp (if status='published')
  version: number;              // Optimistic concurrency version (starts at 1)
  urls: {
    view: string;               // Public view URL
    edit: string;               // Edit URL (contributor only)
  };
}
```

**Error Responses**:

*400 Bad Request*:
```typescript
{
  error: "VALIDATION_ERROR";
  message: string;
  details: {
    field: string;              // Field with error (e.g., "title", "slug")
    issue: string;              // Description of issue
  }[];
}
```

Examples:
- `{ error: "VALIDATION_ERROR", message: "Title is required", details: [{ field: "title", issue: "missing" }] }`
- `{ error: "VALIDATION_ERROR", message: "Slug already exists", details: [{ field: "slug", issue: "duplicate" }] }`
- `{ error: "VALIDATION_ERROR", message: "Invalid template ID", details: [{ field: "designTemplateId", issue: "not_found" }] }`

*401 Unauthorized*:
```typescript
{
  error: "AUTHENTICATION_REQUIRED";
  message: "Contributor authentication required";
}
```

*500 Internal Server Error*:
```typescript
{
  error: "DATABASE_ERROR";
  message: "Failed to create blog post";
}
```

### Example

**Request**:
```bash
curl -X POST https://api.example.com/api/posts/create \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Our Amazing Norwegian Fjords Adventure",
    "designTemplateId": "template-03",
    "status": "draft"
  }'
```

**Response**:
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "our-amazing-norwegian-fjords-adventure",
  "title": "Our Amazing Norwegian Fjords Adventure",
  "authorId": "user-123",
  "designTemplateId": "template-03",
  "status": "draft",
  "createdAt": "2025-11-14T10:00:00Z",
  "updatedAt": "2025-11-14T10:00:00Z",
  "version": 1,
  "urls": {
    "view": "https://blog.example.com/posts/our-amazing-norwegian-fjords-adventure",
    "edit": "https://blog.example.com/admin/posts/550e8400-e29b-41d4-a716-446655440000/edit"
  }
}
```

---

## Get Post Details

### Request

**Method**: `GET`  
**Path**: `/api/posts/{postId}`  
**Authentication**: Optional (public for published posts, required for drafts)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier

**Query Parameters**:
- `includeContent` (boolean, optional): Include photos, videos, text content (default: false)

### Response

**Success (200 OK)**:
```typescript
{
  postId: string;
  slug: string;
  title: string;
  authorId: string;
  designTemplateId: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  version: number;
  template?: {                  // Template metadata (if includeContent=false)
    id: string;
    name: string;
    description: string;
    previewImageUrl: string;
  };
  content?: {                   // Full content (if includeContent=true)
    photos: PhotoContent[];
    videos: VideoContent[];
    text: TextContent[];
  };
}
```

**Error Responses**:

*404 Not Found*:
```typescript
{
  error: "POST_NOT_FOUND";
  message: "Blog post not found or not accessible";
}
```

*403 Forbidden* (for draft posts without authentication):
```typescript
{
  error: "UNAUTHORIZED";
  message: "Draft posts are only visible to contributors";
}
```

### Example

**Request**:
```bash
curl -X GET "https://api.example.com/api/posts/550e8400-e29b-41d4-a716-446655440000?includeContent=true" \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "our-amazing-norwegian-fjords-adventure",
  "title": "Our Amazing Norwegian Fjords Adventure",
  "authorId": "user-123",
  "designTemplateId": "template-03",
  "status": "published",
  "createdAt": "2025-11-14T10:00:00Z",
  "updatedAt": "2025-11-14T15:30:00Z",
  "publishedAt": "2025-11-14T15:30:00Z",
  "version": 3,
  "content": {
    "photos": [
      {
        "id": "photo-001",
        "url": "https://imagedelivery.net/{account}/abc123/desktop",
        "caption": "Stunning fjord view",
        "altText": "Blue fjord with mountains",
        "displayOrder": 0
      }
    ],
    "videos": [
      {
        "id": "video-001",
        "url": "https://pub-bucket.r2.dev/videos/550e8400/video-001.mp4",
        "caption": "Kayaking adventure",
        "displayOrder": 0
      }
    ],
    "text": [
      {
        "id": "text-001",
        "sectionName": "intro",
        "content": "## Our Adventure\n\nIn June 2025...",
        "format": "markdown",
        "displayOrder": 0
      }
    ]
  }
}
```

---

## List Posts

### Request

**Method**: `GET`  
**Path**: `/api/posts`  
**Authentication**: Optional (filters results based on auth)

**Query Parameters**:
- `status` (string, optional): Filter by status ('draft' | 'published', default: 'published' for public)
- `authorId` (string, optional): Filter by author
- `limit` (number, optional): Max results (default: 20, max: 100)
- `offset` (number, optional): Pagination offset (default: 0)
- `sortBy` (string, optional): Sort field ('createdAt' | 'publishedAt' | 'updatedAt', default: 'publishedAt')
- `sortOrder` (string, optional): Sort direction ('asc' | 'desc', default: 'desc')

### Response

**Success (200 OK)**:
```typescript
{
  posts: {
    postId: string;
    slug: string;
    title: string;
    authorId: string;
    designTemplateId: string;
    status: 'draft' | 'published';
    createdAt: string;
    updatedAt: string;
    publishedAt?: string;
    preview: {
      firstPhoto?: string;      // URL of first photo (for list thumbnail)
      textPreview?: string;     // First 150 chars of intro text
    };
  }[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}
```

### Example

**Request**:
```bash
curl -X GET "https://api.example.com/api/posts?status=published&limit=10&sortBy=publishedAt&sortOrder=desc"
```

**Response**:
```json
{
  "posts": [
    {
      "postId": "550e8400-e29b-41d4-a716-446655440000",
      "slug": "norwegian-fjords-adventure",
      "title": "Our Amazing Norwegian Fjords Adventure",
      "authorId": "user-123",
      "designTemplateId": "template-03",
      "status": "published",
      "createdAt": "2025-11-14T10:00:00Z",
      "updatedAt": "2025-11-14T15:30:00Z",
      "publishedAt": "2025-11-14T15:30:00Z",
      "preview": {
        "firstPhoto": "https://imagedelivery.net/{account}/abc123/thumbnail",
        "textPreview": "In June 2025, we embarked on an incredible journey through Norway's stunning fjords..."
      }
    }
  ],
  "pagination": {
    "total": 42,
    "limit": 10,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Delete Post

### Request

**Method**: `DELETE`  
**Path**: `/api/posts/{postId}`  
**Authentication**: Required (Contributor role, must be post author or admin)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier

### Response

**Success (204 No Content)**:
Empty response body.

**Error Responses**:

*404 Not Found*:
```typescript
{
  error: "POST_NOT_FOUND";
  message: "Blog post not found";
}
```

*403 Forbidden* (if not author):
```typescript
{
  error: "FORBIDDEN";
  message: "You can only delete your own posts";
}
```

### Example

**Request**:
```bash
curl -X DELETE https://api.example.com/api/posts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {token}"
```

**Response**:
204 No Content

**Note**: Deleting a post cascades to all associated content (photos, videos, text) due to foreign key constraints with `ON DELETE CASCADE`.

---

## Implementation Notes

### Slug Generation

Auto-generate slug from title:
1. Convert to lowercase
2. Replace spaces with hyphens
3. Remove special characters (keep alphanumeric and hyphens)
4. Trim leading/trailing hyphens
5. Append random suffix if duplicate (e.g., `-2`, `-3`)

Example: "Our Amazing Trip!" → "our-amazing-trip"

### Optimistic Concurrency

- `version` field incremented on every update
- Used by update/change-template endpoints to detect conflicts
- If client's version doesn't match DB version, return conflict error (handled via last-save-wins in FR-018)

### Permissions

- **Create**: Any authenticated contributor
- **Read**: Public for published posts, contributor-only for drafts
- **Update/Delete**: Post author or admin role only

### Caching

- Published posts: Cache GET responses for 5 minutes (CDN/edge cache)
- Draft posts: No caching
- Invalidate cache on update/delete/publish
