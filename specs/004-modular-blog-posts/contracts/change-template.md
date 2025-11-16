# API Contract: Change Design Template

**Endpoint**: Template Change API  
**Feature**: 004-modular-blog-posts  
**Version**: 1.0  
**Date**: 2025-11-14

## Overview

Changes the design template for an existing blog post. Content (photos, videos, text) remains unchanged (FR-009). Creates audit trail record in PostTemplateHistory (User Story 2, acceptance scenario 3).

---

## Change Template

### Request

**Method**: `PUT`  
**Path**: `/api/posts/{postId}/template`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier

**Body**:
```typescript
{
  newTemplateId: string;        // New template ID from DesignTemplate table
  reason?: string;              // Optional reason for change (max 500 chars)
}
```

**Validation**:
- New template ID must reference existing, active template
- Cannot set same template as current (no-op)
- Content preserved regardless of template requirements (FR-009)

### Response

**Success (200 OK)**:
```typescript
{
  postId: string;
  previousTemplateId: string;   // Old template ID
  newTemplateId: string;        // New template ID
  changedAt: string;            // ISO 8601 timestamp
  changedBy: string;            // Contributor ID who made change
  historyId: string;            // ID of new PostTemplateHistory record
  contentPreservation: {
    photosCount: number;        // Total photos in post
    videosCount: number;        // Total videos in post
    textSectionsCount: number;  // Total text sections in post
    displayedPhotos: number;    // Photos displayed in new template (may be < total)
    displayedVideos: number;    // Videos displayed in new template (may be < total)
    warnings?: string[];        // Warnings about content overflow/underflow
  };
}
```

**Warning Examples** (FR-016, FR-017):
- `"New template displays only 10 photos, but post has 15 photos. 5 photos will be hidden."`
- `"New template requires 5 text sections, but post has only 2. Placeholders will be shown."`

**Error Responses**:

*400 Bad Request*:
```typescript
{
  error: "VALIDATION_ERROR";
  message: string;
  details?: {
    field: string;
    issue: string;
  };
}
```

Examples:
- `{ error: "VALIDATION_ERROR", message: "Template ID does not exist", details: { field: "newTemplateId", issue: "not_found" } }`
- `{ error: "VALIDATION_ERROR", message: "Template is inactive", details: { field: "newTemplateId", issue: "inactive" } }`
- `{ error: "VALIDATION_ERROR", message: "Template is already applied", details: { field: "newTemplateId", issue: "no_change" } }`

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
  message: "Only contributors can change templates";
}
```

### Example

**Request**:
```bash
curl -X PUT https://api.example.com/api/posts/550e8400-e29b-41d4-a716-446655440000/template \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "newTemplateId": "template-05",
    "reason": "Better layout for large photo galleries"
  }'
```

**Response**:
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "previousTemplateId": "template-03",
  "newTemplateId": "template-05",
  "changedAt": "2025-11-14T16:45:00Z",
  "changedBy": "user-123",
  "historyId": "history-abc123",
  "contentPreservation": {
    "photosCount": 15,
    "videosCount": 2,
    "textSectionsCount": 3,
    "displayedPhotos": 10,
    "displayedVideos": 2,
    "warnings": [
      "New template displays only 10 photos, but post has 15 photos. 5 photos will be hidden."
    ]
  }
}
```

---

## Get Template Change History

### Request

**Method**: `GET`  
**Path**: `/api/posts/{postId}/template/history`  
**Authentication**: Optional (public for published posts)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier

**Query Parameters**:
- `limit` (number, optional): Max results (default: 10, max: 50)
- `offset` (number, optional): Pagination offset (default: 0)

### Response

**Success (200 OK)**:
```typescript
{
  postId: string;
  currentTemplateId: string;    // Current active template
  history: {
    id: string;                 // History record ID
    templateId: string;         // Template applied
    templateName: string;       // Template display name
    changedAt: string;          // ISO 8601 timestamp
    changedBy: string;          // Contributor ID
    changedByName?: string;     // Contributor display name (if available)
    previousTemplateId?: string; // Previous template (null for first)
    reason?: string;            // Optional reason provided
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
curl -X GET "https://api.example.com/api/posts/550e8400/template/history?limit=5"
```

