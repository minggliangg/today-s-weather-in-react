import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useWeatherSearch } from './use-weather-search';
import { useCurrentWeather } from '@/hooks/use-current-weather';
import { useAppConstants } from '@/hooks/use-app-constants';
import { useSearchHistory } from '@/hooks/use-search-history';
import { getCoordinatesByLocationName, getWeatherInfo } from '@/lib/api-client/api';
import { toast } from 'sonner';
import { InvalidLocationError, NetworkError } from '@/common/custom-errors';
import type { WeatherResult } from '@/lib/api-client/interfaces';

// Mock dependencies
vi.mock('@/hooks/use-current-weather');
vi.mock('@/hooks/use-app-constants');
vi.mock('@/hooks/use-search-history');
vi.mock('@/lib/api-client/api');
vi.mock('sonner');

const mockSetIsLoading = vi.fn();
const mockSetCurrentWeatherData = vi.fn();
const mockAddWeatherResult = vi.fn();
const mockGetCountryCodeFromLabel = vi.fn();

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

describe('useWeatherSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useCurrentWeather
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      setIsLoading: mockSetIsLoading,
      setCurrentWeatherData: mockSetCurrentWeatherData,
    });

    // Mock useAppConstants
    (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
      getCountryCodeFromLabel: mockGetCountryCodeFromLabel,
    });

    // Mock useSearchHistory
    (useSearchHistory as ReturnType<typeof vi.fn>).mockReturnValue({
      addWeatherResult: mockAddWeatherResult,
    });

    // Default mock return values
    mockGetCountryCodeFromLabel.mockReturnValue('US');
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useWeatherSearch());

    expect(result.current.city).toBe('');
    expect(result.current.country).toBe('');
    expect(result.current.open).toBe(false);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('updates city state', () => {
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('London');
    });

    expect(result.current.city).toBe('London');
  });

  it('updates country state', () => {
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCountry('United Kingdom');
    });

    expect(result.current.country).toBe('United Kingdom');
  });

  it('updates open state', () => {
    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setOpen(true);
    });

    expect(result.current.open).toBe(true);
  });

  it('does not perform search when city is empty', async () => {
    const { result } = renderHook(() => useWeatherSearch());

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(getCoordinatesByLocationName).not.toHaveBeenCalled();
    expect(mockSetIsLoading).not.toHaveBeenCalled();
  });

  it('performs successful search', async () => {
    const coordinates = { lat: 40.7128, lon: -74.0060 };
    
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockResolvedValue(coordinates);
    (getWeatherInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockWeatherResult);

    const { result } = renderHook(() => useWeatherSearch());

    // Set city first
    act(() => {
      result.current.setCity('New York');
      result.current.setCountry('United States');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(mockSetIsLoading).toHaveBeenCalledWith(true);
    expect(getCoordinatesByLocationName).toHaveBeenCalledWith({
      city: 'New York',
      countryCode: 'US',
    });
    expect(getWeatherInfo).toHaveBeenCalledWith(coordinates);
    expect(mockSetCurrentWeatherData).toHaveBeenCalledWith(mockWeatherResult);
    expect(mockAddWeatherResult).toHaveBeenCalledWith(mockWeatherResult);
    expect(mockSetIsLoading).toHaveBeenCalledWith(false);
  });

  it('performs search without country', async () => {
    const coordinates = { lat: 40.7128, lon: -74.0060 };
    
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockResolvedValue(coordinates);
    (getWeatherInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockWeatherResult);
    mockGetCountryCodeFromLabel.mockReturnValue(undefined);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('New York');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(getCoordinatesByLocationName).toHaveBeenCalledWith({
      city: 'New York',
      countryCode: undefined,
    });
    expect(mockSetCurrentWeatherData).toHaveBeenCalledWith(mockWeatherResult);
  });

  it('handles NetworkError during search', async () => {
    const networkError = new NetworkError('Server error', 500);
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValue(networkError);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('New York');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error: 500 Server error');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('handles InvalidLocationError during search', async () => {
    const locationError = new InvalidLocationError('Location not found');
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValue(locationError);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('InvalidCity');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(locationError);
      expect(toast.error).not.toHaveBeenCalled();
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles generic Error during search', async () => {
    const genericError = new Error('Something went wrong');
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValue(genericError);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('New York');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('An unknown error occurred: Something went wrong');
      expect(mockSetIsLoading).toHaveBeenCalledWith(false);
    });
  });

  it('handles error during getWeatherInfo', async () => {
    const coordinates = { lat: 40.7128, lon: -74.0060 };
    const weatherError = new NetworkError('Weather service error', 503);
    
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockResolvedValue(coordinates);
    (getWeatherInfo as ReturnType<typeof vi.fn>).mockRejectedValue(weatherError);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('New York');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Network error: 503 Weather service error');
      expect(mockSetCurrentWeatherData).not.toHaveBeenCalled();
      expect(mockAddWeatherResult).not.toHaveBeenCalled();
    });
  });

  it('clears all form data and error state', async () => {
    const { result } = renderHook(() => useWeatherSearch());

    // Set some initial state
    act(() => {
      result.current.setCity('New York');
      result.current.setCountry('United States');
    });

    // Simulate error state
    await act(async () => {
      await result.current.handleSearch(); // This will set error if city validation fails
    });

    // Clear everything
    act(() => {
      result.current.handleClear();
    });

    expect(result.current.city).toBe('');
    expect(result.current.country).toBe('');
    expect(result.current.error).toBe(null);
    expect(mockSetCurrentWeatherData).toHaveBeenCalledWith(null);
  });

  it('sets loading state correctly during search', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockReturnValue(promise);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('New York');
    });

    // Start search
    act(() => {
      result.current.handleSearch();
    });

    // Should be loading
    expect(result.current.isLoading).toBe(true);
    expect(mockSetIsLoading).toHaveBeenCalledWith(true);

    // Resolve the promise
    await act(async () => {
      resolvePromise!({ lat: 40.7128, lon: -74.0060 });
      await promise;
    });

    // Should not be loading anymore
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });

  it('clears error state when starting new search', async () => {
    const locationError = new InvalidLocationError('Location not found');
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockRejectedValueOnce(locationError);

    const { result } = renderHook(() => useWeatherSearch());

    act(() => {
      result.current.setCity('InvalidCity');
    });

    // First search with error
    await act(async () => {
      await result.current.handleSearch();
    });

    expect(result.current.error).toEqual(locationError);

    // Mock successful response for second search
    (getCoordinatesByLocationName as ReturnType<typeof vi.fn>).mockResolvedValue({ lat: 40.7128, lon: -74.0060 });
    (getWeatherInfo as ReturnType<typeof vi.fn>).mockResolvedValue(mockWeatherResult);

    // Second search should clear error
    act(() => {
      result.current.setCity('New York');
    });

    await act(async () => {
      await result.current.handleSearch();
    });

    expect(result.current.error).toBe(null);
  });

  it('maintains proper state isolation between multiple hook instances', () => {
    const { result: result1 } = renderHook(() => useWeatherSearch());
    const { result: result2 } = renderHook(() => useWeatherSearch());

    act(() => {
      result1.current.setCity('New York');
      result2.current.setCity('London');
    });

    expect(result1.current.city).toBe('New York');
    expect(result2.current.city).toBe('London');
    expect(result1.current.city).not.toBe(result2.current.city);
  });
});