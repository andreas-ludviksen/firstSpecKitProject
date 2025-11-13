import { NavigationItem } from '@/types';

export const navigationItems: NavigationItem[] = [
  {
    id: 'nav-1',
    label: 'Home',
    href: '/',
    order: 1,
    isActive: true,
  },
  {
    id: 'nav-2',
    label: 'Travels',
    href: '/travels',
    order: 2,
    isActive: true,
  },
  {
    id: 'nav-3',
    label: 'Family Tips',
    href: '/family-tips',
    order: 3,
    isActive: true,
  },
];
