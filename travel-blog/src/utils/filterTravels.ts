import { TravelStory } from '@/types';

/**
 * Filters travel stories by country
 * @param travels - Array of travel stories
 * @param country - Country to filter by (case-insensitive), or 'All' to return all
 * @returns Filtered array of travel stories
 */
export function filterTravelsByCountry(
  travels: TravelStory[],
  country: string
): TravelStory[] {
  if (!Array.isArray(travels)) {
    return [];
  }

  if (country === 'All' || country === '') {
    return travels;
  }

  return travels.filter(
    (travel) => travel.country.toLowerCase() === country.toLowerCase()
  );
}

/**
 * Filters travel stories by travel companions
 * @param travels - Array of travel stories
 * @param companion - Companion to filter by ('spouse', 'kids', 'parents', etc.)
 * @returns Filtered array of travel stories that include the specified companion
 */
export function filterTravelsByCompanion(
  travels: TravelStory[],
  companion: string
): TravelStory[] {
  if (!Array.isArray(travels)) {
    return [];
  }

  if (companion === 'All' || companion === '') {
    return travels;
  }

  return travels.filter((travel) =>
    travel.travelWith.some(
      (c) => c.toLowerCase() === companion.toLowerCase()
    )
  );
}
