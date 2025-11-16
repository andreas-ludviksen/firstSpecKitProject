/**
 * Template 06: Minimal Clean
 * Feature: 004-modular-blog-posts
 * 
 * Clean typography-focused layout
 * Capacity: 8 photos, 1 video, 10 text blocks
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

interface Template06Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template06({ post, content }: Template06Props) {
  const maxPhotos = 8;
  const maxVideos = 1;
  const maxTextBlocks = 10;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  const missingPhotoSlots = Math.max(0, 4 - photos.length);

  return (
    <article className="max-w-3xl mx-auto px-6 py-20">
      {/* Minimalist Header */}
      <header className="mb-20 border-b border-gray-200 pb-10">
        <h1 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-4 leading-tight">
          {post.title}
        </h1>
        {post.description && (
          <p className="text-lg text-gray-500 font-light">{post.description}</p>
        )}
        {post.publishedAt && (
          <time className="text-sm text-gray-400 mt-6 block">
            {new Date(post.publishedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </time>
        )}
      </header>

      {/* Content Flow */}
      <div className="space-y-16">
        {/* First text blocks */}
        {textBlocks.slice(0, 3).map((block) => (
          <div 
            key={block.id}
            className="prose prose-lg prose-gray max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        ))}

        {/* Featured Photo */}
        {photos[0] && (
          <figure className="my-16 -mx-6">
            <div className="aspect-[16/10] overflow-hidden">
              <Image
                src={photos[0].url}
                alt={photos[0].altText}
                width={1200}
                height={750}
                className="w-full h-full object-cover"
              />
            </div>
            {photos[0].caption && (
              <figcaption className="text-sm text-gray-500 mt-3 px-6 italic">
                {photos[0].caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* More text */}
        {textBlocks.slice(3, 5).map((block) => (
          <div 
            key={block.id}
            className="prose prose-lg prose-gray max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        ))}

        {/* Video */}
        {videos[0] && (
          <figure className="my-16 -mx-6">
            <div className="aspect-video bg-gray-900">
              <video
                src={videos[0].url}
                controls
                className="w-full h-full"
                poster={videos[0].thumbnailUrl || undefined}
              />
            </div>
            {videos[0].caption && (
              <figcaption className="text-sm text-gray-500 mt-3 px-6 italic">
                {videos[0].caption}
              </figcaption>
            )}
          </figure>
        )}

        {/* More text */}
        {textBlocks.slice(5, 7).map((block) => (
          <div 
            key={block.id}
            className="prose prose-lg prose-gray max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        ))}

        {/* Photo Grid */}
        {photos.length > 1 && (
          <div className="grid grid-cols-2 gap-4 my-16 -mx-6">
            {photos.slice(1).map((photo) => (
              <figure key={photo.id}>
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={photo.url}
                    alt={photo.altText}
                    width={600}
                    height={600}
                    className="w-full h-full object-cover"
                  />
                </div>
                {photo.caption && (
                  <figcaption className="text-xs text-gray-500 mt-2 px-2">
                    {photo.caption}
                  </figcaption>
                )}
              </figure>
            ))}

            {/* FR-016: Placeholders */}
            {missingPhotoSlots > 0 && photos.length === 1 && (
              <PlaceholderImages 
                count={missingPhotoSlots}
                gridClassName="contents"
              />
            )}
          </div>
        )}

        {/* Final text blocks */}
        {textBlocks.slice(7).map((block) => (
          <div 
            key={block.id}
            className="prose prose-lg prose-gray max-w-none font-serif"
            dangerouslySetInnerHTML={{ __html: block.content }}
          />
        ))}
      </div>
    </article>
  );
}
