import './App.css';
import WeatherSearch from '@/features/search/weather-search.tsx';
import { CurrentDisplay } from '@/features/current-weather-display/current-display.tsx';

const App = () => {
  return (
    <div className={'flex flex-col items-center justify-center gap-4'}>
      <h1 className='text-3xl font-bold mb-8'>Today's Weather</h1>
      <WeatherSearch />
      <CurrentDisplay />
    </div>
  );
};

export default App;
