/**
 * Blog Homepage
 * Feature: 005-public-blog-viewing
 * 
 * Main page displaying list of all published blog posts
 */

'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PostGrid from '@/components/blog/PostGrid';
import Pagination from '@/components/blog/Pagination';
import EmptyPostList from '@/components/blog/EmptyPostList';
import { fetchPublishedPosts } from '@/lib/posts-api';
import type { PaginationInfo } from '@/types/pagination';
import type { PostCardData } from '@/types/post-card';

const POSTS_PER_PAGE = 12;

function LoadingPostList() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200" />
          <div className="p-6">
            <div className="h-4 bg-gray-200 rounded w-20 mb-3" />
            <div className="h-6 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded mb-2" />
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

function BlogContent() {
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1', 10);
  
  const [posts, setPosts] = useState<PostCardData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadPosts = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const offset = (currentPage - 1) * POSTS_PER_PAGE;
        const postList = await fetchPublishedPosts(POSTS_PER_PAGE, offset);
        
        setPosts(postList.posts);
        setPagination({
          ...postList.pagination,
          currentPage,
          totalPages: Math.ceil(postList.pagination.total / POSTS_PER_PAGE),
        });
      } catch (err) {
        console.error('Error loading posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [currentPage]);

  if (loading) {
    return <LoadingPostList />;
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-600 mb-4">{error}</p>
      </div>
    );
  }

  if (posts.length === 0) {
    return <EmptyPostList />;
  }

  return (
    <>
      <PostGrid posts={posts} priorityCount={3} />
      {pagination && <Pagination pagination={pagination} />}
    </>
  );
}

export default function BlogPage() {

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Travel Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover amazing travel stories, tips, and inspiration for your next adventure
          </p>
        </div>

        {/* Post List */}
        <Suspense fallback={<LoadingPostList />}>
          <BlogContent />
        </Suspense>
      </div>
    </div>
  );
}
