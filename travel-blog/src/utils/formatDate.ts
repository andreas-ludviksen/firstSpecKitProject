/**
 * Formats a Date object to YYYY-MM-DD string format
 * @param date - The date to format
 * @param separator - Optional separator (default: '-')
 * @returns Formatted date string or 'Invalid Date' if date is invalid
 */
export function formatDate(date: Date, separator: string = '-'): string {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}${separator}${month}${separator}${day}`;
}
