import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useAppConstants } from './use-app-constants';
import { AppConstantsContext } from '@/contexts/app-constants-context';
import type { AppConstantsContextType } from '@/contexts/app-constants-context';

const mockContextValue: AppConstantsContextType = {
  countries: [
    { label: 'United States', value: 'US' },
    { label: 'Canada', value: 'CA' },
  ],
  countriesForComboBox: [
    { label: 'United States', value: 'United States' },
    { label: 'Canada', value: 'Canada' },
  ],
  getCountryCodeFromLabel: vi.fn((label: string) => 
    label === 'United States' ? 'US' : label === 'Canada' ? 'CA' : undefined
  ),
  getLabelFromCountryCode: vi.fn((code: string) => 
    code === 'US' ? 'United States' : code === 'CA' ? 'Canada' : ''
  ),
  getRandomWeatherCondition: vi.fn(() => ({
    icon: '01d',
    description: 'clear sky',
  })),
};

const AppConstantsProvider = ({ children }: { children: React.ReactNode }) => (
  <AppConstantsContext.Provider value={mockContextValue}>
    {children}
  </AppConstantsContext.Provider>
);

describe('useAppConstants', () => {
  it('returns context value when used within provider', () => {
    const { result } = renderHook(() => useAppConstants(), {
      wrapper: AppConstantsProvider,
    });

    expect(result.current).toBe(mockContextValue);
    expect(result.current.countries).toEqual([
      { label: 'United States', value: 'US' },
      { label: 'Canada', value: 'CA' },
    ]);
  });

  it('throws error when used outside provider', () => {
    expect(() => {
      renderHook(() => useAppConstants());
    }).toThrow('useAppConstantsContext must be used within a AppConstantsProvider');
  });

  it('provides access to all context methods', () => {
    const { result } = renderHook(() => useAppConstants(), {
      wrapper: AppConstantsProvider,
    });

    expect(typeof result.current.getCountryCodeFromLabel).toBe('function');
    expect(typeof result.current.getLabelFromCountryCode).toBe('function');
    expect(typeof result.current.getRandomWeatherCondition).toBe('function');
  });

  it('provides access to countries data', () => {
    const { result } = renderHook(() => useAppConstants(), {
      wrapper: AppConstantsProvider,
    });

    expect(Array.isArray(result.current.countries)).toBe(true);
    expect(Array.isArray(result.current.countriesForComboBox)).toBe(true);
  });

  it('context methods work correctly', () => {
    const { result } = renderHook(() => useAppConstants(), {
      wrapper: AppConstantsProvider,
    });

    // Test getCountryCodeFromLabel
    expect(result.current.getCountryCodeFromLabel('United States')).toBe('US');
    expect(result.current.getCountryCodeFromLabel('Unknown')).toBeUndefined();

    // Test getLabelFromCountryCode
    expect(result.current.getLabelFromCountryCode('US')).toBe('United States');
    expect(result.current.getLabelFromCountryCode('XX')).toBe('');

    // Test getRandomWeatherCondition
    const condition = result.current.getRandomWeatherCondition();
    expect(condition).toEqual({
      icon: '01d',
      description: 'clear sky',
    });
  });
});