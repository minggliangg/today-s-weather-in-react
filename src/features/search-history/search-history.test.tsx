import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SearchHistory } from './search-history';
import { useSearchHistory } from '@/hooks/use-search-history';
import { useCurrentWeather } from '@/hooks/use-current-weather';
import type { WeatherResult } from '@/lib/api-client/interfaces';

// Mock dependencies
vi.mock('@/hooks/use-search-history');
vi.mock('@/hooks/use-current-weather');

// Mock UI components
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="card" className={className}>{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-header">{children}</div>
  ),
  CardTitle: ({ children }: { children: React.ReactNode }) => (
    <h3 data-testid="card-title">{children}</h3>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <p data-testid="card-description">{children}</p>
  ),
  CardAction: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-action">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ 
    children, 
    onClick, 
    disabled, 
    title, 
    variant, 
    size 
  }: { 
    children: React.ReactNode; 
    onClick?: () => void; 
    disabled?: boolean; 
    title?: string;
    variant?: string;
    size?: string;
  }) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      disabled={disabled} 
      title={title}
      data-variant={variant}
      data-size={size}
    >
      {children}
    </button>
  ),
}));

// Mock utils
vi.mock('@/lib/utils', () => ({
  epochToDateLocaleString: (timestamp: number) => new Date(timestamp).toLocaleDateString(),
}));

// Mock constants
vi.mock('@/common/constants', () => ({
  DEGREE_CELSIUS: '°C',
}));

const mockWeatherResults: WeatherResult[] = [
  {
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
    timestamp: 1640995200000, // January 1, 2022
  },
  {
    temp: 18.2,
    feels_like: 20.1,
    temp_min: 15.0,
    temp_max: 22.5,
    pressure: 1020,
    humidity: 72,
    country: 'GB',
    city: 'London',
    description: 'few clouds',
    weather_icon: '02d',
    timestamp: 1640995100000, // January 1, 2022 (earlier)
  },
  {
    temp: 30.5,
    feels_like: 35.2,
    temp_min: 28.0,
    temp_max: 33.1,
    pressure: 1008,
    humidity: 58,
    country: 'SG',
    city: 'Singapore',
    description: 'scattered clouds',
    weather_icon: '03d',
    timestamp: 1640995000000, // January 1, 2022 (earliest)
  },
];

const mockClearSearchHistory = vi.fn();
const mockRemoveWeatherResult = vi.fn();
const mockSearchAgain = vi.fn();

