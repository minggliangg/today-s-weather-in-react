import { NetworkError } from '@/common/custom-errors.ts';

const API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY;
const ENVIRONMENT = import.meta.env.MODE;
const BASE_URL =
  ENVIRONMENT === 'development'
    ? '/api/'
    : import.meta.env.VITE_OPEN_WEATHER_API_BASE_URL;

// Validate required environment variables
if (!API_KEY) {
  throw new Error('VITE_OPEN_WEATHER_API_KEY environment variable is required');
}

if (ENVIRONMENT !== 'development' && !BASE_URL) {
  throw new Error('VITE_OPEN_WEATHER_API_BASE_URL environment variable is required for production');
}

export const ApiClient = {
  async get<T>(path: string, params: Map<string, string>): Promise<T> {
    let myUrlWithParams: string | URL;

    if (ENVIRONMENT === 'development') {
      let stringUrl = `${BASE_URL}${path}?appid=${API_KEY}&units=metric&lang=en`;
      params.forEach((value, key) => {
        stringUrl += `&${key}=${encodeURIComponent(value)}`;
      });
      myUrlWithParams = stringUrl;
    } else {
      const url = new URL(
        `${BASE_URL}${path}?appid=${API_KEY}&units=metric&lang=en`,
      );
      params.forEach((value, key) => {
        url.searchParams.append(key, value);
      });
      myUrlWithParams = url;
    }

    const response = await fetch(myUrlWithParams, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new NetworkError(response.statusText, response.status);
    } else {
      return await response.json();
    }
  },
};
