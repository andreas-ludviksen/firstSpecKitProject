/**
 * Blog Not Found Page
 * Feature: 005-public-blog-viewing
 */

import Link from 'next/link';

export default function BlogNotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Blog Post Not Found
        </h2>
        <p className="text-gray-600 mb-8 max-w-md">
          The blog post you&apos;re looking for doesn&apos;t exist or may have been removed.
        </p>
        <Link
          href="/blog"
          className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Blog
        </Link>
      </div>
    </div>
  );
}
