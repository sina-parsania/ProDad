import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import RemindersWidget from '../RemindersWidget';
import { useReminders } from '@/hooks/useReminders';
import { Reminder } from '@/types/reminder';

// Mock the useReminders hook
jest.mock('@/hooks/useReminders');

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
  },
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href }: React.PropsWithChildren<{ href: string }>) => (
    <a href={href} data-testid="mock-link">
      {children}
    </a>
  );
});

describe('RemindersWidget', () => {
  const mockReminders: Reminder[] = [
    {
      id: 1,
      title: 'Doctor Appointment',
      description: 'Annual check-up',
      date: new Date('2023-06-15T10:00:00'),
      type: 'appointment',
      priority: 'high',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 2,
      title: 'Take Medication',
      description: 'Daily vitamins',
      date: new Date('2023-06-12T08:00:00'),
      type: 'medication',
      priority: 'medium',
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 3,
      title: 'Buy Diapers',
      description: 'From grocery store',
      date: new Date('2023-06-10T14:00:00'),
      type: 'task',
      priority: 'low',
      completed: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockMarkAsComplete = jest.fn().mockResolvedValue(true);

  // Mock window.location for navigation tests
  const mockLocationAssign = jest.fn();
  Object.defineProperty(window, 'location', {
    value: {
      href: '',
      assign: mockLocationAssign,
    },
    writable: true,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset mocks
    (useReminders as jest.Mock).mockReturnValue({
      reminders: mockReminders,
      loading: false,
      markAsComplete: mockMarkAsComplete,
    });
  });

  it('renders the reminders widget with active reminders', async () => {
    render(<RemindersWidget />);

    // Check widget title is rendered
    expect(screen.getByText('Reminders')).toBeInTheDocument();
    expect(screen.getByText('Tasks that need your attention')).toBeInTheDocument();

    // Check active reminders are displayed (should only show incomplete ones)
    await waitFor(() => {
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
      expect(screen.getByText('Take Medication')).toBeInTheDocument();
      expect(screen.queryByText('Buy Diapers')).not.toBeInTheDocument(); // Completed, should not show
    });
  });

  it('limits the number of reminders based on maxItems prop', async () => {
    render(<RemindersWidget maxItems={1} />);

    // Should only show one reminder
    await waitFor(() => {
      expect(screen.getByText('Take Medication')).toBeInTheDocument();
      // There should be only one reminder element
      const reminderElements = screen
        .getAllByRole('button')
        .filter(
          (btn) =>
            btn.classList.contains('rounded-full') &&
            btn.getAttribute('aria-label')?.includes('Mark'),
        );
      expect(reminderElements.length).toBe(1);
    });
  });

  it('applies custom className from props', () => {
    render(<RemindersWidget className="test-class" />);

    // Find the root element and check it has the custom class
    const rootElement = screen.getByText('Reminders').closest('[class*="test-class"]');
    expect(rootElement).toHaveClass('test-class');
  });

  it('shows loading state when reminders are loading', () => {
    (useReminders as jest.Mock).mockReturnValue({
      reminders: [],
      loading: true,
      markAsComplete: mockMarkAsComplete,
    });

    render(<RemindersWidget />);

    // Should show loading skeletons
    const loadingSkeletons = document.querySelectorAll('.animate-pulse');
    expect(loadingSkeletons.length).toBeGreaterThan(0);
    expect(screen.queryByText('Doctor Appointment')).not.toBeInTheDocument();
  });

  it('shows empty state when no active reminders exist', () => {
    // All reminders are completed
    const allCompletedReminders = mockReminders.map((r) => ({ ...r, completed: true }));

    (useReminders as jest.Mock).mockReturnValue({
      reminders: allCompletedReminders,
      loading: false,
      markAsComplete: mockMarkAsComplete,
    });

    render(<RemindersWidget />);

    expect(screen.getByText('No active reminders')).toBeInTheDocument();
    expect(screen.getByText('Create a reminder')).toBeInTheDocument();
  });

  it('navigates to add reminder page when clicking Create Reminder', () => {
    // Empty reminders for empty state
    (useReminders as jest.Mock).mockReturnValue({
      reminders: [],
      loading: false,
      markAsComplete: mockMarkAsComplete,
    });

    render(<RemindersWidget />);

    const createReminderButton = screen.getByText('Create a reminder');
    fireEvent.click(createReminderButton);

    // Should navigate to reminders page with action=add
    expect(window.location.href).toBe('/reminders?action=add');
  });

  it('navigates to reminders page when clicking All Reminders', () => {
    render(<RemindersWidget />);

    const allRemindersButton = screen.getByText('All Reminders');
    fireEvent.click(allRemindersButton);

    // Should have the correct link
    expect(allRemindersButton.closest('a')).toHaveAttribute('href', '/reminders');
  });

  it('calls markAsComplete when clicking the reminder checkbox', async () => {
    render(<RemindersWidget />);

    // Wait for reminders to render
    await waitFor(() => {
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
    });

    // Find the first reminder's checkbox
    const firstReminderCheckbox = screen
      .getAllByRole('button')
      .find((btn) => btn.getAttribute('aria-label') === 'Mark Doctor Appointment as complete');

    expect(firstReminderCheckbox).toBeDefined();

    // Click the checkbox
    if (firstReminderCheckbox) {
      fireEvent.click(firstReminderCheckbox);

      // Event propagation should be stopped
      expect(window.location.href).not.toBe('/reminders?open=1');

      // Check that markAsComplete was called with correct ID
      expect(mockMarkAsComplete).toHaveBeenCalledWith(1, true);
    }
  });

  it('navigates to reminder details when clicking a reminder', async () => {
    render(<RemindersWidget />);

    // Wait for reminders to render
    await waitFor(() => {
      expect(screen.getByText('Doctor Appointment')).toBeInTheDocument();
    });

    // Find the first reminder (the container, not the checkbox)
    const firstReminder = screen.getByText('Doctor Appointment').closest('[role="button"]');
    expect(firstReminder).toBeInTheDocument();

    // Click the reminder
    if (firstReminder) {
      fireEvent.click(firstReminder);

      // Should navigate to reminders page with open={id}
      expect(window.location.href).toBe('/reminders?open=1');
    }
  });
});
