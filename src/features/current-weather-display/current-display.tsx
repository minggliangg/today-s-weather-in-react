import { useCurrentWeatherContext } from '@/hooks/use-current-weather-context.ts';

const CurrentDisplay = () => {
  const { currentWeatherData } = useCurrentWeatherContext();

  if (!currentWeatherData) return <div>Loading...</div>;

  const {
    country,
    city,
    feels_like,
    humidity,
    temp,
    temp_max,
    temp_min,
    pressure,
    timestamp,
    weather_group,
    weather_icon,
    description,
  } = currentWeatherData;

  return (
    <div>
      <p>
        The current temperature is: {temp} in {city}, {country}
      </p>
      <img
        src={`https://openweathermap.org/img/wn/${weather_icon}@2x.png`}
        alt={description}
      />
      <p>Feels like: {feels_like}</p>
      <p>{description}</p>
    </div>
  );
};

export default CurrentDisplay;
