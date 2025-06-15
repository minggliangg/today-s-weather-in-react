import { useContext } from 'react';
import { CurrentWeatherContext } from '@/contexts/current-weather-context.ts';

export const useCurrentWeatherContext = () => {
  const context = useContext(CurrentWeatherContext);
  if (context === undefined) {
    throw new Error(
      'useCurrentWeatherContext must be used within a CurrentWeatherProvider',
    );
  }
  return context;
};
