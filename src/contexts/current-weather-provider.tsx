import type { WeatherResult } from '@/lib/api-client/interfaces.ts';
import { type PropsWithChildren, useState } from 'react';
import {
  CurrentWeatherContext,
  type CurrentWeatherContextType,
} from './current-weather-context';

export const CurrentWeatherProvider = ({ children }: PropsWithChildren) => {
  // Results state
  const [weatherData, setWeatherData] = useState<WeatherResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setCurrentWeatherData = (weatherData: WeatherResult | null) => {
    setWeatherData(weatherData);
    setIsLoading(false);
  };

  // Create the context value
  const value: CurrentWeatherContextType = {
    currentWeatherData: weatherData,
    setCurrentWeatherData,
    isLoading,
    setIsLoading,
  };

  return (
    <CurrentWeatherContext.Provider value={value}>
      {children}
    </CurrentWeatherContext.Provider>
  );
};
