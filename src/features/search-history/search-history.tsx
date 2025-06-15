import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Bomb, Search, Trash } from 'lucide-react';
import { useSearchHistory } from '@/hooks/use-search-history.ts';
import { epochToDateLocaleString } from '@/lib/utils.ts';
import { useCurrentWeather } from '@/hooks/use-current-weather.ts';
import { DEGREE_CELSIUS } from '@/common/constants.ts';

export const SearchHistory = () => {
  const {
    searchHistory,
    clearSearchHistory,
    removeWeatherResult,
    searchAgain,
  } = useSearchHistory();
  const { isLoading } = useCurrentWeather();

  return (
    <Card className={'w-full'}>
      <CardHeader>
        <CardTitle>Search History</CardTitle>
        <CardDescription>Showing your last 20 searches</CardDescription>
        <CardAction>
          <Button
            onClick={clearSearchHistory}
            size='icon'
            variant='destructive'
            title='Clear all'
            disabled={searchHistory.length === 0}
          >
            <Bomb />
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        {searchHistory.length === 0 ? (
          <p className='text-muted-foreground text-center  py-4'>
            No search history yet
          </p>
        ) : (
          <ul className='space-y-2'>
            {searchHistory.map((entry, index) => (
              <li
                key={index}
                className='flex items-center justify-between p-2 hover:bg-muted rounded-md'
              >
                <span className='text-xs text-muted-foreground'>
                  #{index + 1} {entry.city}, {entry.country} -{' '}
                  {entry.temp.toFixed()}
                  {DEGREE_CELSIUS}
                </span>
                <span className='flex gap-2 items-center'>
                  <span className='text-xs'>
                    {epochToDateLocaleString(entry.timestamp)}
                  </span>
                  <Button
                    onClick={() => searchAgain(entry)}
                    title={`Search for entry ${index + 1} again`}
                    size='icon'
                    disabled={isLoading}
                  >
                    <Search />
                  </Button>
                  <Button
                    onClick={() => removeWeatherResult(entry)}
                    size='icon'
                    variant='destructive'
                    title={`Clear entry ${index + 1}`}
                  >
                    <Trash />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
