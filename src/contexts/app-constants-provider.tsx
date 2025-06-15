import { type PropsWithChildren, useEffect, useState } from 'react';
import {
  AppConstantsContext,
  type AppConstantsContextType,
} from '@/contexts/app-constants-context.ts';
import type { LabelAndValue } from '@/lib/api-client/interfaces.ts';
import countriesJson from '@/assets/countries.json';

export const AppConstantsProvider = ({ children }: PropsWithChildren) => {
  const [countries, setCountries] = useState<LabelAndValue[]>([]);

  useEffect(() => {
    setCountries(countriesJson);
  }, []);

  const countriesForComboBox = countries.map((country) => ({
    label: country.label,
    value: country.label,
  }));

  const getCountryCodeFromLabel = (label: string): string | undefined =>
    countries.find((country) => country.label === label)?.value ?? '';

  const value: AppConstantsContextType = {
    countries,
    countriesForComboBox,
    getCountryCodeFromLabel,
  };

  return (
    <AppConstantsContext.Provider value={value}>
      {children}
    </AppConstantsContext.Provider>
  );
};
