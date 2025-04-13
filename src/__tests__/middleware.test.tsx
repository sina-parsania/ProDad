import { NextRequest, NextResponse } from 'next/server';
import { middleware } from '../middleware';

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url) => ({
      nextUrl: {
        pathname: new URL(url).pathname,
      },
      url,
      cookies: {
        get: jest.fn().mockImplementation(() => null),
      },
    })),
    NextResponse: {
      next: jest.fn().mockReturnValue('NEXT'),
      redirect: jest.fn().mockImplementation((url) => ({ redirectUrl: url })),
    },
  };
});

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
  })),
}));

describe('Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('allows access to public routes regardless of authentication', () => {
    // Create a request to a public route
    const req = new NextRequest('http://localhost:3000/login');

    // No authentication cookie
    (req.cookies.get as jest.Mock).mockImplementation(() => null);

    const response = middleware(req as any);

    // Should allow access without redirect
    expect(response).toBe('NEXT');
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });

  it('redirects to login when accessing protected route without authentication', () => {
    // Create a request to a protected route
    const req = new NextRequest('http://localhost:3000/dashboard');

    // No authentication cookie
    (req.cookies.get as jest.Mock).mockImplementation(() => null);

    const response = middleware(req as any);

    // Should redirect to login
    expect(NextResponse.redirect).toHaveBeenCalled();
    expect((response as any).redirectUrl.pathname).toBe('/login');
  });

  it('allows access to protected routes when authenticated', () => {
    // Create a request to a protected route
    const req = new NextRequest('http://localhost:3000/dashboard');

    // With valid authentication cookie
    (req.cookies.get as jest.Mock).mockImplementation(() => ({ value: 'true' }));

    const response = middleware(req as any);

    // Should allow access without redirect
    expect(response).toBe('NEXT');
    expect(NextResponse.redirect).not.toHaveBeenCalled();
  });
});
