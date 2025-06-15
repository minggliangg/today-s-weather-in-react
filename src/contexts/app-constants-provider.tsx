import { type PropsWithChildren, useEffect, useState } from 'react';
import {
  AppConstantsContext,
  type AppConstantsContextType,
} from '@/contexts/app-constants-context.ts';
import type {
  LabelAndValue,
  RandomCondition,
} from '@/lib/api-client/interfaces.ts';
import countriesJson from '@/assets/countries.json';
import randomConditionsJson from '@/assets/conditions.json';

export const AppConstantsProvider = ({ children }: PropsWithChildren) => {
  const [countries, setCountries] = useState<LabelAndValue[]>([]);
  const [randomConditions, setRandomConditions] = useState<RandomCondition[]>(
    [],
  );

  useEffect(() => {
    setCountries(countriesJson);
    setRandomConditions(randomConditionsJson);
  }, []);

  const countriesForComboBox = countries.map((country) => ({
    label: country.label,
    value: country.label,
  }));

  const getCountryCodeFromLabel = (label: string): string | undefined =>
    countries.find((country) => country.label === label)?.value;

  const getLabelFromCountryCode = (code: string): string =>
    countries.find((country) => country.value === code)?.label ?? '';

  const getRandomWeatherCondition = (): RandomCondition => {
    if (randomConditions.length === 0) {
      return {
        icon: '',
        description: '',
      };
    }
    return randomConditions[
      Math.floor(Math.random() * randomConditions.length)
    ];
  };

  const value: AppConstantsContextType = {
    countries,
    countriesForComboBox,
    getCountryCodeFromLabel,
    getLabelFromCountryCode,
    getRandomWeatherCondition,
  };

  return (
    <AppConstantsContext.Provider value={value}>
      {children}
    </AppConstantsContext.Provider>
  );
};
