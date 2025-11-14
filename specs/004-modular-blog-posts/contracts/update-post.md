# API Contract: Update Blog Post

**Endpoint**: Post Update API  
**Feature**: 004-modular-blog-posts  
**Version**: 1.0  
**Date**: 2025-11-14

## Overview

Updates blog post metadata and content. Supports partial updates (PATCH semantics). Implements optimistic concurrency with last-save-wins strategy (FR-018).

---

## Update Post Metadata

### Request

**Method**: `PATCH`  
**Path**: `/api/posts/{postId}`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role, must be post author)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier

**Body** (all fields optional):
```typescript
{
  title?: string;               // Update title (max 200 chars)
  slug?: string;                // Update slug (must be unique)
  status?: 'draft' | 'published'; // Publish or unpublish
  version?: number;             // Optimistic concurrency version (optional for last-save-wins)
}
```

**Optimistic Concurrency (FR-018)**:
- If `version` provided: Check against current DB version, reject if mismatch
- If `version` omitted: **Last-save-wins** - overwrite regardless of version
- Default behavior: Last-save-wins (no conflict errors)

### Response

**Success (200 OK)**:
```typescript
{
  postId: string;
  slug: string;
  title: string;
  status: 'draft' | 'published';
  updatedAt: string;            // ISO 8601 timestamp
  publishedAt?: string;         // Updated if status changed
  version: number;              // Incremented version
  conflicts?: {                 // Present if version conflict detected (informational)
    detectedVersion: number;
    providedVersion: number;
    resolution: 'overwrite';    // Always 'overwrite' for last-save-wins
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
    field: string;
    issue: string;
  }[];
}
```

*404 Not Found*:
```typescript
{
  error: "POST_NOT_FOUND";
  message: "Blog post not found";
}
```

*403 Forbidden*:
```typescript
{
  error: "FORBIDDEN";
  message: "You can only update your own posts";
}
```

### Example

**Request** (publish draft):
```bash
curl -X PATCH https://api.example.com/api/posts/550e8400-e29b-41d4-a716-446655440000 \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "published"
  }'
```

**Response**:
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "slug": "norwegian-fjords-adventure",
  "title": "Our Amazing Norwegian Fjords Adventure",
  "status": "published",
  "updatedAt": "2025-11-14T15:30:00Z",
  "publishedAt": "2025-11-14T15:30:00Z",
  "version": 2
}
```

---

## Add/Update Photo

### Request

**Method**: `PUT`  
**Path**: `/api/posts/{postId}/photos/{photoId}`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier
- `photoId` (string, UUID): Photo identifier (created via upload-media endpoint)

**Body**:
```typescript
{
  caption?: string;             // Update caption (max 500 chars)
  altText?: string;             // Update alt text (max 200 chars)
  displayOrder?: number;        // Update display order
}
```

**Note**: Photo URL/cloudflareImageId cannot be changed (immutable after upload).

### Response

**Success (200 OK)**:
```typescript
{
  photoId: string;
  caption?: string;
  altText: string;
  displayOrder: number;
  updatedAt: string;
}
```

---

## Remove Photo

### Request

**Method**: `DELETE`  
**Path**: `/api/posts/{postId}/photos/{photoId}`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier
- `photoId` (string, UUID): Photo identifier

### Response

**Success (204 No Content)**:
Empty response body.

**Note**: Photo removed from post, but Cloudflare Images resource remains (can be cleaned up later).

---

## Add/Update Video

### Request

**Method**: `PUT`  
**Path**: `/api/posts/{postId}/videos/{videoId}`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier
- `videoId` (string, UUID): Video identifier (created via upload-media endpoint)

**Body**:
```typescript
{
  caption?: string;             // Update caption (max 500 chars)
  displayOrder?: number;        // Update display order
}
```

### Response

**Success (200 OK)**:
```typescript
{
  videoId: string;
  caption?: string;
  displayOrder: number;
  updatedAt: string;
}
```

---

## Remove Video

### Request

**Method**: `DELETE`  
**Path**: `/api/posts/{postId}/videos/{videoId}`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier
- `videoId` (string, UUID): Video identifier

### Response

**Success (204 No Content)**:
Empty response body.

**Note**: Video removed from post, but R2 object remains (can be cleaned up later).

---

## Add/Update Text Section

### Request

**Method**: `PUT`  
**Path**: `/api/posts/{postId}/text/{textId}`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier
- `textId` (string, UUID): Text section identifier (or 'new' to create)

**Body**:
```typescript
{
  sectionName: string;          // Section identifier (e.g., "intro", "day1")
  content: string;              // Text content (Markdown or HTML)
  format: 'markdown' | 'html' | 'plaintext';
  displayOrder: number;         // Sort order
}
```

### Response

**Success (200 OK)** (update) or **201 Created** (new):
```typescript
{
  textId: string;
  sectionName: string;
  content: string;
  format: string;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
```

---

## Remove Text Section

### Request

**Method**: `DELETE`  
**Path**: `/api/posts/{postId}/text/{textId}`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier
- `textId` (string, UUID): Text section identifier

### Response

**Success (204 No Content)**:
Empty response body.

---

## Reorder Content

### Request

**Method**: `POST`  
**Path**: `/api/posts/{postId}/reorder`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Body**:
```typescript
{
  contentType: 'photos' | 'videos' | 'text';
  order: {
    id: string;                 // Content item ID
    displayOrder: number;       // New display order
  }[];
}
```

**Use Case**: Drag-and-drop reordering in UI updates all display orders in a single request.

### Response

**Success (200 OK)**:
```typescript
{
  updated: number;              // Count of items reordered
  contentType: 'photos' | 'videos' | 'text';
}
```

### Example

**Request**:
```bash
curl -X POST https://api.example.com/api/posts/550e8400/reorder \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "contentType": "photos",
    "order": [
      { "id": "photo-003", "displayOrder": 0 },
      { "id": "photo-001", "displayOrder": 1 },
      { "id": "photo-002", "displayOrder": 2 }
    ]
  }'
```

**Response**:
```json
{
  "updated": 3,
  "contentType": "photos"
}
```

---

## Implementation Notes

### Last-Save-Wins Strategy (FR-018)

1. **Default Behavior**: No version checking, always overwrite
2. **Conflict Detection**: If `version` provided and mismatches, log warning but still overwrite
3. **Response**: Include `conflicts` object if version mismatch detected (informational only)
4. **Rationale**: Simpler for family blog use case, acceptable data loss risk for low-frequency edits

**Example Conflict Scenario**:
- Contributor A loads post (version 2)
- Contributor B edits and saves (version → 3)
- Contributor A saves edits (version 2 provided)
- Result: A's changes overwrite B's (last-save-wins)
- Response includes `conflicts` object noting version mismatch

### Content Update Patterns

**Atomic Updates**:
- Each content type updated independently
- No transaction coordination across photos/videos/text
- Acceptable for blog post use case (eventual consistency)

**Bulk Operations**:
- Use reorder endpoint for efficient display order updates
- Minimize individual PUT requests

### Validation

- Ensure displayOrder is unique within content type per post
- Validate referenced IDs exist (photoId, videoId, textId)
- Enforce max lengths (title, caption, altText)

### Performance

- Index on `(postId, displayOrder)` for efficient content queries
- Cache published post content for 5 minutes
- Invalidate cache on any update
