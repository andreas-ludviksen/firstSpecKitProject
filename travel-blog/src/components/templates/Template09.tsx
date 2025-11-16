/**
 * Template 09: Split Screen
 * Feature: 004-modular-blog-posts
 * 
 * Side-by-side split layout
 * Capacity: 10 photos, 2 videos, 6 text blocks
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

interface Template09Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template09({ post, content }: Template09Props) {
  const maxPhotos = 10;
  const maxVideos = 2;
  const maxTextBlocks = 6;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  const leftPhotos = photos.filter((_, i) => i % 2 === 0);
  const rightPhotos = photos.filter((_, i) => i % 2 === 1);
  const missingLeftSlots = Math.max(0, 3 - leftPhotos.length);
  const missingRightSlots = Math.max(0, 3 - rightPhotos.length);

  return (
    <article>
      {/* Full-Width Header */}
      <header className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-700 text-white px-4">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl md:text-8xl font-bold mb-6">{post.title}</h1>
          {post.description && (
            <p className="text-2xl md:text-3xl font-light">{post.description}</p>
          )}
        </div>
      </header>

      {/* Split Screen Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen">
        {/* Left Column */}
        <div className="bg-white p-8 lg:p-12 flex flex-col justify-center space-y-8">
          {/* Left Text */}
          {textBlocks.slice(0, 3).map((block) => (
            <div 
              key={block.id}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ))}

          {/* Left Photos */}
          {leftPhotos.length > 0 && (
            <div className="space-y-6">
              {leftPhotos.map((photo) => (
                <figure key={photo.id}>
                  <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={photo.url}
                      alt={photo.altText}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption className="text-sm text-gray-600 mt-2">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}

              {/* FR-016: Placeholders */}
              {missingLeftSlots > 0 && leftPhotos.length === 0 && (
                <div className="grid grid-cols-1 gap-6">
                  <PlaceholderImages 
                    count={missingLeftSlots}
                    gridClassName="contents"
                  />
                </div>
              )}
            </div>
          )}

          {/* Left Video */}
          {videos[0] && (
            <figure>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <video
                  src={videos[0].url}
                  controls
                  className="w-full h-full"
                  poster={videos[0].thumbnailUrl || undefined}
                />
              </div>
              {videos[0].caption && (
                <figcaption className="text-sm text-gray-600 mt-2">
                  {videos[0].caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>

        {/* Right Column */}
        <div className="bg-gray-50 p-8 lg:p-12 flex flex-col justify-center space-y-8">
          {/* Right Photos */}
          {rightPhotos.length > 0 && (
            <div className="space-y-6">
              {rightPhotos.map((photo) => (
                <figure key={photo.id}>
                  <div className="aspect-[4/3] overflow-hidden rounded-lg shadow-md">
                    <Image
                      src={photo.url}
                      alt={photo.altText}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption className="text-sm text-gray-600 mt-2">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}

              {/* FR-016: Placeholders */}
              {missingRightSlots > 0 && rightPhotos.length === 0 && (
                <div className="grid grid-cols-1 gap-6">
                  <PlaceholderImages 
                    count={missingRightSlots}
                    gridClassName="contents"
                  />
                </div>
              )}
            </div>
          )}

          {/* Right Text */}
          {textBlocks.slice(3).map((block) => (
            <div 
              key={block.id}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ))}

          {/* Right Video */}
          {videos[1] && (
            <figure>
              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <video
                  src={videos[1].url}
                  controls
                  className="w-full h-full"
                  poster={videos[1].thumbnailUrl || undefined}
                />
              </div>
              {videos[1].caption && (
                <figcaption className="text-sm text-gray-600 mt-2">
                  {videos[1].caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    </article>
  );
}
