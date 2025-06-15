import { createContext } from 'react';

export interface AppConstantsContextType {
  countriesForComboBox: { value: string; label: string }[];
  countries: { value: string; label: string }[];
  getCountryCodeFromLabel: (label: string) => string | undefined;
}

export const AppConstantsContext = createContext<
  AppConstantsContextType | undefined
>(undefined);
