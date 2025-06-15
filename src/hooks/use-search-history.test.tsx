import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useSearchHistory } from './use-search-history';
import { SearchHistoryContext } from '@/contexts/search_history-context';
import type { SearchHistoryContextType, WeatherResult } from '@/lib/api-client/interfaces';

const mockWeatherResults: WeatherResult[] = [
  {
    temp: 25,
    feels_like: 28,
    temp_min: 20,
    temp_max: 30,
    pressure: 1013,
    humidity: 65,
    country: 'US',
    city: 'New York',
    description: 'clear sky',
    weather_icon: '01d',
    timestamp: Date.now(),
  },
  {
    temp: 18,
    feels_like: 20,
    temp_min: 15,
    temp_max: 22,
    pressure: 1020,
    humidity: 72,
    country: 'GB',
    city: 'London',
    description: 'few clouds',
    weather_icon: '02d',
    timestamp: Date.now() - 1000,
  },
];

const mockAddWeatherResult = vi.fn();
const mockClearSearchHistory = vi.fn();
const mockRemoveWeatherResult = vi.fn();
const mockSearchAgain = vi.fn();

const mockContextValue: SearchHistoryContextType = {
  searchHistory: mockWeatherResults,
  addWeatherResult: mockAddWeatherResult,
  clearSearchHistory: mockClearSearchHistory,
  removeWeatherResult: mockRemoveWeatherResult,
  searchAgain: mockSearchAgain,
};

const SearchHistoryProvider = ({ children }: { children: React.ReactNode }) => (
  <SearchHistoryContext.Provider value={mockContextValue}>
    {children}
  </SearchHistoryContext.Provider>
);

describe('useSearchHistory', () => {
  it('returns context value when used within provider', () => {
    const { result } = renderHook(() => useSearchHistory(), {
      wrapper: SearchHistoryProvider,
    });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.searchHistory).toBe(mockWeatherResults);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useSearchHistory());
    }).toThrow('UseSearchHistoryContext must be used within a SearchHistoryProvider');
  });

  it('provides access to search history array', () => {
    const { result } = renderHook(() => useSearchHistory(), {
      wrapper: SearchHistoryProvider,
    });

    expect(Array.isArray(result.current.searchHistory)).toBe(true);
    expect(result.current.searchHistory).toHaveLength(2);
    expect(result.current.searchHistory[0].city).toBe('New York');
    expect(result.current.searchHistory[1].city).toBe('London');
  });

  it('provides access to all context methods', () => {
    const { result } = renderHook(() => useSearchHistory(), {
      wrapper: SearchHistoryProvider,
    });

    expect(typeof result.current.addWeatherResult).toBe('function');
    expect(typeof result.current.clearSearchHistory).toBe('function');
    expect(typeof result.current.removeWeatherResult).toBe('function');
    expect(typeof result.current.searchAgain).toBe('function');
  });

  it('handles empty search history', () => {
    const emptyContextValue: SearchHistoryContextType = {
      searchHistory: [],
      addWeatherResult: mockAddWeatherResult,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    };

    const EmptySearchHistoryProvider = ({ children }: { children: React.ReactNode }) => (
      <SearchHistoryContext.Provider value={emptyContextValue}>
        {children}
      </SearchHistoryContext.Provider>
    );

    const { result } = renderHook(() => useSearchHistory(), {
      wrapper: EmptySearchHistoryProvider,
    });

    expect(result.current.searchHistory).toEqual([]);
    expect(result.current.searchHistory).toHaveLength(0);
  });

  it('provides access to weather result properties', () => {
    const { result } = renderHook(() => useSearchHistory(), {
      wrapper: SearchHistoryProvider,
    });

    const firstResult = result.current.searchHistory[0];
    expect(firstResult.temp).toBe(25);
    expect(firstResult.city).toBe('New York');
    expect(firstResult.country).toBe('US');
    expect(firstResult.description).toBe('clear sky');
    expect(firstResult.weather_icon).toBe('01d');
  });

  it('maintains function references correctly', () => {
    const { result, rerender } = renderHook(() => useSearchHistory(), {
      wrapper: SearchHistoryProvider,
    });

    const initialFunctions = {
      addWeatherResult: result.current.addWeatherResult,
      clearSearchHistory: result.current.clearSearchHistory,
      removeWeatherResult: result.current.removeWeatherResult,
      searchAgain: result.current.searchAgain,
    };

    rerender();

    // Functions should be the same references
    expect(result.current.addWeatherResult).toBe(initialFunctions.addWeatherResult);
    expect(result.current.clearSearchHistory).toBe(initialFunctions.clearSearchHistory);
    expect(result.current.removeWeatherResult).toBe(initialFunctions.removeWeatherResult);
    expect(result.current.searchAgain).toBe(initialFunctions.searchAgain);
  });
});