import { filterTravelsByCountry, filterTravelsByCompanion } from '@/utils/filterTravels';
import { TravelStory } from '@/types';

describe('filterTravelsByCountry', () => {
  const mockTravels: TravelStory[] = [
    {
      id: '1',
      title: 'Swiss Adventure',
      destination: 'Zermatt',
      country: 'Switzerland',
      date: '2024-01-01',
      description: 'Amazing trip',
      highlights: ['Mountains'],
      imageUrl: '/test.jpg',
      imageAlt: 'Test',
      duration: '5 days',
      travelWith: ['spouse', 'kids'],
    },
    {
      id: '2',
      title: 'Rome Visit',
      destination: 'Rome',
      country: 'Italy',
      date: '2024-02-01',
      description: 'Historic journey',
      highlights: ['Colosseum'],
      imageUrl: '/test.jpg',
      imageAlt: 'Test',
      duration: '3 days',
      travelWith: ['spouse'],
    },
    {
      id: '3',
      title: 'Another Swiss Trip',
      destination: 'Geneva',
      country: 'Switzerland',
      date: '2024-03-01',
      description: 'Lake views',
      highlights: ['Lake Geneva'],
      imageUrl: '/test.jpg',
      imageAlt: 'Test',
      duration: '4 days',
      travelWith: ['spouse', 'kids', 'parents'],
    },
  ];

  it('returns all travels when country is "All"', () => {
    const result = filterTravelsByCountry(mockTravels, 'All');
    expect(result).toHaveLength(3);
    expect(result).toEqual(mockTravels);
  });

  it('filters travels by specific country', () => {
    const result = filterTravelsByCountry(mockTravels, 'Switzerland');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Swiss Adventure');
    expect(result[1].title).toBe('Another Swiss Trip');
  });

  it('filters are case-insensitive', () => {
    const result = filterTravelsByCountry(mockTravels, 'ITALY');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Rome Visit');
  });

  it('returns empty array when no matches', () => {
    const result = filterTravelsByCountry(mockTravels, 'Antarctica');
    expect(result).toHaveLength(0);
  });

  it('handles empty input array', () => {
    const result = filterTravelsByCountry([], 'Switzerland');
    expect(result).toHaveLength(0);
  });

  it('handles empty string filter (returns all)', () => {
    const result = filterTravelsByCountry(mockTravels, '');
    expect(result).toHaveLength(3);
  });

  it('handles null input gracefully', () => {
    // @ts-expect-error Testing runtime behavior
    const result = filterTravelsByCountry(null, 'Switzerland');
    expect(result).toEqual([]);
  });
});

describe('filterTravelsByCompanion', () => {
  const mockTravels: TravelStory[] = [
    {
      id: '1',
      title: 'Family Trip',
      destination: 'Paris',
      country: 'France',
      date: '2024-01-01',
      description: 'Fun family time',
      highlights: ['Eiffel Tower'],
      imageUrl: '/test.jpg',
      imageAlt: 'Test',
      duration: '5 days',
      travelWith: ['spouse', 'kids'],
    },
    {
      id: '2',
      title: 'Romantic Getaway',
      destination: 'Venice',
      country: 'Italy',
      date: '2024-02-01',
      description: 'Just the two of us',
      highlights: ['Gondola'],
      imageUrl: '/test.jpg',
      imageAlt: 'Test',
      duration: '3 days',
      travelWith: ['spouse'],
    },
    {
      id: '3',
      title: 'Multi-Gen Trip',
      destination: 'Barcelona',
      country: 'Spain',
      date: '2024-03-01',
      description: 'Everyone together',
      highlights: ['Sagrada Familia'],
      imageUrl: '/test.jpg',
      imageAlt: 'Test',
      duration: '7 days',
      travelWith: ['spouse', 'kids', 'parents'],
    },
  ];

  it('returns all travels when companion is "All"', () => {
    const result = filterTravelsByCompanion(mockTravels, 'All');
    expect(result).toHaveLength(3);
  });

  it('filters travels by specific companion', () => {
    const result = filterTravelsByCompanion(mockTravels, 'kids');
    expect(result).toHaveLength(2);
    expect(result[0].title).toBe('Family Trip');
    expect(result[1].title).toBe('Multi-Gen Trip');
  });

  it('filters are case-insensitive', () => {
    const result = filterTravelsByCompanion(mockTravels, 'PARENTS');
    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Multi-Gen Trip');
  });

  it('returns travels with just spouse', () => {
    const result = filterTravelsByCompanion(mockTravels, 'spouse');
    expect(result).toHaveLength(3); // All have spouse
  });

  it('returns empty array when no matches', () => {
    const result = filterTravelsByCompanion(mockTravels, 'friends');
    expect(result).toHaveLength(0);
  });

  it('handles empty input array', () => {
    const result = filterTravelsByCompanion([], 'kids');
    expect(result).toHaveLength(0);
  });

  it('handles empty string filter (returns all)', () => {
    const result = filterTravelsByCompanion(mockTravels, '');
    expect(result).toHaveLength(3);
  });
});
