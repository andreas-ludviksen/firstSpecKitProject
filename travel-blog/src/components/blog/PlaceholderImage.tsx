/**
 * Placeholder Image Component
 * Feature: 004-modular-blog-posts
 * 
 * Displays placeholder for missing content (FR-016)
 */

import React from 'react';

export interface PlaceholderImageProps {
  width?: number | string;
  height?: number | string;
  text?: string;
  className?: string;
}

export const PlaceholderImage: React.FC<PlaceholderImageProps> = ({
  width = '100%',
  height = 300,
  text = 'No image',
  className = '',
}) => {
  return (
    <div
      className={`flex items-center justify-center bg-gray-200 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
      }}
    >
      <div className="text-center">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <p className="mt-2 text-sm font-medium">{text}</p>
      </div>
    </div>
  );
};

export interface PlaceholderImagesProps {
  count: number;
  className?: string;
  gridClassName?: string;
}

/**
 * Render multiple placeholder images for missing content slots
 */
export const PlaceholderImages: React.FC<PlaceholderImagesProps> = ({
  count,
  className = '',
  gridClassName = 'grid grid-cols-2 gap-4',
}) => {
  if (count <= 0) return null;

  return (
    <div className={gridClassName}>
      {Array.from({ length: count }).map((_, index) => (
        <PlaceholderImage
          key={`placeholder-${index}`}
          className={className}
          text={`Photo ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default PlaceholderImage;
