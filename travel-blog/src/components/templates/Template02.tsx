/**
 * Template 02: Story Layout
 * Feature: 004-modular-blog-posts
 * 
 * Single column storytelling layout
 * Capacity: 8 photos, 3 videos, 8 text blocks
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

interface Template02Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template02({ post, content }: Template02Props) {
  const maxPhotos = 8;
  const maxVideos = 3;
  const maxTextBlocks = 8;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  // Interleave content for story flow
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allContent: Array<{ type: 'photo' | 'video' | 'text'; data: any; index: number }> = [
    ...photos.map((p, i) => ({ type: 'photo' as const, data: p, index: i })),
    ...videos.map((v, i) => ({ type: 'video' as const, data: v, index: i })),
    ...textBlocks.map((t, i) => ({ type: 'text' as const, data: t, index: i })),
  ].sort((a, b) => {
    // Simple interleaving: text, photo, text, video, text, photo, etc.
    const order = { text: 0, photo: 1, video: 2 };
    return (order[a.type] + a.index * 3) - (order[b.type] + b.index * 3);
  });

  return (
    <article className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <header className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-xl text-gray-600 mb-6 leading-relaxed">
            {post.description}
          </p>
        )}
        {post.publishedAt && (
          <time 
            dateTime={post.publishedAt}
            className="text-sm text-gray-500 uppercase tracking-wide"
          >
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        )}
      </header>

      {/* Story Content (Interleaved) */}
      <div className="space-y-10">
        {allContent.map((item) => {
          if (item.type === 'photo') {
            return (
              <div key={`photo-${item.data.id}`} className="space-y-3">
                <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
                  <Image
                    src={item.data.url}
                    alt={item.data.altText}
                    width={1200}
                    height={900}
                    className="w-full h-full object-cover"
                  />
                </div>
                {item.data.caption && (
                  <p className="text-center text-gray-600 italic text-sm">
                    {item.data.caption}
                  </p>
                )}
              </div>
            );
          }

          if (item.type === 'video') {
            return (
              <div key={`video-${item.data.id}`} className="space-y-3">
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg bg-gray-900">
                  <video
                    src={item.data.url}
                    controls
                    playsInline
                    preload="metadata"
                    className="w-full h-full"
                    poster={item.data.thumbnailUrl || undefined}
                    controlsList="nodownload"
                    crossOrigin="anonymous"
                  />
                </div>
                {item.data.caption && (
                  <p className="text-center text-gray-600 italic text-sm">
                    {item.data.caption}
                  </p>
                )}
              </div>
            );
          }

          if (item.type === 'text') {
            return (
              <div 
                key={`text-${item.data.id}`}
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: item.data.content }}
              />
            );
          }

          return null;
        })}

        {/* FR-016: Show placeholders if content is sparse */}
        {photos.length === 0 && videos.length === 0 && (
          <div className="py-8">
            <PlaceholderImages count={2} />
          </div>
        )}
      </div>
    </article>
  );
}
