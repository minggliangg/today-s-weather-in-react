import type { WeatherResult } from '@/lib/api-client/interfaces.ts';
import { type PropsWithChildren, useState } from 'react';
import {
  SearchHistoryContext,
  type SearchHistoryContextType,
} from '@/contexts/search_history-context.ts';
import { LocalstorageClient } from '@/lib/localstorage-client/localstorage-client.ts';

const SEARCH_HISTORY_KEY = 'search-history';

export const SearchHistoryProvider = ({ children }: PropsWithChildren) => {
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
      const updatedHistory = prevHistory.filter((item) => item !== result);

      LocalstorageClient.setData<WeatherResult[]>({
        key: SEARCH_HISTORY_KEY,
        value: updatedHistory,
      });

      return updatedHistory;
    });
  };

  // Create the context value
  const value: SearchHistoryContextType = {
    searchHistory,
    addWeatherResult,
    clearSearchHistory,
    removeWeatherResult,
  };

  return (
    <SearchHistoryContext.Provider value={value}>
      {children}
    </SearchHistoryContext.Provider>
  );
};
