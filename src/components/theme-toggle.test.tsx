import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ThemeToggle } from './theme-toggle';
import { ThemeProviderContext } from '@/contexts/theme-context';

const mockSetTheme = vi.fn();

const renderWithTheme = (theme: 'light' | 'dark' | 'system') => {
  const contextValue = {
    theme,
    setTheme: mockSetTheme,
  };

  return render(
    <ThemeProviderContext.Provider value={contextValue}>
      <ThemeToggle />
    </ThemeProviderContext.Provider>,
  );
};

describe('ThemeToggle', () => {
  beforeEach(() => {
    mockSetTheme.mockClear();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders moon icon when theme is light', () => {
    renderWithTheme('light');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    const moonIcon = button.querySelector('svg');
    expect(moonIcon).toBeInTheDocument();
  });

  it('renders sun icon when theme is dark', () => {
    renderWithTheme('dark');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toBeInTheDocument();

    const sunIcon = button.querySelector('svg');
    expect(sunIcon).toBeInTheDocument();
  });

  it('toggles from light to dark when clicked', () => {
    renderWithTheme('light');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('dark');
  });

  it('toggles from dark to light when clicked', () => {
    renderWithTheme('dark');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('toggles from system to light when clicked', () => {
    renderWithTheme('system');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    fireEvent.click(button);

    expect(mockSetTheme).toHaveBeenCalledWith('light');
  });

  it('has correct accessibility attributes', () => {
    renderWithTheme('light');

    const button = screen.getByRole('button', { name: /toggle theme/i });
    expect(button).toHaveAttribute('aria-label', 'Toggle theme');
  });
});
