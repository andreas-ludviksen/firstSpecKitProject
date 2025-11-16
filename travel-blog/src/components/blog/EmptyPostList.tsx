/**
 * EmptyPostList Component
 * Feature: 005-public-blog-viewing
 * 
 * Displays when no blog posts are available
 */

export default function EmptyPostList() {
  return (
    <div className="text-center py-16">
      <div className="mb-6">
        <svg
          className="mx-auto h-24 w-24 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
          />
        </svg>
      </div>
      
      <h3 className="text-2xl font-semibold text-gray-700 mb-2">
        No blog posts yet
      </h3>
      
      <p className="text-gray-500 max-w-md mx-auto">
        Check back soon for new travel stories and adventures!
      </p>
    </div>
  );
}
