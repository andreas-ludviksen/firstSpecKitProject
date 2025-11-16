/**
 * Dynamic Post Page
 * Feature: 004-modular-blog-posts
 * Route: /posts/[slug]
 * 
 * Displays a single blog post
 */

import { notFound } from 'next/navigation';
import PostRenderer from '@/components/blog/PostRenderer';

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPost(slug: string) {
  try {
    // In a real app, this would fetch from the API
    // For now, return null to trigger notFound()
    // This will be functional once the API is deployed
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${slug}`, {
      cache: 'no-store', // For dynamic content
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Failed to fetch post:', error);
    return null;
  }
}

export default async function PostPage({ params }: { params: { slug: string } }) {
  const data = await getPost(params.slug);

  if (!data) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-white">
      <PostRenderer post={data.post} content={data.content} />
    </div>
  );
}

// Generate static params for published posts (optional, for static export)
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/posts?status=published`);
    
    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return data.posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    console.error('Failed to generate static params:', error);
    return [];
  }
}

// Metadata for SEO
export async function generateMetadata({ params }: PageProps) {
  const data = await getPost(params.slug);

  if (!data) {
    return {
      title: 'Post Not Found',
    };
  }

  return {
    title: data.post.title,
    description: data.post.description || `Read ${data.post.title}`,
    openGraph: {
      title: data.post.title,
      description: data.post.description || undefined,
      images: data.post.coverImage ? [data.post.coverImage] : [],
    },
  };
}
