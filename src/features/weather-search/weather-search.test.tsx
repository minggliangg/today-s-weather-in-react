import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import WeatherSearch from './weather-search';
import { useWeatherSearch } from './hooks/use-weather-search';
import { useCurrentWeather } from '@/hooks/use-current-weather';
import { useAppConstants } from '@/hooks/use-app-constants';
import type { WeatherResult } from '@/lib/api-client/interfaces';

// Mock dependencies
vi.mock('./hooks/use-weather-search');
vi.mock('@/hooks/use-current-weather');
vi.mock('@/hooks/use-app-constants');
vi.mock('./components/country-selector', () => ({
  CountrySelector: ({
    open,
    setOpen,
    selectedCountry,
    setSelectedCountry,
    id,
  }: {
    open: boolean;
    setOpen: (open: boolean) => void;
    selectedCountry: string;
    setSelectedCountry: (country: string) => void;
    id: string;
  }) => (
    <div data-testid="country-selector">
      <button
        data-testid="country-selector-trigger"
        onClick={() => setOpen(!open)}
        id={id}
      >
        {selectedCountry || 'Select a country...'}
      </button>
      {open && (
        <div data-testid="country-selector-options">
          <button
            data-testid="select-us"
            onClick={() => {
              setSelectedCountry('United States');
              setOpen(false);
            }}
          >
            United States
          </button>
          <button
            data-testid="select-uk"
            onClick={() => {
              setSelectedCountry('United Kingdom');
              setOpen(false);
            }}
          >
            United Kingdom
          </button>
        </div>
      )}
    </div>
  ),
}));

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

const mockSetCity = vi.fn();
const mockSetCountry = vi.fn();
const mockSetOpen = vi.fn();
const mockHandleSearch = vi.fn();
const mockHandleClear = vi.fn();
const mockGetLabelFromCountryCode = vi.fn();

