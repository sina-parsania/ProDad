import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '../input';

describe('Input Component', () => {
  it('renders an input element', () => {
    render(<Input />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
  });

  it('renders with the correct type', () => {
    render(<Input type="password" />);

    const input = screen.getByTestId('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('accepts a placeholder', () => {
    render(<Input placeholder="Enter your name" />);

    const input = screen.getByPlaceholderText('Enter your name');
    expect(input).toBeInTheDocument();
  });

  it('applies custom classnames', () => {
    render(<Input className="custom-class" />);

    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-class');
  });

  it('handles user input correctly', async () => {
    const handleChange = jest.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    await userEvent.type(input, 'Hello, world!');

    expect(handleChange).toHaveBeenCalledTimes(13); // one call per character
    expect(input).toHaveValue('Hello, world!');
  });

  it('can be disabled', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('forwards additional props to the input element', () => {
    render(<Input data-testid="test-input" maxLength={5} />);

    const input = screen.getByTestId('test-input');
    expect(input).toHaveAttribute('maxLength', '5');
  });
});
