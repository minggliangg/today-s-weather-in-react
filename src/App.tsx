import './App.css';
import WeatherSearch from '@/features/search/weather-search.tsx';
import CurrentWeatherDisplay from '@/features/current-weather-display/current-display.tsx';

const App = () => {
  return (
    <>
      <WeatherSearch />
      <CurrentWeatherDisplay />
    </>
  );
};

export default App;
