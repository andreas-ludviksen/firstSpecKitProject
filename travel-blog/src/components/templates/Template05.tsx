/**
 * Template 05: Masonry Layout
 * Feature: 004-modular-blog-posts
 * 
 * Pinterest-style masonry grid
 * Capacity: 15 photos, 2 videos, 6 text blocks
 */

'use client';

import Image from 'next/image';

interface Photo {
  id: string;
  url: string;
  caption: string | null;
  altText: string;
  width?: number | null;
  height?: number | null;
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

interface Template05Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template05({ post, content }: Template05Props) {
  const maxPhotos = 15;
  const maxVideos = 2;
  const maxTextBlocks = 6;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  // Interleave all content for masonry
  const allItems = [
    ...photos.map((p, i) => ({ type: 'photo' as const, data: p, order: i * 2 })),
    ...videos.map((v, i) => ({ type: 'video' as const, data: v, order: photos.length + i * 3 })),
    ...textBlocks.map((t, i) => ({ type: 'text' as const, data: t, order: i * 2.5 })),
  ].sort((a, b) => a.order - b.order);

  const missingSlots = Math.max(0, 9 - photos.length);

  return (
    <article className="max-w-7xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="max-w-4xl mx-auto text-center mb-16">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-xl text-gray-600">{post.description}</p>
        )}
      </header>

      {/* Masonry Grid */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {allItems.map((item) => {
          if (item.type === 'photo') {
            const aspectRatio = item.data.width && item.data.height
              ? item.data.width / item.data.height
              : 1;
            
            return (
              <div key={`photo-${item.data.id}`} className="break-inside-avoid mb-6">
                <div className="rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow">
                  <Image
                    src={item.data.url}
                    alt={item.data.altText}
                    width={800}
                    height={Math.round(800 / aspectRatio)}
                    className="w-full h-auto"
                  />
                </div>
                {item.data.caption && (
                  <p className="text-sm text-gray-600 mt-2 px-1">{item.data.caption}</p>
                )}
              </div>
            );
          }

          if (item.type === 'video') {
            return (
              <div key={`video-${item.data.id}`} className="break-inside-avoid mb-6">
                <div className="aspect-video rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-gray-900">
                  <video
                    src={item.data.url}
                    controls
                    className="w-full h-full"
                    poster={item.data.thumbnailUrl || undefined}
                  />
                </div>
                {item.data.caption && (
                  <p className="text-sm text-gray-600 mt-2 px-1">{item.data.caption}</p>
                )}
              </div>
            );
          }

          if (item.type === 'text') {
            return (
              <div 
                key={`text-${item.data.id}`} 
                className="break-inside-avoid mb-6 bg-white p-6 rounded-lg shadow-sm border border-gray-100"
              >
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: item.data.content }}
                />
              </div>
            );
          }

          return null;
        })}

        {/* FR-016: Add placeholders in grid */}
        {missingSlots > 0 && photos.length < 3 && (
          <>
            {Array.from({ length: missingSlots }).map((_, i) => (
              <div key={`placeholder-${i}`} className="break-inside-avoid mb-6">
                <div className="aspect-[3/4] bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Photo {photos.length + i + 1}</span>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </article>
  );
}
