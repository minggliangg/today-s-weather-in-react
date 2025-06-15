const API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY;
const ENVIRONMENT = import.meta.env.MODE;
const BASE_URL =
  ENVIRONMENT === 'development'
    ? '/api/'
    : import.meta.env.VITE_OPEN_WEATHER_API_BASE_URL;

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

    return await response.json();
  },
};
