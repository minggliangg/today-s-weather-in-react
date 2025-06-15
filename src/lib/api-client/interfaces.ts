export interface CoordinatesResponse {
  name: string;
  lat: number;
  lon: number;
  country: 'string';
}

export interface CoordinatesResult {
  lat: number;
  lon: number;
  name: string;
  country: string;
}

export interface WeatherResponse {
  weather: {
    main: string;
    description: string;
    icon: string;
  }[];
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
  };
  sys: {
    country: string;
  };
  dt: number;
  name: string;
}

export interface WeatherResult {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  pressure: number;
  humidity: number;
  country: string;
  city: string;
  description: string;
  weather_icon: string;
  timestamp: number;
}

export interface LabelAndValue {
  label: string;
  value: string;
}

export interface RandomCondition {
  icon: string;
  description: string;
}
