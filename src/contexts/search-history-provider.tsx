import type { WeatherResult } from '@/lib/api-client/interfaces.ts';
import { type PropsWithChildren, useState } from 'react';
import {
  SearchHistoryContext,
  type SearchHistoryContextType,
} from '@/contexts/search_history-context.ts';
import { LocalstorageClient } from '@/lib/localstorage-client/localstorage-client.ts';
import {
  getCoordinatesByLocationName,
  getWeatherInfo,
} from '@/lib/api-client/api.ts';
import { useCurrentWeather } from '@/hooks/use-current-weather.ts';
import { toast } from 'sonner';
import { InvalidLocationError, NetworkError } from '@/common/custom-errors.ts';

const SEARCH_HISTORY_KEY = 'search-history';

export const SearchHistoryProvider = ({ children }: PropsWithChildren) => {
  const { setCurrentWeatherData, setIsLoading } = useCurrentWeather();

  const [searchHistory, setSearchHistory] = useState<WeatherResult[]>(
    () =>
      LocalstorageClient.getData<WeatherResult[]>({
        key: SEARCH_HISTORY_KEY,
      }) ?? [],
  );

  const addWeatherResult = (result: WeatherResult) => {
    setSearchHistory((prevHistory) => {
      // Create a new array with the new result at the beginning
      const newHistory = [result, ...prevHistory];

      // Limit to 20 items
      const limitedHistory = newHistory.slice(0, 20);

      // Update localStorage
      LocalstorageClient.setData<WeatherResult[]>({
        key: SEARCH_HISTORY_KEY,
        value: limitedHistory,
      });

      return limitedHistory;
    });
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    LocalstorageClient.setData<WeatherResult[]>({
      key: SEARCH_HISTORY_KEY,
      value: [],
    });
  };

  const removeWeatherResult = (result: WeatherResult) => {
    setSearchHistory((prevHistory) => {
      const updatedHistory = prevHistory.filter((item) => 
        !(item.city === result.city && 
          item.country === result.country && 
          item.timestamp === result.timestamp)
      );

      LocalstorageClient.setData<WeatherResult[]>({
        key: SEARCH_HISTORY_KEY,
        value: updatedHistory,
      });

      return updatedHistory;
    });
  };

  const searchAgain = async (entry: WeatherResult) => {
    setIsLoading(true);

    try {
      const countryCode = entry.country;
      const { lon, lat } = await getCoordinatesByLocationName({
        city: entry.city,
        countryCode,
      });

      const weatherResult = await getWeatherInfo({ lon, lat });
      setCurrentWeatherData(weatherResult);
      addWeatherResult(weatherResult);
    } catch (err) {
      if (err instanceof NetworkError) {
        toast.error(`Network error: ${err.statusCode} ${err.message}`);
      } else if (err instanceof InvalidLocationError) {
        toast.error(`Invalid location: ${err.message}`);
      } else if (err instanceof Error) {
        toast.error(`An unknown error occurred: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Create the context value
  const value: SearchHistoryContextType = {
    searchHistory,
    addWeatherResult,
    clearSearchHistory,
    removeWeatherResult,
    searchAgain,
  };

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
};
