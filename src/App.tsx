import './App.css';
import WeatherSearch from '@/features/weather-search/weather-search.tsx';
import { CurrentDisplay } from '@/features/current-weather-display/current-display.tsx';
import { SearchHistory } from '@/features/search-history/search-history.tsx';

const App = () => {
  return (
    <div className={'flex flex-col items-center justify-center gap-4'}>
      <h1 className='text-3xl font-bold mb-8'>Today's Weather</h1>
      <WeatherSearch />
      <CurrentDisplay />
      <SearchHistory />
    </div>
  );
};

export default App;
