import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

// Mock js-cookie
jest.mock('js-cookie');

// Create a test component that uses the auth context
function TestComponent({ email = '', password = '' }: { email?: string; password?: string }) {
  const { isAuthenticated, login, logout } = useAuth();

  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'Authenticated' : 'Not authenticated'}</div>
      <button onClick={() => login(email || 'test@example.com', password || 'password')}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe('AuthContext', () => {
  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockImplementation(() => mockRouter);
    (Cookies.get as jest.Mock).mockImplementation(() => null);
  });

  it('provides authentication state and functions', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('checks authentication status from cookies on mount', () => {
    (Cookies.get as jest.Mock).mockImplementation(() => 'true');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    expect(Cookies.get).toHaveBeenCalledWith('isAuthenticated');
  });

  it('authenticates with correct credentials', async () => {
    // Mock the cookie set function
    (Cookies.set as jest.Mock).mockImplementation(() => {});

    // Render with the correct credentials
    render(
      <AuthProvider>
        <TestComponent email="sinaparsania15@gmail.com" password="EnjoyIt" />
      </AuthProvider>,
    );

    // Initially not authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Not authenticated');

    // Click login button
    await userEvent.click(screen.getByText('Login'));

    // Verify authentication state changed
    await waitFor(() => {
      expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');
    });

    // Verify cookies were set
    expect(Cookies.set).toHaveBeenCalledWith(
      'isAuthenticated',
      'true',
      expect.objectContaining({ expires: 7 }),
    );

    // Verify router navigation
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('logs out correctly', async () => {
    // Start as authenticated
    (Cookies.get as jest.Mock).mockImplementation(() => 'true');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    );

    // Initially authenticated
    expect(screen.getByTestId('auth-status')).toHaveTextContent('Authenticated');

    // Click logout button
    await userEvent.click(screen.getByText('Logout'));

    // Verify cookies are removed and router navigates to login
    expect(Cookies.remove).toHaveBeenCalledWith('isAuthenticated');
    expect(mockRouter.push).toHaveBeenCalledWith('/login');
  });
});
