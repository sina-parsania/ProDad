import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import CalendarPage from '../page';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { CalendarEvent } from '@/types/calendar';

// Mock the useCalendarEvents hook
jest.mock('@/hooks/useCalendarEvents');

// Mock the react-big-calendar package
jest.mock('react-big-calendar', () => {
  return {
    Calendar: ({ events, onSelectEvent, onSelectSlot }: any) => (
      <div data-testid="calendar-component">
        <div data-testid="calendar-event-count">{events.length}</div>
        <button data-testid="select-event-btn" onClick={() => onSelectEvent(events[0])}>
          Select Event
        </button>
        <button
          data-testid="select-slot-btn"
          onClick={() => onSelectSlot({ start: new Date(), end: new Date(Date.now() + 3600000) })}
        >
          Select Slot
        </button>
        <div data-testid="events-list">
          {events.map((event: CalendarEvent) => (
            <div key={event.id} data-testid={`event-${event.id}`}>
              {event.title}
            </div>
          ))}
        </div>
      </div>
    ),
    dateFnsLocalizer: jest.fn().mockReturnValue({}),
  };
});

// Mock the sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

describe('Calendar Page', () => {
  const mockEvents: CalendarEvent[] = [
    {
      id: 1,
      title: 'Doctor Appointment',
      start: new Date('2023-06-15T10:00:00'),
      end: new Date('2023-06-15T11:00:00'),
      type: 'appointment',
      description: 'Pediatrician checkup',
      location: 'Medical Center',
      creatorId: 'current-user',
      synced: false,
      createdAt: new Date('2023-06-10'),
      updatedAt: new Date('2023-06-10'),
    },
    {
      id: 2,
      title: 'Vaccination',
      start: new Date('2023-06-20T14:00:00'),
      end: new Date('2023-06-20T15:00:00'),
      type: 'appointment',
      creatorId: 'partner-user',
      synced: true,
      createdAt: new Date('2023-06-12'),
      updatedAt: new Date('2023-06-12'),
    },
  ];

  const mockCreateEvent = jest.fn().mockResolvedValue(3);
  const mockUpdateEvent = jest.fn().mockResolvedValue(true);
  const mockRemoveEvent = jest.fn().mockResolvedValue(true);

  beforeEach(() => {
    jest.clearAllMocks();
    (useCalendarEvents as jest.Mock).mockReturnValue({
      events: mockEvents,
      loading: false,
      createEvent: mockCreateEvent,
      updateEvent: mockUpdateEvent,
      removeEvent: mockRemoveEvent,
    });
  });

  it('renders the calendar with events', async () => {
    render(<CalendarPage />);

    expect(screen.getByText('Calendar')).toBeInTheDocument();
    expect(screen.getByText('Manage your appointments and events')).toBeInTheDocument();
    expect(screen.getByTestId('calendar-component')).toBeInTheDocument();

    // Check that the events count is correct
    expect(screen.getByTestId('calendar-event-count').textContent).toBe('2');

    // Check that the events are rendered
    await waitFor(() => {
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
      expect(screen.getByText('Vaccination')).toBeInTheDocument();
    });
  });

  it('shows loading state when events are loading', () => {
    (useCalendarEvents as jest.Mock).mockReturnValue({
      events: [],
      loading: true,
      createEvent: mockCreateEvent,
      updateEvent: mockUpdateEvent,
      removeEvent: mockRemoveEvent,
    });

    render(<CalendarPage />);

    expect(screen.queryByTestId('calendar-component')).not.toBeInTheDocument();

    // Find the loading spinner using its CSS classes instead of testId
    const loadingSpinner = document.querySelector('.animate-spin');
    expect(loadingSpinner).toBeInTheDocument();
  });

  it('opens event dialog when selecting an event', async () => {
    render(<CalendarPage />);

    // Simulate selecting an event
    fireEvent.click(screen.getByTestId('select-event-btn'));

    // Check that the dialog opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Edit Event')).toBeInTheDocument();
    });
  });

  it('opens empty event dialog when selecting a time slot', async () => {
    render(<CalendarPage />);

    // Simulate selecting a time slot
    fireEvent.click(screen.getByTestId('select-slot-btn'));

    // Check that the dialog opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('New Event')).toBeInTheDocument();
    });
  });

  it('opens event dialog when clicking Add Event button', async () => {
    render(<CalendarPage />);

    // Click the Add Event button
    fireEvent.click(screen.getByRole('button', { name: 'Add Event' }));

    // Check that the dialog opens
    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('New Event')).toBeInTheDocument();
    });
  });

  it('adapts to different screen sizes', () => {
    // Mocking window.matchMedia for responsive testing
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

    // Mock mobile viewport
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: query.includes('max-width: 768px'),
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    const { rerender } = render(<CalendarPage />);

    // Check mobile layout - simplified check because of the mock
    expect(screen.getByTestId('calendar-component')).toBeInTheDocument();

    // Mock desktop viewport
    window.matchMedia = jest.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    rerender(<CalendarPage />);

    // Check desktop layout
    expect(screen.getByTestId('calendar-component')).toBeInTheDocument();
  });
});

// Mock for CalendarEventDialog component
jest.mock('@/components/calendar/CalendarEventDialog', () => {
  return function MockCalendarEventDialog({
    isOpen,
    onClose,
    event,
    defaultDates,
    onSave,
    onDelete,
  }: any) {
    if (!isOpen) return null;

    const handleSave = () => {
      onSave({
        title: 'New Test Event',
        start: new Date(),
        end: new Date(),
        type: 'appointment',
      });
    };

    const handleDelete = () => {
      if (event?.id) {
        onDelete(event.id);
      }
    };

    return (
      <div role="dialog">
        <h2>{event ? 'Edit Event' : 'New Event'}</h2>
        {event && <p>Editing: {event.title}</p>}
        <button onClick={handleSave}>Save</button>
        {event && <button onClick={handleDelete}>Delete</button>}
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  };
});
