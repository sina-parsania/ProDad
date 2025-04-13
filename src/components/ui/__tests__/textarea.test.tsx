import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Textarea } from '../textarea';

describe('Textarea Component', () => {
  it('renders a textarea element', () => {
    render(<Textarea data-testid="test-textarea" />);

    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('accepts a placeholder', () => {
    render(<Textarea placeholder="Enter your message" />);

    const textarea = screen.getByPlaceholderText('Enter your message');
    expect(textarea).toBeInTheDocument();
  });

  it('applies default and custom classes', () => {
    render(<Textarea className="custom-class" data-testid="test-textarea" />);

    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveClass('custom-class');
    expect(textarea).toHaveClass('min-h-[80px]'); // default class
  });

  it('handles user input correctly', async () => {
    const handleChange = jest.fn();
    render(<Textarea onChange={handleChange} data-testid="test-textarea" />);

    const textarea = screen.getByTestId('test-textarea');
    await userEvent.type(textarea, 'Hello\nworld!');

    expect(handleChange).toHaveBeenCalled();
    expect(textarea).toHaveValue('Hello\nworld!');
  });

  it('can be disabled', () => {
    render(<Textarea disabled data-testid="test-textarea" />);

    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toBeDisabled();
  });

  it('forwards additional props to the textarea element', () => {
    render(<Textarea maxLength={100} rows={5} data-testid="test-textarea" />);

    const textarea = screen.getByTestId('test-textarea');
    expect(textarea).toHaveAttribute('maxLength', '100');
    expect(textarea).toHaveAttribute('rows', '5');
  });

  it('forwards ref to the textarea element', () => {
    const ref = jest.fn();
    render(<Textarea ref={ref} data-testid="test-textarea" />);

    // The ref should have been called with the textarea element
    expect(ref).toHaveBeenCalled();
  });
});
