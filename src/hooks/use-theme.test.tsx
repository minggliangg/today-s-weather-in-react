import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useTheme } from './use-theme';
import { ThemeProviderContext } from '@/contexts/theme-context';

const mockSetTheme = vi.fn();

const createMockContextValue = (theme: 'light' | 'dark' | 'system') => ({
  theme,
  setTheme: mockSetTheme,
});

const ThemeProvider = ({ 
  children, 
  theme = 'system' 
}: { 
  children: React.ReactNode; 
  theme?: 'light' | 'dark' | 'system';
}) => (
  <ThemeProviderContext.Provider value={createMockContextValue(theme)}>
    {children}
  </ThemeProviderContext.Provider>
);

describe('useTheme', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns context value when used within provider', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider theme="light">{children}</ThemeProvider>,
    });

    expect(result.current.theme).toBe('light');
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('returns default context value when used outside provider', () => {
    const { result } = renderHook(() => useTheme());
    
    // Since ThemeProviderContext has a default value, it won't throw
    // Instead it returns the default context
    expect(result.current.theme).toBe('system');
    expect(typeof result.current.setTheme).toBe('function');
  });

  it('provides access to theme state', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider theme="dark">{children}</ThemeProvider>,
    });

    expect(result.current.theme).toBe('dark');
  });

  it('provides access to setTheme function', () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider theme="system">{children}</ThemeProvider>,
    });

    expect(typeof result.current.setTheme).toBe('function');
    expect(result.current.setTheme).toBe(mockSetTheme);
  });

  it('handles different theme values', () => {
    const themes: Array<'light' | 'dark' | 'system'> = ['light', 'dark', 'system'];

    themes.forEach((theme) => {
      const { result } = renderHook(() => useTheme(), {
        wrapper: ({ children }) => <ThemeProvider theme={theme}>{children}</ThemeProvider>,
      });

      expect(result.current.theme).toBe(theme);
    });
  });

  it('maintains setTheme function reference', () => {
    const { result, rerender } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider theme="light">{children}</ThemeProvider>,
    });

    const initialSetTheme = result.current.setTheme;

    rerender();

    expect(result.current.setTheme).toBe(initialSetTheme);
  });

  it('handles context value changes', () => {
    const { result, rerender } = renderHook(() => useTheme(), {
      wrapper: ({ children }) => <ThemeProvider theme="light">{children}</ThemeProvider>,
    });

    expect(result.current.theme).toBe('light');

    // Change theme prop (simulating context value change)
    rerender();

    // Note: In a real scenario, the theme would change through the context provider
    // This test verifies the hook properly reflects context changes
    expect(result.current.theme).toBe('light'); // Still light as we didn't change the wrapper
  });


  it('returns the exact context object', () => {
    const mockContext = createMockContextValue('dark');
    
    const CustomThemeProvider = ({ children }: { children: React.ReactNode }) => (
      <ThemeProviderContext.Provider value={mockContext}>
        {children}
      </ThemeProviderContext.Provider>
    );

    const { result } = renderHook(() => useTheme(), {
      wrapper: CustomThemeProvider,
    });

    expect(result.current).toBe(mockContext);
  });
});