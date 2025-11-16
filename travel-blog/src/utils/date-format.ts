/**
 * Date Formatting Utility
 * Feature: 005-public-blog-viewing
 * 
 * Format dates for display in blog posts
 */

/**
 * Format ISO date string for display
 * @param isoDate - ISO 8601 date string
 * @param format - Display format ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatPostDate(
  isoDate: string | null | undefined, 
  format: 'short' | 'medium' | 'long' = 'medium'
): string {
  if (!isoDate) {
    return '';
  }

  try {
    const date = new Date(isoDate);
    
    if (isNaN(date.getTime())) {
      return '';
    }

    switch (format) {
      case 'short':
        // e.g., "Nov 16, 2025"
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        });
      
      case 'medium':
        // e.g., "November 16, 2025"
        return date.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      
      case 'long':
        // e.g., "Saturday, November 16, 2025"
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      
      default:
        return date.toLocaleDateString('en-US');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
}

/**
 * Get relative time string (e.g., "2 days ago")
 */
export function getRelativeTime(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '';
  }

  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return months === 1 ? '1 month ago' : `${months} months ago`;
    } else {
      const years = Math.floor(diffDays / 365);
      return years === 1 ? '1 year ago' : `${years} years ago`;
    }
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '';
  }
}