describe('WeatherSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useWeatherSearch hook
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: '',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    // Mock useCurrentWeather hook
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: null,
    });

    // Mock useAppConstants hook
    (useAppConstants as ReturnType<typeof vi.fn>).mockReturnValue({
      getLabelFromCountryCode: mockGetLabelFromCountryCode,
    });

    mockGetLabelFromCountryCode.mockReturnValue('United States');
  });

  it('renders all form elements', () => {
    render(<WeatherSearch />);

    expect(screen.getByLabelText(/city/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/country/i)).toBeInTheDocument();
    expect(screen.getByTitle('Search')).toBeInTheDocument();
    expect(screen.getByTitle('Clear search')).toBeInTheDocument();
    expect(screen.getByTestId('country-selector')).toBeInTheDocument();
  });

  it('displays city input with placeholder', () => {
    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    expect(cityInput).toBeInTheDocument();
    expect(cityInput).toHaveAttribute('type', 'text');
    expect(cityInput).toHaveAttribute('required');
  });

  it('calls setCity when city input changes', () => {
    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    
    act(() => {
      fireEvent.change(cityInput, { target: { value: 'London' } });
    });

    expect(mockSetCity).toHaveBeenCalledWith('London');
    expect(mockSetCountry).toHaveBeenCalledWith(''); // Should clear country when city changes
  });

  it('calls handleSearch when search button is clicked', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: 'United States',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const searchButton = screen.getByTitle('Search');
    
    act(() => {
      fireEvent.click(searchButton);
    });

    expect(mockHandleSearch).toHaveBeenCalled();
  });

  it('calls handleClear when clear button is clicked', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: 'United States',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const clearButton = screen.getByTitle('Clear search');
    
    act(() => {
      fireEvent.click(clearButton);
    });

    expect(mockHandleClear).toHaveBeenCalled();
  });

  it('disables search button when loading', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: true,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const searchButton = screen.getByTitle('Search');
    expect(searchButton).toBeDisabled();
  });

  it('disables search button when city is empty', () => {
    render(<WeatherSearch />);

    const searchButton = screen.getByTitle('Search');
    expect(searchButton).toBeDisabled();
  });

  it('enables search button when city is provided', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const searchButton = screen.getByTitle('Search');
    expect(searchButton).not.toBeDisabled();
  });

  it('disables clear button when loading', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: 'United States',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: true,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const clearButton = screen.getByTitle('Clear search');
    expect(clearButton).toBeDisabled();
  });

  it('disables clear button when both city and country are empty', () => {
    render(<WeatherSearch />);

    const clearButton = screen.getByTitle('Clear search');
    expect(clearButton).toBeDisabled();
  });

  it('enables clear button when city is provided', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const clearButton = screen.getByTitle('Clear search');
    expect(clearButton).not.toBeDisabled();
  });

  it('enables clear button when country is provided', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: '',
      setCity: mockSetCity,
      country: 'United States',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const clearButton = screen.getByTitle('Clear search');
    expect(clearButton).not.toBeDisabled();
  });

  it('displays error message when error exists', () => {
    const error = new Error('Location not found');
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'InvalidCity',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    expect(screen.getByText('Location not found')).toBeInTheDocument();
  });

  it('applies error styling to city input when error exists', () => {
    const error = new Error('Location not found');
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'InvalidCity',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    expect(cityInput).toHaveClass('border-destructive');
  });

  it('calls handleSearch when Enter key is pressed in city input', async () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    
    await act(async () => {
      fireEvent.keyDown(cityInput, { key: 'Enter', code: 'Enter' });
    });

    expect(mockHandleSearch).toHaveBeenCalled();
  });

  it('does not call handleSearch when Enter key is pressed with empty city', async () => {
    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    
    await act(async () => {
      fireEvent.keyDown(cityInput, { key: 'Enter', code: 'Enter' });
    });

    expect(mockHandleSearch).not.toHaveBeenCalled();
  });

  it('does not call handleSearch when other keys are pressed', async () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    
    await act(async () => {
      fireEvent.keyDown(cityInput, { key: 'Escape', code: 'Escape' });
    });

    expect(mockHandleSearch).not.toHaveBeenCalled();
  });

  it('updates form fields when currentWeatherData changes', () => {
    (useCurrentWeather as ReturnType<typeof vi.fn>).mockReturnValue({
      currentWeatherData: mockWeatherResult,
    });

    render(<WeatherSearch />);

    expect(mockSetCity).toHaveBeenCalledWith('New York');
    expect(mockSetCountry).toHaveBeenCalledWith('United States');
  });

  it('passes correct props to CountrySelector', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: '',
      setCity: mockSetCity,
      country: 'United States',
      setCountry: mockSetCountry,
      open: true,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    expect(screen.getByTestId('country-selector-trigger')).toHaveTextContent('United States');
    expect(screen.getByTestId('country-selector-options')).toBeInTheDocument();
  });

  it('handles country selection through CountrySelector', () => {
    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: '',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: true,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const selectUSButton = screen.getByTestId('select-us');
    
    act(() => {
      fireEvent.click(selectUSButton);
    });

    expect(mockSetCountry).toHaveBeenCalledWith('United States');
    expect(mockSetOpen).toHaveBeenCalledWith(false);
  });

  it('renders with correct layout classes', () => {
    render(<WeatherSearch />);

    const container = screen.getByLabelText(/city/i).closest('.flex.flex-wrap.items-end.gap-3');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('flex', 'flex-wrap', 'items-end', 'gap-3');
  });

  it('handles async search correctly', async () => {
    let resolveSearch: () => void;
    const searchPromise = new Promise<void>((resolve) => {
      resolveSearch = resolve;
    });

    mockHandleSearch.mockReturnValue(searchPromise);

    (useWeatherSearch as ReturnType<typeof vi.fn>).mockReturnValue({
      city: 'New York',
      setCity: mockSetCity,
      country: '',
      setCountry: mockSetCountry,
      open: false,
      setOpen: mockSetOpen,
      error: null,
      isLoading: false,
      handleSearch: mockHandleSearch,
      handleClear: mockHandleClear,
    });

    render(<WeatherSearch />);

    const cityInput = screen.getByPlaceholderText('eg. Singapore');
    
    // Trigger search via Enter key
    fireEvent.keyDown(cityInput, { key: 'Enter', code: 'Enter' });

    expect(mockHandleSearch).toHaveBeenCalled();

    // Resolve the async search
    await act(async () => {
      resolveSearch!();
      await searchPromise;
    });
  });
});