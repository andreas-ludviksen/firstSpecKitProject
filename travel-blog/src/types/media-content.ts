/**
 * Media Content Types
 * Feature: 004-modular-blog-posts
 * 
 * Types for photos, videos, and text content in blog posts
 */

export type MediaSource = 'upload' | 'apple-photos' | 'gopro-cloud' | 'external-url';
export type TextFormat = 'markdown' | 'html' | 'plaintext';

// Photo Content

export interface PhotoContent {
  id: string;
  postId: string;
  url: string;
  cloudflareImageId: string;
  caption?: string;
  altText: string;
  displayOrder: number;
  source: MediaSource;
  originalFilename?: string;
  uploadedAt: string; // ISO 8601
  width?: number;
  height?: number;
}

export interface PhotoUploadRequest {
  file: File;
  postId: string;
  caption?: string;
  altText: string;
  displayOrder: number;
  source: 'upload' | 'apple-photos';
}

export interface PhotoUploadResponse {
  photoId: string;
  url: string;
  cloudflareImageId: string;
  variants: {
    thumbnail: string;
    mobile: string;
    desktop: string;
    original: string;
  };
  width: number;
  height: number;
  uploadedAt: string;
}

export interface PhotoUpdateRequest {
  caption?: string;
  altText?: string;
  displayOrder?: number;
}

// Video Content

export interface VideoContent {
  id: string;
  postId: string;
  url: string;
  r2Key: string;
  caption?: string;
  displayOrder: number;
  source: MediaSource;
  originalFilename?: string;
  uploadedAt: string; // ISO 8601
  durationSeconds?: number;
  fileSizeMB?: number;
  format?: string;
  thumbnailUrl?: string;
}

export interface VideoUploadRequest {
  file: File;
  postId: string;
  caption?: string;
  displayOrder: number;
  source: 'upload' | 'gopro-cloud';
}

export interface VideoUploadResponse {
  videoId: string;
  url: string;
  r2Key: string;
  thumbnailUrl?: string;
  durationSeconds: number;
  fileSizeMB: number;
  format: string;
  uploadedAt: string;
}

export interface VideoUpdateRequest {
  caption?: string;
  displayOrder?: number;
}

// Text Content

export interface TextContent {
  id: string;
  postId: string;
  sectionName: string;
  content: string;
  format: TextFormat;
  displayOrder: number;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface TextCreateRequest {
  sectionName: string;
  content: string;
  format: TextFormat;
  displayOrder: number;
}

export interface TextUpdateRequest {
  sectionName?: string;
  content?: string;
  format?: TextFormat;
  displayOrder?: number;
}

// External URL Validation

export interface UrlValidationRequest {
  url: string;
  mediaType: 'photo' | 'video';
}

export interface UrlValidationResponse {
  valid: boolean;
  accessible: boolean;
  contentType: string;
  contentLength?: number;
  httpsOnly: boolean;
  warnings?: string[];
  error?: string;
  message?: string;
}

// Reorder Content

export interface ReorderRequest {
  contentType: 'photos' | 'videos' | 'text';
  order: {
    id: string;
    displayOrder: number;
  }[];
}

export interface ReorderResponse {
  updated: number;
  contentType: 'photos' | 'videos' | 'text';
}

// Image Variants for Cloudflare Images

export interface ImageVariants {
  thumbnail: string;  // 200x200
  mobile: string;     // 800x600
  desktop: string;    // 1920x1080
  original: string;   // Full resolution
}
