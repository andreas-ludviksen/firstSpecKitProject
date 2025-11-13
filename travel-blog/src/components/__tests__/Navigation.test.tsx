import { render, screen } from '@testing-library/react';
import { usePathname } from 'next/navigation';
import Navigation from '@/components/Navigation';

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
}));

describe('Navigation Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Travel Blog logo', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    expect(screen.getByText('Travel Blog')).toBeInTheDocument();
  });

  it('renders all active navigation links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    // Check for all expected navigation links
    expect(screen.getByRole('link', { name: /home/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /travels/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /family tips/i })).toBeInTheDocument();
  });

  it('highlights the active link based on pathname', () => {
    (usePathname as jest.Mock).mockReturnValue('/travels');
    
    render(<Navigation />);
    
    const travelsLink = screen.getByRole('link', { name: /travels/i });
    const homeLink = screen.getByRole('link', { name: /home/i });
    
    // Active link should have bg-blue-600 text-white classes
    expect(travelsLink).toHaveClass('bg-blue-600', 'text-white');
    // Inactive links should NOT have those classes
    expect(homeLink).not.toHaveClass('bg-blue-600');
    expect(homeLink).not.toHaveClass('text-white');
  });

  it('renders mobile menu button', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    const menuButton = screen.getByRole('button', { name: /open menu/i });
    expect(menuButton).toBeInTheDocument();
    // The md:hidden class is on the parent div, not the button itself
    expect(menuButton.parentElement).toHaveClass('md:hidden');
  });

  it('applies correct href attributes to links', () => {
    (usePathname as jest.Mock).mockReturnValue('/');
    
    render(<Navigation />);
    
    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /travels/i })).toHaveAttribute('href', '/travels');
    expect(screen.getByRole('link', { name: /family tips/i })).toHaveAttribute('href', '/family-tips');
  });
});
