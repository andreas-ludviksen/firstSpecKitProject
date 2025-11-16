/**
 * Template 03: Photo Grid Showcase
 * Feature: 004-modular-blog-posts
 * 
 * Large photo grid, minimal text
 * Capacity: 20 photos, 1 video, 3 text blocks
 */

'use client';

import Image from 'next/image';
import { PlaceholderImages } from '@/components/blog/PlaceholderImage';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  altText: string;
}

interface Video {
  id: string;
  url: string;
  caption: string | null;
  thumbnailUrl?: string | null;
}

interface TextBlock {
  id: string;
  content: string;
}

interface BlogPost {
  title: string;
  description: string | null;
  publishedAt: string | null;
}

interface PostContent {
  photos: Photo[];
  videos: Video[];
  textBlocks: TextBlock[];
}

interface Template03Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template03({ post, content }: Template03Props) {
  const maxPhotos = 20;
  const maxVideos = 1;
  const maxTextBlocks = 3;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  const missingSlots = Math.max(0, 12 - photos.length);

  return (
    <article className="max-w-7xl mx-auto px-4 py-12">
      {/* Minimal Header */}
      <header className="text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {post.description}
          </p>
        )}
      </header>

      {/* Intro Text */}
      {textBlocks[0] && (
        <div className="max-w-3xl mx-auto mb-16 text-center">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: textBlocks[0].content }}
          />
        </div>
      )}

      {/* Featured Video */}
      {videos[0] && (
        <div className="max-w-5xl mx-auto mb-16">
          <div className="aspect-video rounded-2xl overflow-hidden shadow-2xl bg-gray-900">
            <video
              src={videos[0].url}
              controls
              className="w-full h-full"
              poster={videos[0].thumbnailUrl || undefined}
            />
          </div>
        </div>
      )}

      {/* Large Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-16">
        {photos.map((photo, idx) => (
          <div 
            key={photo.id}
            className={`
              ${idx === 0 ? 'col-span-2 row-span-2' : ''}
              ${idx % 7 === 3 ? 'md:col-span-2' : ''}
            `}
          >
            <div className="aspect-square rounded-lg overflow-hidden shadow-md group">
              <Image
                src={photo.url}
                alt={photo.altText}
                width={800}
                height={800}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        ))}

        {/* FR-016: Placeholders */}
        {missingSlots > 0 && (
          <PlaceholderImages 
            count={missingSlots}
            gridClassName="contents"
          />
        )}
      </div>

      {/* Bottom Text */}
      {(textBlocks[1] || textBlocks[2]) && (
        <div className="max-w-3xl mx-auto space-y-8 text-center">
          {textBlocks[1] && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textBlocks[1].content }}
            />
          )}
          {textBlocks[2] && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textBlocks[2].content }}
            />
          )}
        </div>
      )}
    </article>
  );
}
