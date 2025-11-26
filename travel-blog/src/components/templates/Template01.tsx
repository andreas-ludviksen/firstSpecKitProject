/**
 * Template 01: Classic Grid
 * Feature: 004-modular-blog-posts
 * 
 * 3-column photo grid with text sections
 * Capacity: 12 photos, 2 videos, 5 text blocks
 */

'use client';

import Image from 'next/image';
import { PlaceholderImages } from '@/components/blog/PlaceholderImage';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  altText: string;
  displayOrder: number;
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
  coverImage: string | null;
  publishedAt: string | null;
}

interface PostContent {
  photos: Photo[];
  videos: Video[];
  textBlocks: TextBlock[];
}

interface Template01Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template01({ post, content }: Template01Props) {
  const maxPhotos = 12;
  const maxVideos = 2;
  const maxTextBlocks = 5;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  // FR-016: Calculate missing slots for placeholders
  const missingPhotoSlots = Math.max(0, 6 - photos.length); // Show at least 6 slots

  return (
    <article className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-xl text-gray-600 mb-6">{post.description}</p>
        )}
        {post.publishedAt && (
          <time 
            dateTime={post.publishedAt}
            className="text-sm text-gray-500"
          >
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </header>

      {/* Cover Image or Video */}
      {post.coverImage && (
        <div className="mb-12 aspect-[21/9] rounded-xl overflow-hidden shadow-lg">
          <Image
            src={post.coverImage}
            alt={post.title}
            width={1920}
            height={823}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* First Text Block (Introduction) */}
      {textBlocks[0] && (
        <div className="max-w-4xl mx-auto mb-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: textBlocks[0].content }}
          />
        </div>
      )}

      {/* Featured Video (if available) */}
      {videos[0] && (
        <div className="max-w-5xl mx-auto mb-12">
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900">
            <video
              src={videos[0].url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full"
              poster={videos[0].thumbnailUrl || undefined}
              controlsList="nodownload"
              crossOrigin="anonymous"
            />
          </div>
          {videos[0].caption && (
            <p className="text-center text-gray-600 mt-3 italic">
              {videos[0].caption}
            </p>
          )}
        </div>
      )}

      {/* Second Text Block */}
      {textBlocks[1] && (
        <div className="max-w-4xl mx-auto mb-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: textBlocks[1].content }}
          />
        </div>
      )}

      {/* 3-Column Photo Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photos.map((photo) => (
            <div key={photo.id} className="group">
              <div className="aspect-square rounded-lg overflow-hidden shadow-md">
                <Image
                  src={photo.url}
                  alt={photo.altText}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {photo.caption && (
                <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
              )}
            </div>
          ))}
          
          {/* FR-016: Placeholders for missing content */}
          {missingPhotoSlots > 0 && (
            <PlaceholderImages 
              count={missingPhotoSlots}
              gridClassName="contents"
            />
          )}
        </div>
      </div>

      {/* Third Text Block */}
      {textBlocks[2] && (
        <div className="max-w-4xl mx-auto mb-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: textBlocks[2].content }}
          />
        </div>
      )}

      {/* Second Video (if available) */}
      {videos[1] && (
        <div className="max-w-5xl mx-auto mb-12">
          <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900">
            <video
              src={videos[1].url}
              controls
              playsInline
              preload="metadata"
              className="w-full h-full"
              poster={videos[1].thumbnailUrl || undefined}
              controlsList="nodownload"
              crossOrigin="anonymous"
            />
          </div>
          {videos[1].caption && (
            <p className="text-center text-gray-600 mt-3 italic">
              {videos[1].caption}
            </p>
          )}
        </div>
      )}

      {/* Fourth & Fifth Text Blocks */}
      {(textBlocks[3] || textBlocks[4]) && (
        <div className="max-w-4xl mx-auto space-y-8">
          {textBlocks[3] && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textBlocks[3].content }}
            />
          )}
          {textBlocks[4] && (
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textBlocks[4].content }}
            />
          )}
        </div>
      )}
    </article>
  );
}
