/**
 * Template 07: Magazine Style
 * Feature: 004-modular-blog-posts
 * 
 * Editorial magazine layout with sidebar
 * Capacity: 12 photos, 2 videos, 8 text blocks
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

interface Template07Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template07({ post, content }: Template07Props) {
  const maxPhotos = 12;
  const maxVideos = 2;
  const maxTextBlocks = 8;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  const sidebarPhotos = photos.slice(0, 4);
  const mainPhotos = photos.slice(4);
  const missingMainPhotoSlots = Math.max(0, 4 - mainPhotos.length);

  return (
    <article className="max-w-7xl mx-auto px-4 py-12">
      {/* Magazine Header */}
      <header className="border-b-4 border-black pb-8 mb-12">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-bold tracking-widest uppercase text-gray-600">
            Travel Stories
          </span>
          {post.publishedAt && (
            <time className="text-sm text-gray-500">
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </time>
          )}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-none mb-4">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-2xl text-gray-700 font-light max-w-4xl">
            {post.description}
          </p>
        )}
      </header>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-10">
          {/* Lead Text */}
          {textBlocks[0] && (
            <div 
              className="prose prose-xl max-w-none first-letter:text-6xl first-letter:font-bold first-letter:float-left first-letter:mr-2 first-letter:mt-1"
              dangerouslySetInnerHTML={{ __html: textBlocks[0].content }}
            />
          )}

          {/* Main Video */}
          {videos[0] && (
            <figure>
              <div className="aspect-video bg-gray-900 shadow-xl">
                <video
                  src={videos[0].url}
                  controls
                  className="w-full h-full"
                  poster={videos[0].thumbnailUrl || undefined}
                />
              </div>
              {videos[0].caption && (
                <figcaption className="text-sm text-gray-600 mt-2 italic">
                  {videos[0].caption}
                </figcaption>
              )}
            </figure>
          )}

          {/* Body Text */}
          {textBlocks.slice(1, 4).map((block) => (
            <div 
              key={block.id}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ))}

          {/* Photo Grid */}
          {mainPhotos.length > 0 && (
            <div className="grid grid-cols-2 gap-4">
              {mainPhotos.map((photo) => (
                <figure key={photo.id}>
                  <div className="aspect-[4/3] overflow-hidden shadow-md">
                    <Image
                      src={photo.url}
                      alt={photo.altText}
                      width={800}
                      height={600}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  {photo.caption && (
                    <figcaption className="text-xs text-gray-600 mt-1">
                      {photo.caption}
                    </figcaption>
                  )}
                </figure>
              ))}

              {/* FR-016: Placeholders */}
              {missingMainPhotoSlots > 0 && (
                <PlaceholderImages 
                  count={missingMainPhotoSlots}
                  gridClassName="contents"
                />
              )}
            </div>
          )}

          {/* More text */}
          {textBlocks.slice(4).map((block) => (
            <div 
              key={block.id}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ))}

          {/* Secondary Video */}
          {videos[1] && (
            <figure>
              <div className="aspect-video bg-gray-900 shadow-lg">
                <video
                  src={videos[1].url}
                  controls
                  className="w-full h-full"
                  poster={videos[1].thumbnailUrl || undefined}
                />
              </div>
              {videos[1].caption && (
                <figcaption className="text-sm text-gray-600 mt-2 italic">
                  {videos[1].caption}
                </figcaption>
              )}
            </figure>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-8">
          <div className="sticky top-8 space-y-8">
            <div className="border-t-4 border-black pt-6">
              <h2 className="text-lg font-bold uppercase tracking-wide mb-4">Gallery</h2>
              <div className="space-y-4">
                {sidebarPhotos.map((photo) => (
                  <figure key={photo.id}>
                    <div className="aspect-square overflow-hidden shadow-md">
                      <Image
                        src={photo.url}
                        alt={photo.altText}
                        width={400}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    {photo.caption && (
                      <figcaption className="text-xs text-gray-600 mt-1">
                        {photo.caption}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </article>
  );
}
