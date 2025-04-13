import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatBubble } from '../ChatBubble';

// Mock the react-icons
jest.mock('react-icons/fi', () => ({
  FiUser: () => <span data-testid="user-icon">User Icon</span>,
  FiZap: () => <span data-testid="bot-icon">Bot Icon</span>,
  FiThumbsUp: () => <span data-testid="thumbs-up-icon">Thumbs Up</span>,
  FiThumbsDown: () => <span data-testid="thumbs-down-icon">Thumbs Down</span>,
}));

describe('ChatBubble Component', () => {
  const defaultProps = {
    id: '123',
    content: 'Hello, world!',
    isUser: false,
    timestamp: new Date('2023-01-01T12:00:00'),
    reactions: { liked: null },
    onReaction: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the message content correctly', () => {
    render(<ChatBubble {...defaultProps} />);

    expect(screen.getByText('Hello, world!')).toBeInTheDocument();
  });

  it('displays user icon when isUser is true', () => {
    render(<ChatBubble {...defaultProps} isUser={true} />);

    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('bot-icon')).not.toBeInTheDocument();
  });

  it('displays bot icon when isUser is false', () => {
    render(<ChatBubble {...defaultProps} isUser={false} />);

    expect(screen.getByTestId('bot-icon')).toBeInTheDocument();
    expect(screen.queryByTestId('user-icon')).not.toBeInTheDocument();
  });

  it('formats the timestamp correctly', () => {
    render(<ChatBubble {...defaultProps} />);

    // Format should be HH:mm
    expect(screen.getByText('12:00')).toBeInTheDocument();
  });

  it('shows reaction buttons for bot messages', () => {
    render(<ChatBubble {...defaultProps} isUser={false} />);

    expect(screen.getByTestId('thumbs-up-icon')).toBeInTheDocument();
    expect(screen.getByTestId('thumbs-down-icon')).toBeInTheDocument();
  });

  it('does not show reaction buttons for user messages', () => {
    render(<ChatBubble {...defaultProps} isUser={true} />);

    expect(screen.queryByTestId('thumbs-up-icon')).not.toBeInTheDocument();
    expect(screen.queryByTestId('thumbs-down-icon')).not.toBeInTheDocument();
  });

  it('calls onReaction with like when like button is clicked', async () => {
    render(<ChatBubble {...defaultProps} />);

    const likeButton = screen.getByTestId('thumbs-up-icon').closest('button');
    await userEvent.click(likeButton!);

    expect(defaultProps.onReaction).toHaveBeenCalledWith('123', 'like');
  });

  it('calls onReaction with dislike when dislike button is clicked', async () => {
    render(<ChatBubble {...defaultProps} />);

    const dislikeButton = screen.getByTestId('thumbs-down-icon').closest('button');
    await userEvent.click(dislikeButton!);

    expect(defaultProps.onReaction).toHaveBeenCalledWith('123', 'dislike');
  });

  it('applies liked style when reaction is liked', () => {
    render(<ChatBubble {...defaultProps} reactions={{ liked: true }} />);

    const likeButton = screen.getByTestId('thumbs-up-icon').closest('button');
    expect(likeButton).toHaveClass('bg-green-100');
    expect(likeButton).toHaveClass('text-green-600');
  });

  it('applies disliked style when reaction is disliked', () => {
    render(<ChatBubble {...defaultProps} reactions={{ liked: false }} />);

    const dislikeButton = screen.getByTestId('thumbs-down-icon').closest('button');
    expect(dislikeButton).toHaveClass('bg-red-100');
    expect(dislikeButton).toHaveClass('text-red-600');
  });
});
