/**
 * Design Template Types
 * Feature: 004-modular-blog-posts
 * 
 * Types for admin-managed design templates that define blog post layouts
 */

export type GridLayout = 'masonry' | 'grid-2col' | 'grid-3col' | 'single-column';

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  component: string; // React component name (e.g., "Template01")
  maxPhotos: number;
  maxVideos: number;
  requiredTextSections: string[]; // JSON array
  previewImageUrl: string;
  gridLayout: GridLayout;
  createdAt: string; // ISO 8601
  isActive: boolean;
}

export interface DesignTemplateMetadata {
  id: string;
  name: string;
  description: string;
  previewImageUrl: string;
  maxPhotos: number;
  maxVideos: number;
  gridLayout: GridLayout;
}

export interface TemplateChangeRequest {
  newTemplateId: string;
  reason?: string;
}

export interface TemplateChangeResponse {
  postId: string;
  previousTemplateId: string;
  newTemplateId: string;
  changedAt: string;
  changedBy: string;
  historyId: string;
  contentPreservation: {
    photosCount: number;
    videosCount: number;
    textSectionsCount: number;
    displayedPhotos: number;
    displayedVideos: number;
    warnings?: string[];
  };
}

export interface PostTemplateHistory {
  id: string;
  postId: string;
  templateId: string;
  templateName: string;
  changedAt: string;
  changedBy: string;
  changedByName?: string;
  previousTemplateId?: string;
  reason?: string;
}

export interface TemplateHistoryResponse {
  postId: string;
  currentTemplateId: string;
  history: PostTemplateHistory[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface TemplatePreviewRequest {
  templateId: string;
}

export interface TemplatePreviewResponse {
  postId: string;
  templateId: string;
  templateName: string;
  previewUrl: string; // Temporary URL (expires in 1 hour)
  contentSummary: {
    photosCount: number;
    videosCount: number;
    textSectionsCount: number;
    displayedPhotos: number;
    displayedVideos: number;
    warnings?: string[];
  };
}
