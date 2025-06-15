import type {
  CoordinatesResponse,
  CoordinatesResult,
  WeatherResponse,
  WeatherResult,
} from '@/lib/api-client/interfaces.ts';
import { ApiClient } from '@/lib/api-client/api-client.ts';

export const getWeatherInfo = async ({
  lon,
  lat,
}: {
  lon: number;
  lat: number;
}): Promise<WeatherResult> => {
  const {
    weather: { main, description, icon },
    main: { temp, feels_like, temp_min, temp_max, pressure, humidity },
    sys: { country },
    dt,
    name,
  } = await ApiClient.get<WeatherResponse>(
    'data/2.5/weather',
    new Map([
      ['lat', lat.toString()],
      ['lon', lon.toString()],
    ]),
  );

  return {
    temp: temp,
    feels_like: feels_like,
    temp_min: temp_min,
    temp_max: temp_max,
    pressure: pressure,
    humidity: humidity,
    country: country,
    city: name,
    weather_group: main,
    description: description,
    weather_icon: icon,
    timestamp: dt,
  };
};

export const getCoordinatesByLocationName = async ({
  city,
  country,
}: {
  city: string;
  country?: string;
}): Promise<CoordinatesResult> => {
  const response = await ApiClient.get<Array<CoordinatesResponse>>(
    'geo/1.0/direct',
    new Map([
      ['q', `${city},,${country}`],
      ['limit', '1'],
    ]),
  );

  return {
    lat: response[0].lat,
    lon: response[0].lon,
    name: response[0].name,
    country: response[0].country,
  };
};
