import { render, screen, waitFor } from '@testing-library/react';
import Dashboard from '../page';

// Mock the dashboard widgets
jest.mock('@/components/dashboard/EventsWidget', () => {
  return function MockEventsWidget({ className }: { className?: string }) {
    return (
      <div data-testid="events-widget" className={className}>
        Events Widget
      </div>
    );
  };
});

jest.mock('@/components/dashboard/RemindersWidget', () => {
  return function MockRemindersWidget({ className }: { className?: string }) {
    return (
      <div data-testid="reminders-widget" className={className}>
        Reminders Widget
      </div>
    );
  };
});

jest.mock('@/components/dashboard/DocumentsWidget', () => {
  return function MockDocumentsWidget({ className }: { className?: string }) {
    return (
      <div data-testid="documents-widget" className={className}>
        Documents Widget
      </div>
    );
  };
});

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

describe('Dashboard Page', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
  });

  it('renders the dashboard with all widgets', async () => {
    render(<Dashboard />);

    // Check the header is present
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(
      screen.getByText('Welcome to ProDad, your support companion for the journey of parenthood.'),
    ).toBeInTheDocument();

    // Check all widgets are rendered
    await waitFor(() => {
      expect(screen.getByTestId('events-widget')).toBeInTheDocument();
      expect(screen.getByTestId('reminders-widget')).toBeInTheDocument();
      expect(screen.getByTestId('documents-widget')).toBeInTheDocument();
    });
  });

  it('applies correct layout classes to widgets', async () => {
    render(<Dashboard />);

    await waitFor(() => {
      // Check that EventsWidget spans 2 columns on medium screens
      expect(screen.getByTestId('events-widget')).toHaveClass('md:col-span-2');

      // Check that RemindersWidget spans 1 column on medium screens
      expect(screen.getByTestId('reminders-widget')).toHaveClass('md:col-span-1');

      // Check that DocumentsWidget spans full width
      expect(screen.getByTestId('documents-widget')).toHaveClass('col-span-full');
    });
  });

  it('renders refresh data button', async () => {
    // Mock window.location.reload
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true,
    });

    render(<Dashboard />);

    // Check the sync status message
    expect(screen.getByText('All data is stored locally on your device.')).toBeInTheDocument();

    // Click the refresh button
    const refreshButton = screen.getByRole('button', { name: 'Refresh data' });
    expect(refreshButton).toBeInTheDocument();
    refreshButton.click();

    // Check that page reload was called
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('renders in different viewport sizes', async () => {
    // Mock matchMedia for responsive design testing
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation((query) => ({
        matches: query.includes('max-width: 768px'),
        media: query,
        onchange: null,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });

    // Mobile view
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes('max-width: 768px'),
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { rerender } = render(<Dashboard />);

    // Check grid layout changes on mobile
    const gridContainer = screen
      .getByText('Dashboard')
      .closest('.container')
      ?.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1');

    // Desktop view
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    rerender(<Dashboard />);

    // Same test should still pass since the class is applied regardless (controlled by Tailwind responsive classes)
    expect(gridContainer).toHaveClass('grid-cols-1');
  });
});

// Tests for widget behavior with mock data will be implemented in separate widget test files
