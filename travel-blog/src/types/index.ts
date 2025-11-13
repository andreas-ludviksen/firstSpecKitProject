export enum TipCategory {
  PACKING = 'packing',
  ACTIVITIES = 'activities',
  ACCOMMODATION = 'accommodation',
  FOOD = 'food',
  TRANSPORT = 'transport',
  SAFETY = 'safety',
}

export interface TravelStory {
  id: string;
  title: string;
  destination: string;
  country: string;
  date: string;
  description: string;
  highlights: string[];
  imageUrl: string;
  imageAlt: string;
  duration: string;
  travelWith: string[];
}

export interface HighlightPhoto {
  id: string;
  title: string;
  location: string;
  imageUrl: string;
  imageAlt: string;
  date: string;
  story?: string;
}

export interface FamilyTip {
  id: string;
  title: string;
  description: string;
  category: TipCategory;
  ageGroup: string;
  practicalRating: number;
}

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  order: number;
  isActive: boolean;
}
