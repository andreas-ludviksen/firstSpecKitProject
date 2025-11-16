/**
 * Template 08: Timeline Journey
 * Feature: 004-modular-blog-posts
 * 
 * Chronological timeline with date markers
 * Capacity: 10 photos, 3 videos, 10 text blocks
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

interface Template08Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template08({ post, content }: Template08Props) {
  const maxPhotos = 10;
  const maxVideos = 3;
  const maxTextBlocks = 10;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  // Interleave content for timeline
  const timelineItems = [
    ...textBlocks.map((t, i) => ({ type: 'text' as const, data: t, order: i })),
    ...photos.map((p, i) => ({ type: 'photo' as const, data: p, order: i + 0.3 })),
    ...videos.map((v, i) => ({ type: 'video' as const, data: v, order: i * 2 + 0.6 })),
  ].sort((a, b) => a.order - b.order);

  const missingPhotoSlots = Math.max(0, 6 - photos.length);

  return (
    <article className="max-w-5xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="text-center mb-20">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">{post.description}</p>
        )}
        {post.publishedAt && (
          <time className="text-sm text-gray-500 mt-4 block">
            Journey from {new Date(post.publishedAt).toLocaleDateString('en-US', {
              month: 'long',
              year: 'numeric'
            })}
          </time>
        )}
      </header>

      {/* Timeline */}
      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500 transform -translate-x-1/2 hidden md:block" />

        {/* Timeline Items */}
        <div className="space-y-16">
          {timelineItems.map((item, idx) => {
            const isLeft = idx % 2 === 0;

            if (item.type === 'text') {
              return (
                <div key={`text-${item.data.id}`} className="relative">
                  <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    {/* Timeline Dot */}
                    <div className="hidden md:block absolute top-0 left-1/2 w-4 h-4 bg-blue-500 rounded-full transform -translate-x-1/2 border-4 border-white shadow-lg" />
                    
                    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                      <div 
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: item.data.content }}
                      />
                    </div>
                  </div>
                </div>
              );
            }

            if (item.type === 'photo') {
              return (
                <div key={`photo-${item.data.id}`} className="relative">
                  <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    {/* Timeline Dot */}
                    <div className="hidden md:block absolute top-8 left-1/2 w-4 h-4 bg-purple-500 rounded-full transform -translate-x-1/2 border-4 border-white shadow-lg" />
                    
                    <div className="rounded-lg overflow-hidden shadow-lg">
                      <Image
                        src={item.data.url}
                        alt={item.data.altText}
                        width={800}
                        height={600}
                        className="w-full h-auto"
                      />
                    </div>
                    {item.data.caption && (
                      <p className="text-sm text-gray-600 mt-2 italic">{item.data.caption}</p>
                    )}
                  </div>
                </div>
              );
            }

            if (item.type === 'video') {
              return (
                <div key={`video-${item.data.id}`} className="relative">
                  <div className={`md:w-1/2 ${isLeft ? 'md:pr-12' : 'md:ml-auto md:pl-12'}`}>
                    {/* Timeline Dot */}
                    <div className="hidden md:block absolute top-8 left-1/2 w-4 h-4 bg-pink-500 rounded-full transform -translate-x-1/2 border-4 border-white shadow-lg" />
                    
                    <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                      <video
                        src={item.data.url}
                        controls
                        className="w-full h-full"
                        poster={item.data.thumbnailUrl || undefined}
                      />
                    </div>
                    {item.data.caption && (
                      <p className="text-sm text-gray-600 mt-2 italic">{item.data.caption}</p>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      </div>

      {/* FR-016: End of journey placeholders */}
      {missingPhotoSlots > 0 && photos.length < 3 && (
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4">
          <PlaceholderImages 
            count={missingPhotoSlots}
            gridClassName="contents"
          />
        </div>
      )}
    </article>
  );
}
