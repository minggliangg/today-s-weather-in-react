import type { WeatherResult } from '@/lib/api-client/interfaces.ts';
import { createContext } from 'react';

export interface SearchHistoryContextType {
  searchHistory: WeatherResult[];
  addWeatherResult: (result: WeatherResult) => void;
  clearSearchHistory: () => void;
  removeWeatherResult: (result: WeatherResult) => void;
  searchAgain: (entry: WeatherResult) => Promise<void>;
}

export const SearchHistoryContext = createContext<
  SearchHistoryContextType | undefined
>(undefined);
