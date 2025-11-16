/**
 * PostGrid Component
 * Feature: 005-public-blog-viewing
 * 
 * Grid layout for displaying post cards
 */

import type { PostCardData } from '@/types/post-card';
import PostCard from './PostCard';

interface PostGridProps {
  posts: PostCardData[];
  priorityCount?: number; // Number of cards to load with priority
}

export default function PostGrid({ posts, priorityCount = 3 }: PostGridProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <PostCard 
          key={post.id} 
          post={post} 
          priority={index < priorityCount}
        />
      ))}
    </div>
  );
}
