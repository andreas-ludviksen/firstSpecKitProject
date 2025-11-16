/**
 * Template 10: Collage Mix
 * Feature: 004-modular-blog-posts
 * 
 * Creative mixed media collage
 * Capacity: 15 photos, 3 videos, 5 text blocks
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

interface Template10Props {
  post: BlogPost;
  content: PostContent;
}

export default function Template10({ post, content }: Template10Props) {
  const maxPhotos = 15;
  const maxVideos = 3;
  const maxTextBlocks = 5;

  // FR-017: Hide excess content
  const photos = content.photos.slice(0, maxPhotos);
  const videos = content.videos.slice(0, maxVideos);
  const textBlocks = content.textBlocks.slice(0, maxTextBlocks);

  const missingPhotoSlots = Math.max(0, 9 - photos.length);

  return (
    <article className="max-w-7xl mx-auto px-4 py-12">
      {/* Creative Header */}
      <header className="mb-16 text-center relative">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 opacity-20 blur-3xl" />
        <div className="relative">
          <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 mb-6">
            {post.title}
          </h1>
          {post.description && (
            <p className="text-2xl text-gray-700 max-w-3xl mx-auto">{post.description}</p>
          )}
        </div>
      </header>

      {/* Intro Text */}
      {textBlocks[0] && (
        <div className="max-w-4xl mx-auto mb-16">
          <div 
            className="prose prose-xl max-w-none text-center"
            dangerouslySetInnerHTML={{ __html: textBlocks[0].content }}
          />
        </div>
      )}

      {/* Creative Collage Grid */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-4 mb-16">
        {/* Large Feature Photo */}
        {photos[0] && (
          <div className="col-span-4 md:col-span-5 row-span-3">
            <div className="h-full rounded-2xl overflow-hidden shadow-2xl transform rotate-1">
              <Image
                src={photos[0].url}
                alt={photos[0].altText}
                width={1200}
                height={800}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* Small stacked photos */}
        {photos.slice(1, 4).map((photo, idx) => (
          <div key={photo.id} className="col-span-2 md:col-span-3">
            <div className={`aspect-square rounded-xl overflow-hidden shadow-lg transform ${idx % 2 === 0 ? '-rotate-2' : 'rotate-2'}`}>
              <Image
                src={photo.url}
                alt={photo.altText}
                width={600}
                height={600}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        ))}

        {/* Video */}
        {videos[0] && (
          <div className="col-span-4 md:col-span-4">
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-xl transform -rotate-1">
              <video
                src={videos[0].url}
                controls
                className="w-full h-full"
                poster={videos[0].thumbnailUrl || undefined}
              />
            </div>
          </div>
        )}

        {/* More photos in varied sizes */}
        {photos.slice(4, 7).map((photo, idx) => (
          <div 
            key={photo.id} 
            className={`
              ${idx === 0 ? 'col-span-2 md:col-span-4' : 'col-span-2 md:col-span-2'}
            `}
          >
            <div className={`aspect-square rounded-lg overflow-hidden shadow-md transform ${idx % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
              <Image
                src={photo.url}
                alt={photo.altText}
                width={600}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}

        {/* Text overlay boxes */}
        {textBlocks[1] && (
          <div className="col-span-4 md:col-span-3 row-span-2">
            <div className="h-full bg-gradient-to-br from-purple-500 to-pink-500 text-white p-6 rounded-xl shadow-lg transform rotate-1">
              <div 
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: textBlocks[1].content }}
              />
            </div>
          </div>
        )}

        {/* Remaining photos */}
        {photos.slice(7).map((photo, idx) => (
          <div 
            key={photo.id}
            className={`col-span-2 ${idx % 3 === 0 ? 'md:col-span-5' : 'md:col-span-3'}`}
          >
            <div className={`aspect-[4/3] rounded-lg overflow-hidden shadow-md transform ${idx % 2 === 0 ? '-rotate-1' : 'rotate-1'}`}>
              <Image
                src={photo.url}
                alt={photo.altText}
                width={800}
                height={600}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}

        {/* FR-016: Placeholders */}
        {missingPhotoSlots > 0 && photos.length < 3 && (
          <PlaceholderImages 
            count={missingPhotoSlots}
            gridClassName="contents"
          />
        )}

        {/* More videos */}
        {videos.slice(1).map((video) => (
          <div key={video.id} className="col-span-4 md:col-span-4">
            <div className="aspect-video bg-gray-900 rounded-xl overflow-hidden shadow-lg transform rotate-1">
              <video
                src={video.url}
                controls
                className="w-full h-full"
                poster={video.thumbnailUrl || undefined}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Final text blocks */}
      {(textBlocks[2] || textBlocks[3] || textBlocks[4]) && (
        <div className="max-w-4xl mx-auto space-y-8">
          {textBlocks.slice(2).map((block) => (
            <div 
              key={block.id}
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          ))}
        </div>
      )}
    </article>
  );
}
