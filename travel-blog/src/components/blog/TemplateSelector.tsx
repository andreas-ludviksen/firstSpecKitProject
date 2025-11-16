/**
 * Template Selector Component
 * Feature: 004-modular-blog-posts
 * 
 * Grid of template options with previews
 */

'use client';

import { useState } from 'react';

export interface Template {
  id: string;
  name: string;
  description: string;
  thumbnailUrl?: string;
  maxPhotos: number;
  maxVideos: number;
  maxTextBlocks: number;
}

interface TemplateSelectorProps {
  templates: Template[];
  selected: string | null;
  onSelect: (templateId: string) => void;
  showDetails?: boolean;
}

export default function TemplateSelector({
  templates,
  selected,
  onSelect,
  showDetails = false,
}: TemplateSelectorProps) {
  const [previewId, setPreviewId] = useState<string | null>(null);

  const selectedTemplate = templates.find(t => t.id === selected);

  return (
    <div className="space-y-4">
      {showDetails && selectedTemplate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-1">{selectedTemplate.name}</h3>
          <p className="text-sm text-blue-800 mb-2">{selectedTemplate.description}</p>
          <div className="flex gap-4 text-xs text-blue-700">
            <span>📷 {selectedTemplate.maxPhotos} photos</span>
            <span>🎥 {selectedTemplate.maxVideos} videos</span>
            <span>📝 {selectedTemplate.maxTextBlocks} text blocks</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onSelect(template.id)}
            onMouseEnter={() => setPreviewId(template.id)}
            onMouseLeave={() => setPreviewId(null)}
            className={`
              relative group text-left p-4 rounded-lg border-2 transition-all
              ${selected === template.id 
                ? 'border-blue-600 bg-blue-50 shadow-md' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-sm bg-white'
              }
            `}
          >
            {/* Template Preview Thumbnail */}
            {template.thumbnailUrl ? (
              <div className="aspect-video bg-gray-100 rounded mb-3 overflow-hidden">
                <img
                  src={template.thumbnailUrl}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded mb-3 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
                  />
                </svg>
              </div>
            )}

            {/* Template Info */}
            <div className="flex items-start justify-between mb-2">
              <h3 className={`font-semibold ${selected === template.id ? 'text-blue-900' : 'text-gray-900'}`}>
                {template.name}
              </h3>
              {selected === template.id && (
                <svg className="w-6 h-6 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>

            <p className={`text-sm mb-3 ${selected === template.id ? 'text-blue-800' : 'text-gray-600'}`}>
              {template.description}
            </p>

            {/* Template Capacity */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className={`px-2 py-1 rounded ${selected === template.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                📷 {template.maxPhotos}
              </span>
              <span className={`px-2 py-1 rounded ${selected === template.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                🎥 {template.maxVideos}
              </span>
              <span className={`px-2 py-1 rounded ${selected === template.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                📝 {template.maxTextBlocks}
              </span>
            </div>

            {/* Hover Preview Indicator */}
            {previewId === template.id && selected !== template.id && (
              <div className="absolute inset-0 bg-blue-500 bg-opacity-5 rounded-lg pointer-events-none" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
