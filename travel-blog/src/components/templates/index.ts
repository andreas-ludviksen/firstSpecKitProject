/**
 * Template Registry
 * Feature: 004-modular-blog-posts
 * 
 * Maps template IDs to their React components for dynamic loading.
 * This registry enables the PostRenderer to dynamically import templates
 * based on the template ID stored in the blog_posts table.
 */

import dynamic from 'next/dynamic';

// Dynamically import all templates
export const templateComponents = {
  'template-01': dynamic(() => import('./Template01')),
  'template-02': dynamic(() => import('./Template02')),
  'template-03': dynamic(() => import('./Template03')),
  'template-04': dynamic(() => import('./Template04')),
  'template-05': dynamic(() => import('./Template05')),
  'template-06': dynamic(() => import('./Template06')),
  'template-07': dynamic(() => import('./Template07')),
  'template-08': dynamic(() => import('./Template08')),
  'template-09': dynamic(() => import('./Template09')),
  'template-10': dynamic(() => import('./Template10')),
} as const;

// Type-safe template ID
export type TemplateId = keyof typeof templateComponents;

// Validation helper
export function isValidTemplateId(id: string): id is TemplateId {
  return id in templateComponents;
}

// Get template component by ID
export function getTemplateComponent(templateId: string) {
  if (!isValidTemplateId(templateId)) {
    console.error(`Invalid template ID: ${templateId}`);
    return null;
  }
  return templateComponents[templateId];
}

// Template metadata for UI display (matches database seed data)
export const templateMetadata = {
  'template-01': {
    name: 'Classic Grid',
    description: 'Traditional photo grid with interleaved text',
    maxPhotos: 12,
    maxVideos: 2,
    maxText: 5,
  },
  'template-02': {
    name: 'Story Layout',
    description: 'Narrative flow with text and media',
    maxPhotos: 8,
    maxVideos: 3,
    maxText: 8,
  },
  'template-03': {
    name: 'Photo Grid Showcase',
    description: 'Large photo grid, minimal text',
    maxPhotos: 20,
    maxVideos: 1,
    maxText: 3,
  },
  'template-04': {
    name: 'Video-First Layout',
    description: 'Hero video with photo gallery',
    maxPhotos: 10,
    maxVideos: 3,
    maxText: 4,
  },
  'template-05': {
    name: 'Masonry Layout',
    description: 'Pinterest-style masonry grid',
    maxPhotos: 15,
    maxVideos: 2,
    maxText: 6,
  },
  'template-06': {
    name: 'Minimal Clean',
    description: 'Clean typography-focused layout',
    maxPhotos: 8,
    maxVideos: 1,
    maxText: 10,
  },
  'template-07': {
    name: 'Magazine Style',
    description: 'Editorial magazine layout',
    maxPhotos: 12,
    maxVideos: 2,
    maxText: 8,
  },
  'template-08': {
    name: 'Timeline Journey',
    description: 'Chronological timeline layout',
    maxPhotos: 10,
    maxVideos: 3,
    maxText: 10,
  },
  'template-09': {
    name: 'Split Screen',
    description: 'Side-by-side split layout',
    maxPhotos: 10,
    maxVideos: 2,
    maxText: 6,
  },
  'template-10': {
    name: 'Collage Mix',
    description: 'Creative mixed media collage',
    maxPhotos: 15,
    maxVideos: 3,
    maxText: 5,
  },
} as const;
