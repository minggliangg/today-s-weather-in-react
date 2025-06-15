import type { WeatherResult } from '@/lib/api-client/interfaces.ts';
import { createContext } from 'react';

export interface CurrentWeatherContextType {
  // Results state
  currentWeatherData: WeatherResult | null;
  setCurrentWeatherData: (weatherData: WeatherResult | null) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const CurrentWeatherContext = createContext<
  CurrentWeatherContextType | undefined
>(undefined);
