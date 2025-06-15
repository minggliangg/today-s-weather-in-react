import { useCurrentWeather } from '@/hooks/use-current-weather.ts';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { epochToDateLocaleString, toTitleCase } from '@/lib/utils.ts';
import { useAppConstants } from '@/hooks/use-app-constants.ts';
import { DEGREE_CELSIUS } from '@/common/constants.ts';

export const CurrentDisplay = () => {
  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Today's weather</CardTitle>
      </CardHeader>
      <CurrentDisplayContent />
    </Card>
  );
};

const CurrentDisplayContent = () => {
  const { getRandomWeatherCondition } = useAppConstants();
  const { currentWeatherData, isLoading } = useCurrentWeather();

  const { icon, description: randomDescription } = getRandomWeatherCondition();

  if (!currentWeatherData || (isLoading && !currentWeatherData))
    return (
      <CardContent className='h-[296px]'>
        <div className='flex flex-row items-center gap-2 mb-4'>
          <div className='flex-grow flex-col gap-1 items-center'>
            <p className='text-3xl'>Welcome!</p>
            <p className='italic text-sm text-gray-500 '>
              Search for a location <br /> to see the weather.
            </p>
          </div>
          <div className='flex flex-col gap-1 items-center'>
            <img
              src={`https://openweathermap.org/img/wn/${icon}@4x.png`}
              alt={randomDescription}
            />
            <p className='text-gray-400 text-center'>
              Somewhere there are {randomDescription}
            </p>
          </div>
        </div>
        <p className='text-gray-500 text-center'>
          <br />
        </p>
        <p className='text-gray-400 text-end text-sm mt-2'>
          Powered by OpenWeatherMap
        </p>
      </CardContent>
    );

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
    weather_icon,
    description,
  } = currentWeatherData;

  return (
    <CardContent>
      <div className='flex flex-row items-center gap-2 mb-4'>
        <div className='flex-grow flex-col gap-1 items-center'>
          <p className='text-3xl'>
            {temp.toFixed()}
            {DEGREE_CELSIUS}
          </p>
          <p className='italic text-sm text-gray-500'>
            Feels like: {feels_like.toFixed()}
            {DEGREE_CELSIUS}
          </p>
          <p>
            {city}, {country}
          </p>
        </div>
        <div className='flex flex-col gap-1 items-center'>
          <img
            src={`https://openweathermap.org/img/wn/${weather_icon}@4x.png`}
            alt={description}
          />
          <p className='text-gray-400'>{toTitleCase(description)}</p>
        </div>
      </div>
      <p className='text-gray-500 text-center'>
        High: {temp_max.toFixed()}
        {DEGREE_CELSIUS} | Low: {temp_min.toFixed()}
        {DEGREE_CELSIUS} | {humidity}% | {pressure} hPa
      </p>
      <p className='text-gray-400 text-end text-sm mt-2'>
        Last updated: {epochToDateLocaleString(timestamp)}
      </p>
    </CardContent>
  );
};
