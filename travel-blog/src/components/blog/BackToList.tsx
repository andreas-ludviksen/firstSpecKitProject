/**
 * BackToList Component
 * Feature: 005-public-blog-viewing
 * 
 * Navigation link to return to blog list
 */

'use client';

import { useRouter } from 'next/navigation';

export default function BackToList() {
  const router = useRouter();

  return (
    <div className="mb-6">
      <button
        onClick={() => router.back()}
        className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
      >
        <svg
          className="w-5 h-5 mr-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10 19l-7-7m0 0l7-7m-7 7h18"
          />
        </svg>
        Back to blog
      </button>
    </div>
  );
}
