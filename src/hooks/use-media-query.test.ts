import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useMediaQuery } from './use-media-query';

// Mock MediaQueryList and matchMedia
const createMockMediaQueryList = (matches: boolean) => ({
  matches,
  media: '(min-width: 768px)',
  onchange: null,
  addListener: vi.fn(), // Deprecated but still used in some browsers
  removeListener: vi.fn(), // Deprecated but still used in some browsers
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
});

describe('useMediaQuery', () => {
  let mockMediaQueryList: ReturnType<typeof createMockMediaQueryList>;
  let mockMatchMedia: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockMediaQueryList = createMockMediaQueryList(false);
    mockMatchMedia = vi.fn(() => mockMediaQueryList);
    
    // Mock global matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: mockMatchMedia,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with the current media query match state', () => {
    mockMediaQueryList = createMockMediaQueryList(true);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('returns false when media query does not match', () => {
    mockMediaQueryList = createMockMediaQueryList(false);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);
  });

  it('sets up event listener on mount', () => {
    renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('removes event listener on unmount', () => {
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    unmount();

    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('updates state when media query changes to match', () => {
    mockMediaQueryList = createMockMediaQueryList(false);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(false);

    // Simulate media query change event
    const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];
    const mockEvent = { matches: true } as MediaQueryListEvent;

    act(() => {
      changeHandler(mockEvent);
    });

    expect(result.current).toBe(true);
  });

  it('updates state when media query changes to not match', () => {
    mockMediaQueryList = createMockMediaQueryList(true);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);

    // Simulate media query change event
    const changeHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];
    const mockEvent = { matches: false } as MediaQueryListEvent;

    act(() => {
      changeHandler(mockEvent);
    });

    expect(result.current).toBe(false);
  });

  it('handles different query strings', () => {
    const queries = [
      '(max-width: 640px)',
      '(orientation: portrait)',
      '(prefers-color-scheme: dark)',
      'print',
    ];

    queries.forEach((query) => {
      mockMatchMedia.mockClear();
      renderHook(() => useMediaQuery(query));
      expect(mockMatchMedia).toHaveBeenCalledWith(query);
    });
  });

  it('updates when query changes', () => {
    const { result, rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: '(min-width: 768px)' },
      }
    );

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 768px)');

    // Change the query
    rerender({ query: '(min-width: 1024px)' });

    expect(mockMatchMedia).toHaveBeenCalledWith('(min-width: 1024px)');
  });

  it('cleans up previous listener when query changes', () => {
    const firstMockMediaQueryList = createMockMediaQueryList(false);
    const secondMockMediaQueryList = createMockMediaQueryList(true);

    // First render with first query
    mockMatchMedia.mockReturnValueOnce(firstMockMediaQueryList);
    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: '(min-width: 768px)' },
      }
    );

    expect(firstMockMediaQueryList.addEventListener).toHaveBeenCalled();

    // Second render with different query
    mockMatchMedia.mockReturnValueOnce(secondMockMediaQueryList);
    rerender({ query: '(min-width: 1024px)' });

    // Should remove listener from first query
    expect(firstMockMediaQueryList.removeEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );

    // Should add listener to second query
    expect(secondMockMediaQueryList.addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('maintains separate state for different hook instances', () => {
    const mockMediaQueryList1 = createMockMediaQueryList(true);
    const mockMediaQueryList2 = createMockMediaQueryList(false);

    mockMatchMedia
      .mockReturnValueOnce(mockMediaQueryList1)
      .mockReturnValueOnce(mockMediaQueryList2);

    const { result: result1 } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    const { result: result2 } = renderHook(() => useMediaQuery('(max-width: 767px)'));

    expect(result1.current).toBe(true);
    expect(result2.current).toBe(false);

    // Trigger change on first query
    const changeHandler1 = mockMediaQueryList1.addEventListener.mock.calls[0][1];
    act(() => {
      changeHandler1({ matches: false } as MediaQueryListEvent);
    });

    // Only first hook should change
    expect(result1.current).toBe(false);
    expect(result2.current).toBe(false); // Should remain unchanged
  });

  it('handles complex media queries', () => {
    const complexQuery = '(min-width: 768px) and (max-width: 1024px) and (orientation: landscape)';
    
    renderHook(() => useMediaQuery(complexQuery));

    expect(mockMatchMedia).toHaveBeenCalledWith(complexQuery);
  });

  it('handles empty query string', () => {
    renderHook(() => useMediaQuery(''));

    expect(mockMatchMedia).toHaveBeenCalledWith('');
  });

  it('works with print media queries', () => {
    mockMediaQueryList = createMockMediaQueryList(false);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('print'));

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('print');
  });

  it('works with prefers-color-scheme queries', () => {
    mockMediaQueryList = createMockMediaQueryList(true);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(prefers-color-scheme: dark)'));

    expect(result.current).toBe(true);
    expect(mockMatchMedia).toHaveBeenCalledWith('(prefers-color-scheme: dark)');
  });

  it('works with orientation queries', () => {
    mockMediaQueryList = createMockMediaQueryList(false);
    mockMatchMedia.mockReturnValue(mockMediaQueryList);

    const { result } = renderHook(() => useMediaQuery('(orientation: portrait)'));

    expect(result.current).toBe(false);
    expect(mockMatchMedia).toHaveBeenCalledWith('(orientation: portrait)');
  });

  it('handles rapid query changes without memory leaks', () => {
    const queries = [
      '(min-width: 640px)',
      '(min-width: 768px)',
      '(min-width: 1024px)',
      '(min-width: 1280px)',
    ];

    const mockLists = queries.map(() => createMockMediaQueryList(false));
    queries.forEach((_, index) => {
      mockMatchMedia.mockReturnValueOnce(mockLists[index]);
    });

    const { rerender } = renderHook(
      ({ query }) => useMediaQuery(query),
      {
        initialProps: { query: queries[0] },
      }
    );

    // Rapidly change queries
    queries.slice(1).forEach((query) => {
      rerender({ query });
    });

    // Each previous query should have its listener removed
    mockLists.slice(0, -1).forEach((mockList) => {
      expect(mockList.removeEventListener).toHaveBeenCalledWith(
        'change',
        expect.any(Function)
      );
    });

    // Only the last query should have an active listener
    expect(mockLists[mockLists.length - 1].addEventListener).toHaveBeenCalledWith(
      'change',
      expect.any(Function)
    );
  });

  it('uses the same event handler function reference for consistency', () => {
    const { rerender } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    const firstCallHandler = mockMediaQueryList.addEventListener.mock.calls[0][1];

    // Re-render the hook
    rerender();

    // Should use the same handler function (though this may vary by implementation)
    expect(mockMediaQueryList.addEventListener).toHaveBeenCalledTimes(1);
    expect(mockMediaQueryList.removeEventListener).toHaveBeenCalledTimes(0);
  });

  it('handles matchMedia not being available gracefully', () => {
    // Remove matchMedia from window
    const originalMatchMedia = window.matchMedia;
    // @ts-ignore - Testing edge case
    delete window.matchMedia;

    expect(() => {
      renderHook(() => useMediaQuery('(min-width: 768px)'));
    }).toThrow();

    // Restore matchMedia
    window.matchMedia = originalMatchMedia;
  });
});