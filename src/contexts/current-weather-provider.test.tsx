import { render, screen, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CurrentWeatherProvider } from './current-weather-provider';
import { useCurrentWeather } from '@/hooks/use-current-weather';
import type { WeatherResult } from '@/lib/api-client/interfaces';

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

// Test component
const TestComponent = () => {
  const {
    currentWeatherData,
    setCurrentWeatherData,
    isLoading,
    setIsLoading,
  } = useCurrentWeather();

  return (
    <div>
      <div data-testid="weather-data">
        {currentWeatherData ? `${currentWeatherData.city}, ${currentWeatherData.country}` : 'null'}
      </div>
      <div data-testid="is-loading">{isLoading.toString()}</div>
      
      <button
        data-testid="set-weather-data"
        onClick={() => setCurrentWeatherData(mockWeatherResult)}
      >
        Set Weather Data
      </button>
      
      <button
        data-testid="clear-weather-data"
        onClick={() => setCurrentWeatherData(null)}
      >
        Clear Weather Data
      </button>
      
      <button
        data-testid="set-loading-true"
        onClick={() => setIsLoading(true)}
      >
        Set Loading True
      </button>
      
      <button
        data-testid="set-loading-false"
        onClick={() => setIsLoading(false)}
      >
        Set Loading False
      </button>
    </div>
  );
};

describe('CurrentWeatherProvider', () => {
  it('initializes with null weather data and loading false', () => {
    render(
      <CurrentWeatherProvider>
        <TestComponent />
      </CurrentWeatherProvider>
    );

    expect(screen.getByTestId('weather-data')).toHaveTextContent('null');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('updates weather data when setCurrentWeatherData is called', () => {
    render(
      <CurrentWeatherProvider>
        <TestComponent />
      </CurrentWeatherProvider>
    );

    act(() => {
      screen.getByTestId('set-weather-data').click();
    });

    expect(screen.getByTestId('weather-data')).toHaveTextContent('New York, US');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('clears weather data when setCurrentWeatherData is called with null', () => {
    render(
      <CurrentWeatherProvider>
        <TestComponent />
      </CurrentWeatherProvider>
    );

    // First set some data
    act(() => {
      screen.getByTestId('set-weather-data').click();
    });

    expect(screen.getByTestId('weather-data')).toHaveTextContent('New York, US');

    // Then clear it
    act(() => {
      screen.getByTestId('clear-weather-data').click();
    });

    expect(screen.getByTestId('weather-data')).toHaveTextContent('null');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('automatically sets loading to false when setCurrentWeatherData is called', () => {
    render(
      <CurrentWeatherProvider>
        <TestComponent />
      </CurrentWeatherProvider>
    );

    // First set loading to true
    act(() => {
      screen.getByTestId('set-loading-true').click();
    });

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    // Then set weather data, which should automatically set loading to false
    act(() => {
      screen.getByTestId('set-weather-data').click();
    });

    expect(screen.getByTestId('weather-data')).toHaveTextContent('New York, US');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('updates loading state when setIsLoading is called', () => {
    render(
      <CurrentWeatherProvider>
        <TestComponent />
      </CurrentWeatherProvider>
    );

    // Initially false
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');

    // Set to true
    act(() => {
      screen.getByTestId('set-loading-true').click();
    });

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');

    // Set back to false
    act(() => {
      screen.getByTestId('set-loading-false').click();
    });

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('maintains independent loading and weather data states', () => {
    render(
      <CurrentWeatherProvider>
        <TestComponent />
      </CurrentWeatherProvider>
    );

    // Set loading to true
    act(() => {
      screen.getByTestId('set-loading-true').click();
    });

    expect(screen.getByTestId('is-loading')).toHaveTextContent('true');
    expect(screen.getByTestId('weather-data')).toHaveTextContent('null');

    // Set loading to false without affecting weather data
    act(() => {
      screen.getByTestId('set-loading-false').click();
    });

    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
    expect(screen.getByTestId('weather-data')).toHaveTextContent('null');

    // Set weather data
    act(() => {
      screen.getByTestId('set-weather-data').click();
    });

    expect(screen.getByTestId('weather-data')).toHaveTextContent('New York, US');
    expect(screen.getByTestId('is-loading')).toHaveTextContent('false');
  });

  it('provides correct context value structure', () => {
    const TestContextValue = () => {
      const context = useCurrentWeather();
      
      return (
        <div>
          <div data-testid="has-current-weather-data">
            {typeof context.currentWeatherData !== 'undefined' ? 'defined' : 'undefined'}
          </div>
          <div data-testid="has-set-current-weather-data">
            {typeof context.setCurrentWeatherData === 'function' ? 'function' : 'not-function'}
          </div>
          <div data-testid="has-is-loading">
            {typeof context.isLoading === 'boolean' ? 'boolean' : 'not-boolean'}
          </div>
          <div data-testid="has-set-is-loading">
            {typeof context.setIsLoading === 'function' ? 'function' : 'not-function'}
          </div>
        </div>
      );
    };

    render(
      <CurrentWeatherProvider>
        <TestContextValue />
      </CurrentWeatherProvider>
    );

    expect(screen.getByTestId('has-current-weather-data')).toHaveTextContent('defined');
    expect(screen.getByTestId('has-set-current-weather-data')).toHaveTextContent('function');
    expect(screen.getByTestId('has-is-loading')).toHaveTextContent('boolean');
    expect(screen.getByTestId('has-set-is-loading')).toHaveTextContent('function');
  });
});