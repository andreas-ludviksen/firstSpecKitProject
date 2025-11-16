/**
 * Pagination Component
 * Feature: 005-public-blog-viewing
 * 
 * Displays pagination controls for blog post list
 */

'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import type { PaginationInfo } from '@/types/pagination';

interface PaginationProps {
  pagination: PaginationInfo;
}

export default function Pagination({ pagination }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { currentPage, totalPages, hasMore } = pagination;

  // Don't show pagination if only one page
  if (totalPages <= 1) {
    return null;
  }

  const createPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    return queryString ? `${pathname}?${queryString}` : pathname;
  };

  const pageNumbers: (number | 'ellipsis')[] = [];
  
  // Always show first page
  pageNumbers.push(1);

  // Show pages around current page
  if (currentPage > 3) {
    pageNumbers.push('ellipsis');
  }

  for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
    if (!pageNumbers.includes(i)) {
      pageNumbers.push(i);
    }
  }

  // Show last page
  if (currentPage < totalPages - 2) {
    pageNumbers.push('ellipsis');
  }
  if (totalPages > 1 && !pageNumbers.includes(totalPages)) {
    pageNumbers.push(totalPages);
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={createPageUrl(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          ← Previous
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">
          ← Previous
        </span>
      )}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((pageNum, index) => {
          if (pageNum === 'ellipsis') {
            return (
              <span key={`ellipsis-${index}`} className="px-2 text-gray-400">
                ...
              </span>
            );
          }

          const isCurrentPage = pageNum === currentPage;
          
          return (
            <Link
              key={pageNum}
              href={createPageUrl(pageNum)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                isCurrentPage
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
              aria-current={isCurrentPage ? 'page' : undefined}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* Next button */}
      {hasMore ? (
        <Link
          href={createPageUrl(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
        >
          Next →
        </Link>
      ) : (
        <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed">
          Next →
        </span>
      )}
    </nav>
  );
}
