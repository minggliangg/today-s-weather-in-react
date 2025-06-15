import { createContext } from 'react';

export interface AppConstantsContextType {
  countriesForComboBox: { value: string; label: string }[];
  countries: { value: string; label: string }[];
  getCountryCodeFromLabel: (label: string) => string | undefined;
  getLabelFromCountryCode: (code: string) => string;
  getRandomWeatherCondition: () => { icon: string; description: string };
}

export const AppConstantsContext = createContext<
  AppConstantsContextType | undefined
>(undefined);
