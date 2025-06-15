import { render, screen, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SearchHistoryProvider } from './search-history-provider';
import { useSearchHistory } from '@/hooks/use-search-history';
import { useCurrentWeather } from '@/hooks/use-current-weather';
import { LocalstorageClient } from '@/lib/localstorage-client/localstorage-client';
import { getCoordinatesByLocationName, getWeatherInfo } from '@/lib/api-client/api';
import { toast } from 'sonner';
import { InvalidLocationError, NetworkError } from '@/common/custom-errors';
import type { WeatherResult } from '@/lib/api-client/interfaces';

// Mock dependencies
vi.mock('@/hooks/use-current-weather');
vi.mock('@/lib/localstorage-client/localstorage-client');
vi.mock('@/lib/api-client/api');
vi.mock('sonner');

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

// Test component
const TestComponent = () => {
  const {
    searchHistory,
    addWeatherResult,
    clearSearchHistory,
    removeWeatherResult,
    searchAgain,
  } = useSearchHistory();

  return (
    <div>
      <div data-testid="history-count">{searchHistory.length}</div>
      <button
        data-testid="add-result"
        onClick={() => addWeatherResult(mockWeatherResult)}
      >
        Add Result
      </button>
      <button data-testid="clear-history" onClick={clearSearchHistory}>
        Clear History
      </button>
      <button
        data-testid="remove-result"
        onClick={() => removeWeatherResult(mockWeatherResult)}
      >
        Remove Result
      </button>
      <button
        data-testid="search-again"
        onClick={() => searchAgain(mockWeatherResult)}
      >
        Search Again
      </button>
      {searchHistory.map((result, index) => (
        <div key={index} data-testid={`history-item-${index}`}>
          {result.city}, {result.country}
        </div>
      ))}
    </div>
  );
};

describe('SearchHistoryProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock useCurrentWeather hook
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      setCurrentWeatherData: mockSetCurrentWeatherData,
      setIsLoading: mockSetIsLoading,
    });

    // Mock LocalstorageClient
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue([]);
    (LocalstorageClient.setData as ReturnType<typeof vi.fn>).mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with empty search history when no localStorage data', () => {
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue(null);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    expect(LocalstorageClient.getData).toHaveBeenCalledWith({
      key: 'search-history',
    });
  });

  it('initializes with existing search history from localStorage', () => {
    const existingHistory = [mockWeatherResult];
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue(existingHistory);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    expect(screen.getByTestId('history-count')).toHaveTextContent('1');
    expect(screen.getByTestId('history-item-0')).toHaveTextContent('New York, US');
  });

  it('adds weather result to history and saves to localStorage', () => {
    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    act(() => {
      screen.getByTestId('add-result').click();
    });

    expect(screen.getByTestId('history-count')).toHaveTextContent('1');
    expect(screen.getByTestId('history-item-0')).toHaveTextContent('New York, US');
    expect(LocalstorageClient.setData).toHaveBeenCalledWith({
      key: 'search-history',
      value: [mockWeatherResult],
    });
  });

  it('adds new results to the beginning of the history', () => {
    const existingHistory = [mockWeatherResult];
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue(existingHistory);

    const newResult: WeatherResult = {
      ...mockWeatherResult,
      city: 'Los Angeles',
      country: 'US',
    };

    // Mock the add function to use the new result
    const TestComponentWithNewResult = () => {
      const { addWeatherResult } = useSearchHistory();
      return (
        <button
          data-testid="add-new-result"
          onClick={() => addWeatherResult(newResult)}
        >
          Add New Result
        </button>
      );
    };

    render(
      <SearchHistoryProvider>
        <TestComponentWithNewResult />
      </SearchHistoryProvider>
    );

    act(() => {
      screen.getByTestId('add-new-result').click();
    });

    expect(LocalstorageClient.setData).toHaveBeenCalledWith({
      key: 'search-history',
      value: [newResult, mockWeatherResult],
    });
  });

  it('limits history to 20 items', () => {
    const existingHistory = Array.from({ length: 20 }, (_, i) => ({
      ...mockWeatherResult,
      city: `City${i}`,
    }));
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue(existingHistory);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    act(() => {
      screen.getByTestId('add-result').click();
    });

    expect(LocalstorageClient.setData).toHaveBeenCalledWith({
      key: 'search-history',
      value: expect.arrayContaining([mockWeatherResult]),
    });

    const savedData = (LocalstorageClient.setData as ReturnType<typeof vi.fn>).mock.calls[0][0].value;
    expect(savedData).toHaveLength(20);
    expect(savedData[0]).toEqual(mockWeatherResult);
  });

  it('clears search history and updates localStorage', () => {
    const existingHistory = [mockWeatherResult];
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue(existingHistory);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    expect(screen.getByTestId('history-count')).toHaveTextContent('1');

    act(() => {
      screen.getByTestId('clear-history').click();
    });

    expect(screen.getByTestId('history-count')).toHaveTextContent('0');
    expect(LocalstorageClient.setData).toHaveBeenCalledWith({
      key: 'search-history',
      value: [],
    });
  });

  it('removes specific weather result from history', () => {
    const anotherResult: WeatherResult = {
      ...mockWeatherResult,
      city: 'Chicago',
    };
    const existingHistory = [mockWeatherResult, anotherResult];
    (LocalstorageClient.getData as ReturnType<typeof vi.fn>).mockReturnValue(existingHistory);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    expect(screen.getByTestId('history-count')).toHaveTextContent('2');

    act(() => {
      screen.getByTestId('remove-result').click();
    });

    expect(screen.getByTestId('history-count')).toHaveTextContent('1');
    expect(LocalstorageClient.setData).toHaveBeenCalledWith({
      key: 'search-history',
      value: [anotherResult],
    });
  });

  it('successfully performs search again', async () => {
    const coordinates = { lat: 40.7128, lon: -74.0060 };
    const newWeatherResult: WeatherResult = {
      ...mockWeatherResult,
      temp: 22,
    };

    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockResolvedValue(coordinates);
    (getWeatherInfo as ReturnType<typeof vi.fn>).mockResolvedValue(newWeatherResult);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    act(() => {
      screen.getByTestId('search-again').click();
    });

    await waitFor(() => {
      expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    });

    await waitFor(() => {
      expect(getCoordinatesByLocationName).toHaveBeenCalledWith({
        city: 'New York',
        countryCode: 'US',
      });
    });

    await waitFor(() => {
      expect(getWeatherInfo).toHaveBeenCalledWith(coordinates);
    });

    await waitFor(() => {
      expect(mockSetCurrentWeatherData).toHaveBeenCalledWith(newWeatherResult);
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles network error during search again', async () => {
    const networkError = new NetworkError('Network failed', 500);
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValue(networkError);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    screen.getByTestId('search-again').click();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error: 500 Network failed');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles invalid location error during search again', async () => {
    const locationError = new InvalidLocationError('Location not found');
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValue(locationError);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    screen.getByTestId('search-again').click();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid location: Location not found');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles generic error during search again', async () => {
    const genericError = new Error('Something went wrong');
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValue(genericError);

    render(
      <SearchHistoryProvider>
        <TestComponent />
      </SearchHistoryProvider>
    );

    screen.getByTestId('search-again').click();

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unknown error occurred: Something went wrong');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });
});