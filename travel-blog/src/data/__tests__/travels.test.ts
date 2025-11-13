import { travelStories } from '@/data/travels';

describe('Travel Stories Data', () => {
  it('contains travel story entries', () => {
    expect(travelStories).toBeDefined();
    expect(Array.isArray(travelStories)).toBe(true);
    expect(travelStories.length).toBeGreaterThan(0);
  });

  it('each story has required fields', () => {
    travelStories.forEach((story) => {
      expect(story).toHaveProperty('id');
      expect(story).toHaveProperty('title');
      expect(story).toHaveProperty('destination');
      expect(story).toHaveProperty('country');
      expect(story).toHaveProperty('date');
      expect(story).toHaveProperty('description');
      expect(story).toHaveProperty('highlights');
      expect(story).toHaveProperty('imageUrl');
      expect(story).toHaveProperty('imageAlt');
      
      // Verify types
      expect(typeof story.id).toBe('string');
      expect(typeof story.title).toBe('string');
      expect(typeof story.destination).toBe('string');
      expect(typeof story.country).toBe('string');
      expect(Array.isArray(story.highlights)).toBe(true);
    });
  });

  it('all story IDs are unique', () => {
    const ids = travelStories.map((story) => story.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });
});
