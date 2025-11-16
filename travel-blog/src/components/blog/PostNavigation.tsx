/**
 * PostNavigation Component
 * Feature: 005-public-blog-viewing
 * 
 * Previous/Next navigation for blog posts
 */

import Link from 'next/link';
import { getPostUrl } from '@/utils/post-url';

interface PostNavItem {
  id: string;
  slug: string;
  title: string;
}

interface PostNavigationProps {
  previousPost?: PostNavItem | null;
  nextPost?: PostNavItem | null;
}

export default function PostNavigation({ previousPost, nextPost }: PostNavigationProps) {
  // Don't render if no navigation available
  if (!previousPost && !nextPost) {
    return null;
  }

  return (
    <nav className="border-t border-gray-200 pt-8 mt-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Post */}
        <div>
          {previousPost ? (
            <Link
              href={getPostUrl(previousPost.slug)}
              className="group block p-4 rounded-lg border border-gray-200 hover:border-blue-600 hover:shadow-md transition-all"
            >
              <div className="text-sm text-gray-500 mb-1">← Previous</div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                {previousPost.title}
              </div>
            </Link>
          ) : (
            <div className="p-4 opacity-0" aria-hidden="true">
              {/* Spacer for alignment */}
            </div>
          )}
        </div>

        {/* Next Post */}
        <div>
          {nextPost ? (
            <Link
              href={getPostUrl(nextPost.slug)}
              className="group block p-4 rounded-lg border border-gray-200 hover:border-blue-600 hover:shadow-md transition-all text-right"
            >
              <div className="text-sm text-gray-500 mb-1">Next →</div>
              <div className="font-semibold text-gray-900 group-hover:text-blue-600">
                {nextPost.title}
              </div>
            </Link>
          ) : (
            <div className="p-4 opacity-0" aria-hidden="true">
              {/* Spacer for alignment */}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
