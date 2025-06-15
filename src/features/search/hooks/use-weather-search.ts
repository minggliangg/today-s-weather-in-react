import { useState } from 'react';
import {
  getCoordinatesByLocationName,
  getWeatherInfo,
} from '@/lib/api-client/api.ts';
import { useCurrentWeatherContext } from '@/hooks/use-current-weather-context.ts';

export const useWeatherSearch = () => {
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
      const { lon, lat } = await getCoordinatesByLocationName({
        city,
        country,
      });

      const weatherResult = await getWeatherInfo({ lon, lat });
      setIsLoading(false);
      setCurrentWeatherData(weatherResult);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('An unknown error occurred'),
      );
      console.error(err);
    } finally {
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
