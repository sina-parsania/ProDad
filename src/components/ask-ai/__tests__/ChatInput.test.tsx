import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatInput } from '../ChatInput';

// Mock react-icons
jest.mock('react-icons/fi', () => ({
  FiSend: () => <span data-testid="send-icon">Send Icon</span>,
}));

describe('ChatInput Component', () => {
  const mockOnSendMessage = jest.fn();

  beforeEach(() => {
    mockOnSendMessage.mockClear();
  });

  it('renders the textarea and send button', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    expect(
      screen.getByPlaceholderText('Type your question about parenting...'),
    ).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
    expect(screen.getByTestId('send-icon')).toBeInTheDocument();
  });

  it('updates textarea value on user input', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('Type your question about parenting...');
    await userEvent.type(textarea, 'Hello');

    expect(textarea).toHaveValue('Hello');
  });

  it('calls onSendMessage when button is clicked with non-empty message', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('Type your question about parenting...');
    await userEvent.type(textarea, 'Hello');

    const sendButton = screen.getByRole('button');
    await userEvent.click(sendButton);

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello');
    expect(textarea).toHaveValue(''); // Message should be cleared after sending
  });

  it('does not call onSendMessage when button is clicked with empty message', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const sendButton = screen.getByRole('button');
    await userEvent.click(sendButton);

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('calls onSendMessage when Enter is pressed (without Shift)', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('Type your question about parenting...');
    await userEvent.type(textarea, 'Hello');
    await userEvent.keyboard('{Enter}');

    expect(mockOnSendMessage).toHaveBeenCalledWith('Hello');
    expect(textarea).toHaveValue('');
  });

  it('does not call onSendMessage when Shift+Enter is pressed', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} />);

    const textarea = screen.getByPlaceholderText('Type your question about parenting...');
    await userEvent.type(textarea, 'Hello');

    // Simulate Shift+Enter
    await userEvent.keyboard('{Shift>}{Enter}{/Shift}');

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });

  it('disables textarea and button when isLoading is true', () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />);

    const textarea = screen.getByPlaceholderText('Type your question about parenting...');
    const sendButton = screen.getByRole('button');

    expect(textarea).toBeDisabled();
    expect(sendButton).toBeDisabled();
  });

  it('does not call onSendMessage when isLoading is true', async () => {
    render(<ChatInput onSendMessage={mockOnSendMessage} isLoading={true} />);

    const textarea = screen.getByPlaceholderText('Type your question about parenting...');
    // We need to override the disabled state to test this
    await userEvent.type(textarea, 'Hello', { skipHooksThrow: true });

    const sendButton = screen.getByRole('button');
    await userEvent.click(sendButton, { skipHooksThrow: true });

    expect(mockOnSendMessage).not.toHaveBeenCalled();
  });
});
