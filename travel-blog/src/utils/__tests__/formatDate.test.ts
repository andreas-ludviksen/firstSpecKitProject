import { formatDate } from '@/utils/formatDate';

describe('formatDate utility', () => {
  it('formats date to YYYY-MM-DD', () => {
    const date = new Date('2025-11-13T10:30:00Z');
    expect(formatDate(date)).toBe('2025-11-13');
  });

  it('formats date with custom separator', () => {
    const date = new Date('2025-11-13');
    expect(formatDate(date, '/')).toBe('2025/11/13');
  });

  it('pads single-digit month and day with zeros', () => {
    const date = new Date('2025-01-05');
    expect(formatDate(date)).toBe('2025-01-05');
  });

  it('handles invalid dates gracefully', () => {
    const invalidDate = new Date('invalid');
    expect(formatDate(invalidDate)).toBe('Invalid Date');
  });

  it('handles null input gracefully', () => {
    // @ts-expect-error Testing runtime behavior with invalid input
    const result = formatDate(null);
    expect(result).toBe('Invalid Date');
  });

  it('handles undefined input gracefully', () => {
    // @ts-expect-error Testing runtime behavior with invalid input
    const result = formatDate(undefined);
    expect(result).toBe('Invalid Date');
  });
});
