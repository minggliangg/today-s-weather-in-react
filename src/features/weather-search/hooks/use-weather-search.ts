import { useState } from 'react';
import { getCoordinatesByLocationName, getWeatherInfo } from '@/lib/api-client/api.ts';
import { useCurrentWeatherContext } from '@/hooks/use-current-weather-context.ts';
import { useAppConstantsContext } from '@/hooks/use-app-constants-context.ts';
import { InvalidLocationError, NetworkError } from '@/common/custom-errors.ts';
import { toast } from 'sonner';
import { useSearchHistoryContext } from '@/hooks/use-search-history-context.ts';

export const useWeatherSearch = () => {
  const { getCountryCodeFromLabel } = useAppConstantsContext();
  const { setIsLoading, setCurrentWeatherData } = useCurrentWeatherContext();
  const { addWeatherResult } = useSearchHistoryContext();

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
      addWeatherResult(weatherResult);
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error(`Network error: ${err.statusCode} ${err.message}`);
      } else if (err instanceof InvalidLocationError) {
        setError(err);
      } else if (err instanceof Error) {
        toast.error(`An unknown error occurred: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
      setIsPerformingSearch(false);
    }
  };

  const handleClear = () => {
    setCity('');
    setCountry('');
    setCurrentWeatherData(null);
    setError(null);
  };

  return {
    city,
    setCity,
    country,
    setCountry,
    open,
    setOpen,
    isLoading: isPerformingSearch,
    error,
    handleSearch,
    handleClear,
  };
};
