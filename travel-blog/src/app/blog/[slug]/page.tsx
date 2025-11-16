/**
 * Blog Post Detail Page
 * Feature: 005-public-blog-viewing
 * 
 * Displays individual blog post with full content
 */

import { fetchPostBySlug } from '@/lib/posts-api';
import PostRenderer from '@/components/blog/PostRenderer';
import BackToList from '@/components/blog/BackToList';
import PostNavigation from '@/components/blog/PostNavigation';
import { formatPostDate } from '@/utils/date-format';
import { notFound } from 'next/navigation';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for build time
export async function generateStaticParams() {
  // Return at least one dummy path for the build
  // Actual paths will be handled client-side
  return [{ slug: 'placeholder' }];
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  let postData;
  
  try {
    postData = await fetchPostBySlug(params.slug);
  } catch (error) {
    console.error('Error fetching post:', error);
    notFound();
  }

  const { post, content } = postData;

  // Only show published posts
  if (post.status !== 'published') {
    notFound();
  }

  const publishDate = formatPostDate(post.publishedAt, 'long');

  return (
    <div className="min-h-screen bg-gray-50">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <BackToList />

        {/* Post header */}
        <header className="mb-8">
          <div className="mb-4">
            <span className="inline-block px-3 py-1 text-sm font-semibold text-blue-600 bg-blue-100 rounded-full">
              {post.templateName}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>

          {post.description && (
            <p className="text-xl text-gray-600 mb-4">
              {post.description}
            </p>
          )}

          <div className="flex items-center text-sm text-gray-500">
            <time dateTime={post.publishedAt || post.createdAt}>
              {publishDate}
            </time>
          </div>
        </header>

        {/* Post content rendered with template */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <PostRenderer post={post} content={content} />
        </div>

        {/* Post navigation (prev/next) - TODO: implement in future iteration */}
        <PostNavigation />
      </article>
    </div>
  );
}
