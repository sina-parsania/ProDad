import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../page';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock the auth context
jest.mock('@/context/AuthContext');

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock the framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: React.ComponentProps<'div'>) => <div {...props}>{children}</div>,
    p: ({ children, ...props }: React.ComponentProps<'p'>) => <p {...props}>{children}</p>,
  },
}));

describe('LoginPage', () => {
  const mockLogin = jest.fn();
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      loading: false,
    });
    (useRouter as jest.Mock).mockImplementation(() => mockRouter);
  });

  it('renders the login form', () => {
    render(<LoginPage />);

    expect(screen.getByText('Welcome to ProDad')).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
  });

  it('shows demo account information', () => {
    render(<LoginPage />);

    expect(screen.getByText('Demo Account')).toBeInTheDocument();
    expect(screen.getByText('Email: sinaparsania15@gmail.com')).toBeInTheDocument();
    expect(screen.getByText('Password: EnjoyIt')).toBeInTheDocument();
  });

  it('redirects if already authenticated', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      login: mockLogin,
      loading: false,
    });

    render(<LoginPage />);

    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('shows loading state during authentication check', () => {
    (useAuth as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      login: mockLogin,
      loading: true,
    });

    render(<LoginPage />);

    // Should show loading indicator
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('validates form inputs', async () => {
    render(<LoginPage />);

    // Fill in incomplete form data - only email, no password
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');

    // Submit the form
    const form = screen.getByRole('form');
    fireEvent.submit(form);

    // Check for error message
    await waitFor(() => {
      expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('login-error-message').textContent).toBe(
        'Please fill in all fields',
      );
    });

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('submits the form with valid inputs', async () => {
    mockLogin.mockResolvedValue(true);

    render(<LoginPage />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Login should have been called with the input values
    expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
  });

  it('shows error message when login fails', async () => {
    // Simulate failed login
    mockLogin.mockResolvedValue(false);

    render(<LoginPage />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Wait for the error to be displayed
    await waitFor(() => {
      expect(screen.getByTestId('login-error-message')).toBeInTheDocument();
      expect(screen.getByTestId('login-error-message').textContent).toBe(
        'Invalid email or password. Please try again.',
      );
    });
  });

  it('shows loading state during login', async () => {
    // Simulate login that takes time to resolve
    mockLogin.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(true), 100)),
    );

    render(<LoginPage />);

    // Fill in the form
    await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/password/i), 'password123');

    // Submit the form
    await userEvent.click(screen.getByRole('button', { name: /log in/i }));

    // Should show loading state
    expect(screen.getByText(/logging in/i)).toBeInTheDocument();

    // Wait for login to complete
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalled();
    });
  });
});
