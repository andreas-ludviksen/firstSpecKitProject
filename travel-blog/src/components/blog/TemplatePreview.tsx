/**
 * Template Preview Component
 * Feature: 004-modular-blog-posts
 * 
 * Shows mockup of how template will look with content
 */

'use client';

import { type Template } from './TemplateSelector';

interface TemplatePreviewProps {
  template: Template;
  photos?: number;
  videos?: number;
  textBlocks?: number;
}

export default function TemplatePreview({
  template,
  photos = 0,
  videos = 0,
  textBlocks = 0,
}: TemplatePreviewProps) {
  // Generate placeholder blocks based on template capacity
  const photoPlaceholders = Array.from({ length: Math.min(photos, template.maxPhotos) }, (_, i) => i);
  const videoPlaceholders = Array.from({ length: Math.min(videos, template.maxVideos) }, (_, i) => i);
  const textPlaceholders = Array.from({ length: Math.min(textBlocks, template.maxTextBlocks) }, (_, i) => i);

  // Template-specific layouts (simplified mockups)
  const renderLayout = () => {
    switch (template.id) {
      case '1': // Classic Grid
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              {photoPlaceholders.slice(0, 6).map(i => (
                <div key={i} className="aspect-square bg-blue-100 rounded" />
              ))}
            </div>
            {textPlaceholders.map(i => (
              <div key={i} className="h-12 bg-gray-100 rounded" />
            ))}
          </div>
        );

      case '2': // Story Layout
        return (
          <div className="space-y-3">
            {photoPlaceholders.map(i => (
              <div key={i} className="aspect-video bg-blue-100 rounded" />
            ))}
            {textPlaceholders.map(i => (
              <div key={i} className="h-16 bg-gray-100 rounded" />
            ))}
          </div>
        );

      case '3': // Photo Grid
        return (
          <div className="grid grid-cols-4 gap-1">
            {photoPlaceholders.map(i => (
              <div key={i} className="aspect-square bg-blue-100 rounded" />
            ))}
          </div>
        );

      case '4': // Video-First
        return (
          <div className="space-y-3">
            {videoPlaceholders.length > 0 && (
              <div className="aspect-video bg-purple-100 rounded" />
            )}
            <div className="grid grid-cols-3 gap-2">
              {photoPlaceholders.slice(0, 6).map(i => (
                <div key={i} className="aspect-square bg-blue-100 rounded" />
              ))}
            </div>
          </div>
        );

      case '5': // Masonry
        return (
          <div className="columns-3 gap-2">
            {photoPlaceholders.map(i => (
              <div 
                key={i} 
                className="mb-2 bg-blue-100 rounded break-inside-avoid"
                style={{ height: `${80 + (i % 3) * 40}px` }}
              />
            ))}
          </div>
        );

      default:
        return (
          <div className="space-y-2">
            <div className="aspect-video bg-blue-100 rounded" />
            <div className="h-12 bg-gray-100 rounded" />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-900">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.description}</p>
      </div>

      {/* Mockup Preview */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="aspect-[16/10] overflow-hidden">
          <div className="scale-75 origin-top-left w-[133%] h-[133%]">
            {renderLayout()}
          </div>
        </div>
      </div>

      {/* Content Summary */}
      <div className="mt-4 flex justify-around text-center border-t pt-4">
        <div>
          <div className="text-2xl font-bold text-blue-600">{photos}</div>
          <div className="text-xs text-gray-600">Photos</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-purple-600">{videos}</div>
          <div className="text-xs text-gray-600">Videos</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-gray-600">{textBlocks}</div>
          <div className="text-xs text-gray-600">Text Blocks</div>
        </div>
      </div>
    </div>
  );
}
