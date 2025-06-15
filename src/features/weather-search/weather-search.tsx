import { Label } from '@/components/ui/label.tsx';
import { Input } from '@/components/ui/input.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Delete, Search } from 'lucide-react';
import { useWeatherSearch } from '@/features/weather-search/hooks/use-weather-search.ts';
import { CountrySelector } from '@/features/weather-search/components/country-selector.tsx';
import { useCurrentWeatherContext } from '@/hooks/use-current-weather-context.ts';
import { useEffect } from 'react';
import { useAppConstantsContext } from '@/hooks/use-app-constants-context.ts';

const WeatherSearch = () => {
  const { getLabelFromCountryCode } = useAppConstantsContext();
  const { currentWeatherData } = useCurrentWeatherContext();
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

  useEffect(() => {
    if (currentWeatherData) {
      setCity(currentWeatherData.city);
      setCountry(getLabelFromCountryCode(currentWeatherData.country));
    }
  }, [currentWeatherData, getLabelFromCountryCode, setCity, setCountry]);

  const errorMessage = error?.message;

  return (
    <div className='flex flex-wrap items-end gap-3'>
      <div className='grid w-full md:w-auto md:max-w-sm items-center gap-1'>
        <Label htmlFor='city'>City *</Label>
        <Input
          required
          type='text'
          id='city'
          placeholder='eg. Singapore'
          onChange={(e) => {
            setCountry('');
            setCity(e.target.value);
          }}
          value={city}
          className={
            errorMessage
              ? 'border border-destructive focus:border-destructive focus-visible:ring-destructive/20 focus-visible:ring-[3px] dark:focus-visible:ring-destructive/40'
              : ''
          }
          onKeyDown={async (e) => {
            if (e.key === 'Enter' && city) {
              await handleSearch();
            }
          }}
        />
        <p className='text-destructive text-sm'>{errorMessage ?? <br></br>}</p>
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
        <div className='flex w-full md:w-auto gap-3 mt-3 md:mt-0 justify-end'>
          <Button
            onClick={handleSearch}
            size='icon'
            variant='outline'
            disabled={isLoading || !city}
            title='Search'
          >
            <Search />
          </Button>
          <Button
            onClick={handleClear}
            size='icon'
            variant='destructive'
            disabled={isLoading || (!country && !city)}
            title='Clear search'
          >
            <Delete />
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
