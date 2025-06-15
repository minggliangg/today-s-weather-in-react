import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Search, Trash } from 'lucide-react';
import { useSearchHistoryContext } from '@/hooks/use-search-history-context.ts';
import { useWeatherSearch } from '@/features/weather-search/hooks/use-weather-search.ts';
import { epochToDateLocaleString } from '@/lib/utils.ts';

export const SearchHistory = () => {
  const { searchHistory, clearSearchHistory, removeWeatherResult } =
    useSearchHistoryContext();
  const { setCity, setCountry, isLoading, handleSearch } = useWeatherSearch();

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
            <Trash />
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
                  #{index + 1} {entry.city}
                </span>
                <span className='flex gap-2 items-center'>
                  <span className='text-xs'>
                    {epochToDateLocaleString(entry.timestamp)}
                  </span>
                  <Button
                    onClick={async () => {
                      setCity(entry.city);
                      setCountry(entry.country);
                      await handleSearch();
                    }}
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
