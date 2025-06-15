import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getWeatherInfo, getCoordinatesByLocationName } from './api';
import { ApiClient } from './api-client';
import { InvalidLocationError } from '@/common/custom-errors';

vi.mock('./api-client', () => ({
  ApiClient: {
    get: vi.fn(),
  },
}));

describe('API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getWeatherInfo', () => {
    it('should return transformed weather data', async () => {
      const mockApiResponse = {
        weather: [{
          main: 'Clear',
          description: 'clear sky',
          icon: '01d'
        }],
        main: {
          temp: 25.5,
          feels_like: 26.2,
          temp_min: 24.1,
          temp_max: 27.3,
          pressure: 1013,
          humidity: 65
        },
        sys: {
          country: 'US'
        },
        dt: 1640995200,
        name: 'New York'
      };

      vi.mocked(ApiClient.get).mockResolvedValueOnce(mockApiResponse);

      const result = await getWeatherInfo({ lon: -74.006, lat: 40.7128 });

      expect(result).toEqual({
        temp: 25.5,
        feels_like: 26.2,
        temp_min: 24.1,
        temp_max: 27.3,
        pressure: 1013,
        humidity: 65,
        country: 'US',
        city: 'New York',
        description: 'clear sky',
        weather_icon: '01d',
        timestamp: 1640995200
      });

      expect(ApiClient.get).toHaveBeenCalledWith(
        'data/2.5/weather',
        new Map([
          ['lat', '40.7128'],
          ['lon', '-74.006']
        ])
      );
    });

    it('should handle negative coordinates', async () => {
      const mockApiResponse = {
        weather: [{ main: 'Rain', description: 'light rain', icon: '10d' }],
        main: { temp: 15, feels_like: 14, temp_min: 12, temp_max: 18, pressure: 1005, humidity: 80 },
        sys: { country: 'GB' },
        dt: 1640995200,
        name: 'London'
      };

      vi.mocked(ApiClient.get).mockResolvedValueOnce(mockApiResponse);

      await getWeatherInfo({ lon: -0.1276, lat: 51.5074 });

      expect(ApiClient.get).toHaveBeenCalledWith(
        'data/2.5/weather',
        new Map([
          ['lat', '51.5074'],
          ['lon', '-0.1276']
        ])
      );
    });
  });

  describe('getCoordinatesByLocationName', () => {
    it('should return coordinates for valid city', async () => {
      const mockApiResponse = [{
        name: 'London',
        lat: 51.5074,
        lon: -0.1276,
        country: 'GB'
      }];

      vi.mocked(ApiClient.get).mockResolvedValueOnce(mockApiResponse);

      const result = await getCoordinatesByLocationName({ city: 'London' });

      expect(result).toEqual({
        lat: 51.5074,
        lon: -0.1276,
        name: 'London',
        country: 'GB'
      });

      expect(ApiClient.get).toHaveBeenCalledWith(
        'geo/1.0/direct',
        new Map([
          ['q', 'London,,'],
          ['limit', '1']
        ])
      );
    });

    it('should return coordinates for city with country code', async () => {
      const mockApiResponse = [{
        name: 'Paris',
        lat: 48.8566,
        lon: 2.3522,
        country: 'FR'
      }];

      vi.mocked(ApiClient.get).mockResolvedValueOnce(mockApiResponse);

      const result = await getCoordinatesByLocationName({ 
        city: 'Paris', 
        countryCode: 'FR' 
      });

      expect(result).toEqual({
        lat: 48.8566,
        lon: 2.3522,
        name: 'Paris',
        country: 'FR'
      });

      expect(ApiClient.get).toHaveBeenCalledWith(
        'geo/1.0/direct',
        new Map([
          ['q', 'Paris,,FR'],
          ['limit', '1']
        ])
      );
    });

    it('should throw InvalidLocationError when no results found', async () => {
      vi.mocked(ApiClient.get).mockResolvedValue([]);

      await expect(
        getCoordinatesByLocationName({ city: 'NonexistentCity' })
      ).rejects.toThrow(InvalidLocationError);
      
      await expect(
        getCoordinatesByLocationName({ city: 'NonexistentCity' })
      ).rejects.toThrow('Invalid location entered');
    });

    it('should handle undefined country code', async () => {
      const mockApiResponse = [{
        name: 'Tokyo',
        lat: 35.6762,
        lon: 139.6503,
        country: 'JP'
      }];

      vi.mocked(ApiClient.get).mockResolvedValueOnce(mockApiResponse);

      await getCoordinatesByLocationName({ 
        city: 'Tokyo', 
        countryCode: undefined 
      });

      expect(ApiClient.get).toHaveBeenCalledWith(
        'geo/1.0/direct',
        new Map([
          ['q', 'Tokyo,,'],
          ['limit', '1']
        ])
      );
    });
  });
});