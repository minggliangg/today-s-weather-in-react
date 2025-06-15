import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Search, Trash } from 'lucide-react';
import { useWeatherSearch } from '@/features/search/hooks/use-weather-search.ts';
import { CountrySelector } from '@/features/search/components/country-selector.tsx';

const countries = [
  {
    value: 'SG',
    label: 'Singapore',
  },
  {
    value: 'US',
    label: 'United States of America',
  },
  {
    value: 'GB',
    label: 'United Kingdom of Great Britain and Northern Ireland',
  },
  {
    value: 'CN',
    label: 'China',
  },
  {
    value: 'RU',
    label: 'Russian Federation',
  },
];
const WeatherSearch = () => {
  const {
    city,
    setCity,
    country,
    setCountry,
    open,
    setOpen,
    isLoading,
    handleSearch,
    handleClear,
  } = useWeatherSearch();

  return (
    <div className='flex flex-wrap items-end gap-3'>
      <div className='grid w-full md:w-auto md:max-w-sm items-center gap-3'>
        <Label htmlFor='city'>City</Label>
        <Input
          type='text'
          id='city'
          placeholder='eg. Singapore'
          onChange={(e) => setCity(e.target.value)}
          value={city}
        />
      </div>

      <div className='grid w-full md:w-auto md:max-w-sm items-center gap-3'>
        <Label htmlFor='country'>Country</Label>
        <CountrySelector
          open={open}
          setOpen={setOpen}
          selectedCountry={country}
          setSelectedCountry={setCountry}
          countries={countries}
          id='country'
        />
      </div>
      <div className='flex w-full md:w-auto gap-3 mt-3 md:mt-0'>
        <Button
          onClick={handleSearch}
          size='icon'
          variant='outline'
          disabled={isLoading || !city}
        >
          <Search />
        </Button>
        <Button
          onClick={handleClear}
          size='icon'
          variant='destructive'
          disabled={isLoading || !city || !country}
        >
          <Trash />
        </Button>
      </div>
    </div>
  );
};

export default WeatherSearch;
