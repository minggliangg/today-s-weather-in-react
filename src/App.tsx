import './App.css';
import WeatherSearch from '@/features/weather-search/weather-search.tsx';
import { CurrentDisplay } from '@/features/current-weather-display/current-display.tsx';
import { SearchHistory } from '@/features/search-history/search-history.tsx';
import { ThemeToggle } from '@/components/theme-toggle';

const App = () => {
  return (
    <div className={'flex flex-col items-center justify-center gap-4'}>
      <span className='flex flex-row items-center gap-2 mb-8'>
        <h1 className='text-3xl font-bold'>Today's Weather</h1>
        <ThemeToggle />
      </span>
      <WeatherSearch />
      <CurrentDisplay />
      <SearchHistory />
    </div>
  );
};

export default App;