**Response**:
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "currentTemplateId": "template-05",
  "history": [
    {
      "id": "history-abc123",
      "templateId": "template-05",
      "templateName": "Photo Gallery Showcase",
      "changedAt": "2025-11-14T16:45:00Z",
      "changedBy": "user-123",
      "changedByName": "Alice Smith",
      "previousTemplateId": "template-03",
      "reason": "Better layout for large photo galleries"
    },
    {
      "id": "history-def456",
      "templateId": "template-03",
      "templateName": "Photo Grid Showcase",
      "changedAt": "2025-11-14T10:00:00Z",
      "changedBy": "user-123",
      "changedByName": "Alice Smith",
      "previousTemplateId": null,
      "reason": null
    }
  ],
  "pagination": {
    "total": 2,
    "limit": 5,
    "offset": 0,
    "hasMore": false
  }
}
```

---

## Preview Template

### Request

**Method**: `POST`  
**Path**: `/api/posts/{postId}/template/preview`  
**Content-Type**: `application/json`  
**Authentication**: Required (Contributor role)

**Path Parameters**:
- `postId` (string, UUID): Blog post identifier

**Body**:
```typescript
{
  templateId: string;           // Template ID to preview
}
```

**Purpose**: Preview how post content will look in a different template without actually changing the template (User Story 3, acceptance scenario 2).

### Response

**Success (200 OK)**:
```typescript
{
  postId: string;
  templateId: string;
  templateName: string;
  previewUrl: string;           // Temporary preview URL (expires in 1 hour)
  contentSummary: {
    photosCount: number;
    videosCount: number;
    textSectionsCount: number;
    displayedPhotos: number;    // How many photos template will show
    displayedVideos: number;    // How many videos template will show
    warnings?: string[];        // Content overflow/underflow warnings
  };
}
```

**Error Responses**:

*400 Bad Request*:
```typescript
{
  error: "INVALID_TEMPLATE_ID";
  message: "Template ID does not exist or is inactive";
}
```

*404 Not Found*:
```typescript
{
  error: "POST_NOT_FOUND";
  message: "Blog post not found";
}
```

### Example

**Request**:
```bash
curl -X POST https://api.example.com/api/posts/550e8400/template/preview \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "templateId": "template-07"
  }'
```

**Response**:
```json
{
  "postId": "550e8400-e29b-41d4-a716-446655440000",
  "templateId": "template-07",
  "templateName": "Video-First Layout",
  "previewUrl": "https://blog.example.com/preview/550e8400?template=template-07&token=xyz",
  "contentSummary": {
    "photosCount": 15,
    "videosCount": 2,
    "textSectionsCount": 3,
    "displayedPhotos": 6,
    "displayedVideos": 2,
    "warnings": [
      "This template displays only 6 photos, but post has 15 photos. 9 photos will be hidden."
    ]
  }
}
```

---

## Implementation Notes

### Content Preservation (FR-009)

**Database Updates**:
1. Update `blog_posts.design_template_id` to new template ID
2. Insert record into `post_template_history` table
3. Increment `blog_posts.version` (optimistic concurrency)
4. Update `blog_posts.updated_at` timestamp

**Critical**: No changes to `photo_content`, `video_content`, or `text_content` tables.

### Content Display Logic (FR-016, FR-017)

**In Template Components**:
```typescript
// Template limits
const maxPhotos = template.maxPhotos; // e.g., 10
const photos = post.photos; // e.g., 15 photos

// Display logic
const displayedPhotos = photos.slice(0, maxPhotos); // First 10
const hiddenPhotos = photos.slice(maxPhotos); // Remaining 5

// Underflow handling
const requiredPhotos = maxPhotos; // 10
const placeholderCount = Math.max(0, requiredPhotos - photos.length);
```

### Audit Trail

**PostTemplateHistory Records**:
- Created on every template change
- Never deleted (permanent audit trail)
- Used for "view history" feature (User Story 2, scenario 3)
- Queryable by postId, sorted by changedAt descending

### Preview URL Generation

**Temporary Preview**:
- Generate signed URL with short expiry (1 hour)
- URL includes template ID as query parameter
- Frontend renders post with preview template (not saved)
- Preview not visible to public (requires auth token)

**Implementation**:
```
https://blog.example.com/preview/{postId}?template={templateId}&token={signedToken}
```

### Performance Considerations

**Template Change Impact**:
- **Static Site**: Requires rebuild/regeneration of post page
- **Dynamic Site**: Immediate change on next page load
- **Cache Invalidation**: Clear CDN cache for post URL
- **Build Time**: If using static generation, trigger incremental rebuild

**Optimization**:
- Consider client-side template switching for preview (no backend call)
- Cache template metadata to avoid repeated queries

### Edge Cases

**Template Deleted**:
- If currently active template is deleted/deactivated, post displays with fallback template
- Force template change to active template before deleting

**Content Requirements**:
- Templates may have `requiredTextSections` (e.g., "intro")
- If missing: Display placeholder or warning (don't block template change)
