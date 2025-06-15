import { useState } from 'react';
import {
  getCoordinatesByLocationName,
  getWeatherInfo,
} from '@/lib/api-client/api.ts';
import { useCurrentWeatherContext } from '@/hooks/use-current-weather-context.ts';
import { useAppConstantsContext } from '@/hooks/use-app-constants-context.ts';

export const useWeatherSearch = () => {
  const { getCountryCodeFromLabel } = useAppConstantsContext();
  const { setIsLoading, setCurrentWeatherData } = useCurrentWeatherContext();
  // Form state
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [open, setOpen] = useState(false);

  // Results state
  const [isPerformingSearch, setIsPerformingSearch] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const handleSearch = async () => {
    if (!city) return;

    setIsPerformingSearch(true);
    setIsLoading(true);
    setError(null);

    try {
      const countryCode = getCountryCodeFromLabel(country);
      const { lon, lat } = await getCoordinatesByLocationName({
        city,
        countryCode,
      });

      const weatherResult = await getWeatherInfo({ lon, lat });

      setCurrentWeatherData(weatherResult);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('An unknown error occurred'),
      );
    } finally {
      setIsLoading(false);
      setIsPerformingSearch(false);
    }
  };

  const handleClear = () => {
    setCity('');
    setCountry('');
    setError(null);
  };

  return {
    // Form state
    city,
    setCity,
    country,
    setCountry,
    open,
    setOpen,
    // Results state
    isLoading: isPerformingSearch,
    error,
    // Actions
    handleSearch,
    handleClear,
  };
};
