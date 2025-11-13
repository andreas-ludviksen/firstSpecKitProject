import { render, screen } from '@testing-library/react';
import Footer from '@/components/Footer';

describe('Footer Component', () => {
  it('renders the copyright text', () => {
    render(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} Travel Blog. All rights reserved.`)).toBeInTheDocument();
  });

  it('has correct styling classes', () => {
    const { container } = render(<Footer />);
    
    const footer = container.querySelector('footer');
    expect(footer).toHaveClass('bg-gray-800', 'text-white', 'py-8', 'mt-12');
  });

  it('renders with centered content', () => {
    const { container } = render(<Footer />);
    
    const contentDiv = container.querySelector('.text-center');
    expect(contentDiv).toBeInTheDocument();
  });
});
