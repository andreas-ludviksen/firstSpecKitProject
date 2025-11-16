/**
 * Pagination Types
 * Feature: 005-public-blog-viewing
 */

export interface PaginationInfo {
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
  currentPage: number;
  totalPages: number;
}

export interface PaginationParams {
  limit?: number;
  offset?: number;
  page?: number;
}
