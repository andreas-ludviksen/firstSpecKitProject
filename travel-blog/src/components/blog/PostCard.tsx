/**
 * PostCard Component
 * Feature: 005-public-blog-viewing
 * 
 * Displays a blog post preview card in the list view
 */

import Image from 'next/image';
import Link from 'next/link';
import type { PostCardData } from '@/types/post-card';
import { getPostUrl } from '@/utils/post-url';
import { formatPostDate } from '@/utils/date-format';
import { generateExcerpt } from '@/utils/excerpt';

interface PostCardProps {
  post: PostCardData;
  priority?: boolean; // For image loading priority (first few cards)
}

export default function PostCard({ post, priority = false }: PostCardProps) {
  const postUrl = getPostUrl(post.slug);
  const excerpt = generateExcerpt(post.description, 120);
  const publishDate = formatPostDate(post.publishedAt, 'medium');
  const coverImageUrl = post.coverImage || '/images/placeholders/post-placeholder.jpg';

  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <Link href={postUrl} className="block">
        <div className="relative h-48 w-full bg-gray-200">
          <Image
            src={coverImageUrl}
            alt={post.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
            priority={priority}
          />
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-block px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
              {post.templateName}
            </span>
            {post.photoCount > 0 && (
              <span className="text-sm text-gray-500">
                📸 {post.photoCount}
              </span>
            )}
            {post.videoCount > 0 && (
              <span className="text-sm text-gray-500">
                🎥 {post.videoCount}
              </span>
            )}
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
            {post.title}
          </h2>

          {excerpt && (
            <p className="text-gray-600 mb-4 line-clamp-3">
              {excerpt}
            </p>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <time dateTime={post.publishedAt || post.createdAt}>
              {publishDate}
            </time>
            <span className="text-blue-600 font-medium hover:underline">
              Read more →
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
