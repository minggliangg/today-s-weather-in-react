import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useCurrentWeather } from './use-current-weather';
import { CurrentWeatherContext } from '@/contexts/current-weather-context';
import type { CurrentWeatherContextType, WeatherResult } from '@/lib/api-client/interfaces';

const mockWeatherResult: WeatherResult = {
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
};

const mockSetCurrentWeatherData = vi.fn();
const mockSetIsLoading = vi.fn();

const mockContextValue: CurrentWeatherContextType = {
  currentWeatherData: mockWeatherResult,
  setCurrentWeatherData: mockSetCurrentWeatherData,
  isLoading: false,
  setIsLoading: mockSetIsLoading,
};

const CurrentWeatherProvider = ({ children }: { children: React.ReactNode }) => (
  <CurrentWeatherContext.Provider value={mockContextValue}>
    {children}
  </CurrentWeatherContext.Provider>
);

describe('useCurrentWeather', () => {
  it('returns context value when used within provider', () => {
    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: CurrentWeatherProvider,
    });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.currentWeatherData).toBe(mockWeatherResult);
    expect(result.current.isLoading).toBe(false);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useCurrentWeather());
    }).toThrow('useCurrentWeatherContext must be used within a CurrentWeatherProvider');
  });

  it('provides access to weather data', () => {
    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: CurrentWeatherProvider,
    });

    expect(result.current.currentWeatherData).toEqual(mockWeatherResult);
    expect(result.current.currentWeatherData?.city).toBe('New York');
    expect(result.current.currentWeatherData?.temp).toBe(25);
  });

  it('provides access to setter functions', () => {
    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: CurrentWeatherProvider,
    });

    expect(typeof result.current.setCurrentWeatherData).toBe('function');
    expect(typeof result.current.setIsLoading).toBe('function');
  });

  it('provides access to loading state', () => {
    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: CurrentWeatherProvider,
    });

    expect(typeof result.current.isLoading).toBe('boolean');
    expect(result.current.isLoading).toBe(false);
  });

  it('handles null weather data', () => {
    const nullDataContextValue: CurrentWeatherContextType = {
      currentWeatherData: null,
      setCurrentWeatherData: mockSetCurrentWeatherData,
      isLoading: true,
      setIsLoading: mockSetIsLoading,
    };

    const NullDataProvider = ({ children }: { children: React.ReactNode }) => (
      <CurrentWeatherContext.Provider value={nullDataContextValue}>
        {children}
      </CurrentWeatherContext.Provider>
    );

    const { result } = renderHook(() => useCurrentWeather(), {
      wrapper: NullDataProvider,
    });

    expect(result.current.currentWeatherData).toBe(null);
    expect(result.current.isLoading).toBe(true);
  });
});