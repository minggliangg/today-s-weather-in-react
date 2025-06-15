import './App.css';
import WeatherSearch from '@/features/search/weather-search.tsx';
import { useCurrentWeatherContext } from '@/hooks/use-current-weather-context.ts';

const App = () => {
  const { currentWeatherData } = useCurrentWeatherContext();
  return (
    <>
      <h1>Today's Weather</h1>
      <p>{JSON.stringify(currentWeatherData)}</p>
      <WeatherSearch />
    </>
  );
};

export default App;