describe('SearchHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for useCurrentWeather
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: false,
    });
  });

  it('renders card with correct title and description', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByTestId('card')).toHaveClass('w-full');
    expect(screen.getByTestId('card-title')).toHaveTextContent('Search History');
    expect(screen.getByTestId('card-description')).toHaveTextContent('Showing your last 20 searches');
  });

  it('displays empty state message when no search history', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText('No search history yet')).toBeInTheDocument();
  });

  it('disables clear all button when no search history', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const clearAllButton = screen.getByTitle('Clear all');
    expect(clearAllButton).toBeDisabled();
    expect(clearAllButton).toHaveAttribute('data-variant', 'destructive');
    expect(clearAllButton).toHaveAttribute('data-size', 'icon');
  });

  it('displays search history entries', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText('#1 New York, US - 26°C')).toBeInTheDocument();
    expect(screen.getByText('#2 London, GB - 18°C')).toBeInTheDocument();
    expect(screen.getByText('#3 Singapore, SG - 31°C')).toBeInTheDocument();
  });

  it('displays formatted timestamps for each entry', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const timestamps = screen.getAllByText('1/1/2022');
    expect(timestamps).toHaveLength(3); // One for each weather result
  });

  it('enables clear all button when search history exists', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const clearAllButton = screen.getByTitle('Clear all');
    expect(clearAllButton).not.toBeDisabled();
  });

  it('calls clearSearchHistory when clear all button is clicked', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const clearAllButton = screen.getByTitle('Clear all');
    
    act(() => {
      fireEvent.click(clearAllButton);
    });

    expect(mockClearSearchHistory).toHaveBeenCalled();
  });

  it('displays search buttons for each entry', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const searchButtons = screen.getAllByTitle(/Search for entry \d+ again/);
    expect(searchButtons).toHaveLength(3);
    
    expect(screen.getByTitle('Search for entry 1 again')).toBeInTheDocument();
    expect(screen.getByTitle('Search for entry 2 again')).toBeInTheDocument();
    expect(screen.getByTitle('Search for entry 3 again')).toBeInTheDocument();
  });

  it('displays clear buttons for each entry', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const clearButtons = screen.getAllByTitle(/Clear entry \d+/);
    expect(clearButtons).toHaveLength(3);
    
    expect(screen.getByTitle('Clear entry 1')).toBeInTheDocument();
    expect(screen.getByTitle('Clear entry 2')).toBeInTheDocument();
    expect(screen.getByTitle('Clear entry 3')).toBeInTheDocument();
  });

  it('calls searchAgain when search button is clicked', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const searchButton = screen.getByTitle('Search for entry 1 again');
    
    act(() => {
      fireEvent.click(searchButton);
    });

    expect(mockSearchAgain).toHaveBeenCalledWith(mockWeatherResults[0]);
  });

  it('calls removeWeatherResult when clear entry button is clicked', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const clearButton = screen.getByTitle('Clear entry 2');
    
    act(() => {
      fireEvent.click(clearButton);
    });

    expect(mockRemoveWeatherResult).toHaveBeenCalledWith(mockWeatherResults[1]);
  });

  it('disables search buttons when loading', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
    });

    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const searchButtons = screen.getAllByTitle(/Search for entry \d+ again/);
    searchButtons.forEach(button => {
      expect(button).toBeDisabled();
    });
  });

  it('does not disable clear buttons when loading', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      isLoading: true,
    });

    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const clearButtons = screen.getAllByTitle(/Clear entry \d+/);
    clearButtons.forEach(button => {
      expect(button).not.toBeDisabled();
    });
  });

  it('applies correct styling to list items', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [mockWeatherResults[0]],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const listItem = screen.getByText('#1 New York, US - 26°C').closest('li');
    expect(listItem).toHaveClass('flex', 'items-center', 'justify-between', 'p-2', 'hover:bg-muted', 'rounded-md');
  });

  it('handles single search history entry correctly', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [mockWeatherResults[0]],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText('#1 New York, US - 26°C')).toBeInTheDocument();
    expect(screen.queryByText('#2')).not.toBeInTheDocument();
    expect(screen.getByTitle('Clear all')).not.toBeDisabled();
  });

  it('handles negative temperatures correctly in display', () => {
    const coldWeatherResult: WeatherResult = {
      ...mockWeatherResults[0],
      temp: -5.2,
      city: 'Moscow',
      country: 'RU',
    };

    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [coldWeatherResult],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText('#1 Moscow, RU - -5°C')).toBeInTheDocument();
  });

  it('handles high temperature values correctly', () => {
    const hotWeatherResult: WeatherResult = {
      ...mockWeatherResults[0],
      temp: 45.8,
      city: 'Dubai',
      country: 'AE',
    };

    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [hotWeatherResult],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText('#1 Dubai, AE - 46°C')).toBeInTheDocument();
  });

  it('handles long city names correctly', () => {
    const longCityNameResult: WeatherResult = {
      ...mockWeatherResults[0],
      city: 'Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch',
      country: 'GB',
    };

    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: [longCityNameResult],
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText(/Llanfairpwllgwyngyllgogerychwyrndrobwllllantysiliogogogoch, GB/)).toBeInTheDocument();
  });

  it('applies correct button styling', () => {
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: mockWeatherResults,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    const searchButton = screen.getByTitle('Search for entry 1 again');
    const clearEntryButton = screen.getByTitle('Clear entry 1');
    const clearAllButton = screen.getByTitle('Clear all');

    expect(searchButton).toHaveAttribute('data-size', 'icon');
    expect(clearEntryButton).toHaveAttribute('data-size', 'icon');
    expect(clearEntryButton).toHaveAttribute('data-variant', 'destructive');
    expect(clearAllButton).toHaveAttribute('data-size', 'icon');
    expect(clearAllButton).toHaveAttribute('data-variant', 'destructive');
  });

  it('renders correct number of entries for different array sizes', () => {
    // Test with 5 entries
    const fiveEntries = mockWeatherResults.slice(0, 2).concat([
      { ...mockWeatherResults[0], city: 'Tokyo', country: 'JP' },
      { ...mockWeatherResults[0], city: 'Paris', country: 'FR' },
      { ...mockWeatherResults[0], city: 'Sydney', country: 'AU' },
    ]);

    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      searchHistory: fiveEntries,
      clearSearchHistory: mockClearSearchHistory,
      removeWeatherResult: mockRemoveWeatherResult,
      searchAgain: mockSearchAgain,
    });

    render(<SearchHistory />);

    expect(screen.getByText('#1 New York, US - 26°C')).toBeInTheDocument();
    expect(screen.getByText('#2 London, GB - 18°C')).toBeInTheDocument();
    expect(screen.getByText('#3 Tokyo, JP - 26°C')).toBeInTheDocument();
    expect(screen.getByText('#4 Paris, FR - 26°C')).toBeInTheDocument();
    expect(screen.getByText('#5 Sydney, AU - 26°C')).toBeInTheDocument();
  });
});