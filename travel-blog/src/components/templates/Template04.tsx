/**
 * Template 04: Video-First Layout
 * Feature: 004-modular-blog-posts
 * 
 * Hero video with photo gallery
 * Capacity: 10 photos, 3 videos, 4 text blocks
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

interface Template04Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template04({ post, content }: Template04Props) {
  const maxPhotos = 10;
  const maxVideos = 3;
  const maxTextBlocks = 4;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  const missingPhotoSlots = Math.max(0, 6 - photos.length);

  return (
    <article className="min-h-screen">
      {/* Hero Video */}
      <section className="relative h-screen">
        {videos[0] ? (
          <div className="absolute inset-0 bg-black">
            <video
              src={videos[0].url}
              controls
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover"
              poster={videos[0].thumbnailUrl || undefined}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-700" />
        )}

        {/* Title Overlay */}
        <div className="relative h-full flex items-end justify-center pb-20">
          <div className="text-center text-white px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4 drop-shadow-2xl">
              {post.title}
            </h1>
            {post.description && (
              <p className="text-xl md:text-2xl drop-shadow-lg max-w-3xl">
                {post.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* First Text Block */}
        {textBlocks[0] && (
          <div className="max-w-4xl mx-auto mb-16">
            <div 
              className="prose prose-xl max-w-none"
              dangerouslySetInnerHTML={{ __html: textBlocks[0].content }}
            />
          </div>
        )}

        {/* Secondary Videos */}
        {(videos[1] || videos[2]) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {videos[1] && (
              <div className="space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900">
                  <video
                    src={videos[1].url}
                    controls
                    className="w-full h-full"
                    poster={videos[1].thumbnailUrl || undefined}
                  />
                </div>
                {videos[1].caption && (
                  <p className="text-sm text-gray-600 italic">{videos[1].caption}</p>
                )}
              </div>
            )}
            {videos[2] && (
              <div className="space-y-3">
                <div className="aspect-video rounded-xl overflow-hidden shadow-lg bg-gray-900">
                  <video
                    src={videos[2].url}
                    controls
                    className="w-full h-full"
                    poster={videos[2].thumbnailUrl || undefined}
                  />
                </div>
                {videos[2].caption && (
                  <p className="text-sm text-gray-600 italic">{videos[2].caption}</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Second Text Block */}
        {textBlocks[1] && (
          <div className="max-w-4xl mx-auto mb-16">
            <div 
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: textBlocks[1].content }}
            />
          </div>
        )}

        {/* Photo Gallery */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-16">
          {photos.map((photo) => (
            <div key={photo.id} className="group">
              <div className="aspect-[4/3] rounded-lg overflow-hidden shadow-md">
                <Image
                  src={photo.url}
                  alt={photo.altText}
                  width={600}
                  height={450}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              {photo.caption && (
                <p className="text-sm text-gray-600 mt-2">{photo.caption}</p>
              )}
            </div>
          ))}

          {/* FR-016: Placeholders */}
          {missingPhotoSlots > 0 && (
            <PlaceholderImages 
              count={missingPhotoSlots}
              gridClassName="contents"
            />
          )}
        </div>

        {/* Final Text Blocks */}
        {(textBlocks[2] || textBlocks[3]) && (
          <div className="max-w-4xl mx-auto space-y-8">
            {textBlocks[2] && (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: textBlocks[2].content }}
              />
            )}
            {textBlocks[3] && (
              <div 
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: textBlocks[3].content }}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}
