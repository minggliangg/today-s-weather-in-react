import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Search, Trash } from 'lucide-react';
import { useWeatherSearch } from '@/features/search/hooks/use-weather-search.ts';
import { CountrySelector } from '@/features/search/components/country-selector.tsx';

const WeatherSearch = () => {
  const {
    city,
    setCity,
    country,
    setCountry,
    open,
    setOpen,
    error,
    isLoading,
    handleSearch,
    handleClear,
  } = useWeatherSearch();

  const errorMessage = error?.message;

  return (
    <div className='flex flex-wrap items-end gap-3'>
      <div className='grid w-full md:w-auto md:max-w-sm items-center gap-1'>
        <Label htmlFor='city'>City*</Label>
        <Input
          required
          type='text'
          id='city'
          placeholder='eg. Singapore'
          onChange={(e) => setCity(e.target.value)}
          value={city}
          className={errorMessage ? 'border border-red-600' : ''}
        />
        <p className='text-red-600 text-sm'>{errorMessage ?? <br></br>}</p>
      </div>
      <div className='grid w-full md:w-auto md:max-w-sm items-center gap-1'>
        <Label htmlFor='country'>Country</Label>
        <CountrySelector
          open={open}
          setOpen={setOpen}
          selectedCountry={country}
          setSelectedCountry={setCountry}
          id='country'
        />
        <p className='text-sm'>
          <br />
        </p>
      </div>
      <div className='grid w-full md:w-auto md:max-w-sm items-center gap-1'>
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
        <p className='text-sm'>
          <br />
        </p>
      </div>
    </div>
  );
};

export default WeatherSearch;
