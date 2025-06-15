import './App.css';
import WeatherSearch from '@/features/search/weather-search.tsx';
import { CurrentDisplay } from '@/features/current-weather-display/current-display.tsx';

const App = () => {
  return (
    <div className={'flex flex-col items-center justify-center gap-4'}>
      <WeatherSearch />
      <CurrentDisplay />
    </div>
  );
};

export default App;
