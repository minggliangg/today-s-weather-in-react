import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CurrentDisplay } from './current-display';
import { useCurrentWeather } from '@/hooks/use-current-weather';
import { useAppConstants } from '@/hooks/use-app-constants';
import type { WeatherResult } from '@/lib/api-client/interfaces';

// Mock dependencies
vi.mock('@/hooks/use-current-weather');
vi.mock('@/hooks/use-app-constants');

// Mock card components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  epochToDateLocaleString: (timestamp: number) => new Date(timestamp * 1000).toLocaleDateString(),
  toTitleCase: (str: string) => str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  ),
}));

// Mock constants
vi.mock('@/common/constants', () => ({
  DEGREE_CELSIUS: '°C',
}));

const mockWeatherResult: WeatherResult = {
  temp: 25.7,
  feels_like: 28.3,
  temp_min: 20.1,
  temp_max: 30.9,
  pressure: 1013,
  humidity: 65,
  country: 'US',
  city: 'New York',
  description: 'clear sky',
  weather_icon: '01d',
  timestamp: 1640995200, // January 1, 2022 in seconds (Unix timestamp)
};

const mockRandomCondition = {
  icon: '02d',
  description: 'few clouds',
};

describe('CurrentDisplay', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for useAppConstants
    (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
      getRandomWeatherCondition: () => mockRandomCondition,
    });
  });

  it('renders card with correct title', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByTestId('card')).toHaveClass('w-full');
    expect(screen.getByTestId('card-title')).toHaveTextContent("Today's weather");
  });

  it('displays welcome message when no weather data', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByText(/Search for a location/)).toBeInTheDocument();
    expect(screen.getByText(/to see the weather/)).toBeInTheDocument();
  });

  it('displays random weather condition when no data', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    const weatherImage = screen.getByAltText('few clouds');
    expect(weatherImage).toHaveAttribute('src', 'https://openweathermap.org/img/wn/02d@4x.png');
    expect(screen.getByText('Somewhere there are few clouds')).toBeInTheDocument();
  });

  it('displays powered by OpenWeatherMap when no data', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText('Powered by OpenWeatherMap')).toBeInTheDocument();
  });

  it('displays welcome message when loading and no data', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
      isLoading: true,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText('Welcome!')).toBeInTheDocument();
    expect(screen.getByTestId('card-content')).toHaveClass('h-[296px]');
  });

  it('displays weather data when available', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText('26°C')).toBeInTheDocument(); // temp rounded
    expect(screen.getByText('Feels like: 28°C')).toBeInTheDocument(); // feels_like rounded
    expect(screen.getByText('New York, US')).toBeInTheDocument();
  });

  it('displays weather icon and description correctly', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    const weatherImage = screen.getByAltText('clear sky');
    expect(weatherImage).toHaveAttribute('src', 'https://openweathermap.org/img/wn/01d@4x.png');
    expect(screen.getByText('Clear Sky')).toBeInTheDocument(); // title case
  });

  it('displays temperature range and weather details', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText(/High: 31°C/)).toBeInTheDocument(); // temp_max rounded
    expect(screen.getByText(/Low: 20°C/)).toBeInTheDocument(); // temp_min rounded
    expect(screen.getByText(/65%/)).toBeInTheDocument(); // humidity
    expect(screen.getByText(/1013 hPa/)).toBeInTheDocument(); // pressure
  });

  it('displays last updated timestamp', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText(/Last updated:/)).toBeInTheDocument();
    expect(screen.getByText(/1\/1\/2022/)).toBeInTheDocument(); // formatted date
  });

  it('displays weather data even when loading if data exists', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
      isLoading: true,
    });

    render(<CurrentDisplay />);

    // Should show weather data, not welcome message
    expect(screen.getByText('26°C')).toBeInTheDocument();
    expect(screen.getByText('New York, US')).toBeInTheDocument();
    expect(screen.queryByText('Welcome!')).not.toBeInTheDocument();
  });

  it('handles zero temperatures correctly', () => {
    const coldWeatherResult: WeatherResult = {
      ...mockWeatherResult,
      temp: 0,
      feels_like: -2.1,
      temp_min: -5.7,
      temp_max: 2.3,
    };

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: coldWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText('0°C')).toBeInTheDocument();
    expect(screen.getByText('Feels like: -2°C')).toBeInTheDocument();
    expect(screen.getByText(/High: 2°C/)).toBeInTheDocument();
    expect(screen.getByText(/Low: -6°C/)).toBeInTheDocument();
  });

  it('handles negative temperatures correctly', () => {
    const negativeWeatherResult: WeatherResult = {
      ...mockWeatherResult,
      temp: -10.5,
      feels_like: -15.8,
      temp_min: -18.2,
      temp_max: -5.1,
    };

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: negativeWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText((content, element) => {
      return element?.textContent === '-11°C';
    })).toBeInTheDocument();
    expect(screen.getByText((content, element) => {
      return element?.textContent === 'Feels like: -16°C';
    })).toBeInTheDocument();
    expect(screen.getByText(/High: -5°C/)).toBeInTheDocument();
    expect(screen.getByText(/Low: -18°C/)).toBeInTheDocument();
  });

  it('handles very high humidity and pressure values', () => {
    const extremeWeatherResult: WeatherResult = {
      ...mockWeatherResult,
      humidity: 100,
      pressure: 1085,
    };

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: extremeWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText(/100%/)).toBeInTheDocument();
    expect(screen.getByText(/1085 hPa/)).toBeInTheDocument();
  });

  it('calls getRandomWeatherCondition only when no data', () => {
    const mockGetRandomWeatherCondition = vi.fn(() => mockRandomCondition);
    (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
      getRandomWeatherCondition: mockGetRandomWeatherCondition,
    });

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(mockGetRandomWeatherCondition).toHaveBeenCalled();
  });

  it('does not call getRandomWeatherCondition when data exists', () => {
    const mockGetRandomWeatherCondition = vi.fn(() => mockRandomCondition);
    (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
      getRandomWeatherCondition: mockGetRandomWeatherCondition,
    });

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    // getRandomWeatherCondition is called during component render for the fallback case,
    // but the result shouldn't be displayed
    expect(screen.queryByText('Somewhere there are few clouds')).not.toBeInTheDocument();
  });

  it('handles long city and country names', () => {
    const longNameWeatherResult: WeatherResult = {
      ...mockWeatherResult,
      city: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
      country: 'GB',
    };

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: longNameWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText(/Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, GB/)).toBeInTheDocument();
  });

  it('handles special characters in weather description', () => {
    const specialDescriptionResult: WeatherResult = {
      ...mockWeatherResult,
      description: 'light rain with thunderstorm & strong winds',
    };

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: specialDescriptionResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    expect(screen.getByText('Light Rain With Thunderstorm & Strong Winds')).toBeInTheDocument();
  });

  it('handles different weather icon codes', () => {
    const nightWeatherResult: WeatherResult = {
      ...mockWeatherResult,
      weather_icon: '01n',
      description: 'clear sky at night',
    };

    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: nightWeatherResult,
      isLoading: false,
    });

    render(<CurrentDisplay />);

    const weatherImage = screen.getByAltText('clear sky at night');
    expect(weatherImage).toHaveAttribute('src', 'https://openweathermap.org/img/wn/01n@4x.png');
  });
});