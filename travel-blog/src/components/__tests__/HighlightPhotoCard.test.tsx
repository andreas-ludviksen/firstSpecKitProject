import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HighlightPhotoCard from '@/components/HighlightPhotoCard';
import { HighlightPhoto } from '@/types';

// Mock next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => {
    // eslint-disable-next-line jsx-a11y/alt-text, @next/next/no-img-element
    return <img {...props} />;
  },
}));

describe('HighlightPhotoCard Component', () => {
  const mockPhoto: HighlightPhoto = {
    id: 'test-1',
    title: 'Swiss Alps Adventure',
    location: 'Zermatt, Switzerland',
    imageUrl: '/images/highlights/swiss-alps.svg',
    imageAlt: 'Beautiful mountain view in Swiss Alps',
    story: 'An amazing hiking experience with stunning mountain views.',
  };

  it('renders the photo image with correct attributes', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockPhoto.imageUrl);
    expect(image).toHaveAttribute('alt', mockPhoto.imageAlt);
  });

  it('displays the photo title', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('Swiss Alps Adventure')).toBeInTheDocument();
  });

  it('displays the location', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('Zermatt, Switzerland')).toBeInTheDocument();
  });

  it('displays the story when provided', () => {
    render(<HighlightPhotoCard photo={mockPhoto} />);
    
    expect(screen.getByText('An amazing hiking experience with stunning mountain views.')).toBeInTheDocument();
  });

  it('does not display story text when story is not provided', () => {
    const photoWithoutStory: HighlightPhoto = {
      ...mockPhoto,
      story: undefined,
    };
    
    render(<HighlightPhotoCard photo={photoWithoutStory} />);
    
    // Story text should not be present
    expect(screen.queryByText('An amazing hiking experience')).not.toBeInTheDocument();
  });

  it('has hover effect classes', () => {
    const { container } = render(<HighlightPhotoCard photo={mockPhoto} />);
    
    const cardDiv = container.querySelector('.group');
    expect(cardDiv).toHaveClass('hover:shadow-2xl', 'transition-shadow');
  });

  it('simulates hover interaction', async () => {
    const user = userEvent.setup();
    const { container } = render(<HighlightPhotoCard photo={mockPhoto} />);
    
    const card = container.querySelector('.group');
    expect(card).toBeInTheDocument();
    
    // Hover over the card (userEvent interaction)
    if (card) {
      await user.hover(card as HTMLElement);
      
      // The overlay should have group-hover classes
      const overlay = container.querySelector('.group-hover\\:opacity-100');
      expect(overlay).toBeInTheDocument();
    }
  });
});
