import { highlightPhotos } from '@/data/highlights';

describe('Highlight Photos Data', () => {
  it('contains highlight photo entries', () => {
    expect(highlightPhotos).toBeDefined();
    expect(Array.isArray(highlightPhotos)).toBe(true);
    expect(highlightPhotos.length).toBeGreaterThan(0);
  });

  it('each photo has required fields', () => {
    highlightPhotos.forEach((photo) => {
      expect(photo).toHaveProperty('id');
      expect(photo).toHaveProperty('title');
      expect(photo).toHaveProperty('location');
      expect(photo).toHaveProperty('imageUrl');
      expect(photo).toHaveProperty('imageAlt');
      expect(photo).toHaveProperty('date');

      // Verify types
      expect(typeof photo.id).toBe('string');
      expect(typeof photo.title).toBe('string');
      expect(typeof photo.location).toBe('string');
      expect(typeof photo.imageUrl).toBe('string');
      expect(typeof photo.imageAlt).toBe('string');
      expect(typeof photo.date).toBe('string');
    });
  });

  it('each photo has a valid date format (YYYY-MM-DD)', () => {
    highlightPhotos.forEach((photo) => {
      // Check date format matches YYYY-MM-DD
      expect(photo.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Verify it's a valid date
      const date = new Date(photo.date);
      expect(date).toBeInstanceOf(Date);
      expect(isNaN(date.getTime())).toBe(false);
    });
  });

  it('all photo IDs are unique', () => {
    const ids = highlightPhotos.map((photo) => photo.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all image URLs start with /images/', () => {
    highlightPhotos.forEach((photo) => {
      expect(photo.imageUrl).toMatch(/^\/images\//);
    });
  });

  it('all photos have alt text for accessibility', () => {
    highlightPhotos.forEach((photo) => {
      expect(photo.imageAlt.length).toBeGreaterThan(0);
      expect(photo.imageAlt).not.toBe('');
    });
  });

  it('story field is optional', () => {
    // Just verify structure - some photos may or may not have story
    highlightPhotos.forEach((photo) => {
      if (photo.story) {
        expect(typeof photo.story).toBe('string');
      }
    });
  });
});
