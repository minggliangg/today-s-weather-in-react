import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover.tsx';
import { Button } from '@/components/ui/button.tsx';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command.tsx';
import { cn } from '@/lib/utils.ts';
import { useMediaQuery } from '@/hooks/use-media-query.ts';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer.tsx';
import { useAppConstants } from '@/hooks/use-app-constants.ts';

interface CountrySelectorProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;

  id: string;
}

interface CountrySelectorContentProps {
  countries: {
    value: string;
    label: string;
  }[];
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  setOpen: (open: boolean) => void;
  open: boolean;
}

const CountrySelectorContent = ({
  countries,
  selectedCountry,
  setSelectedCountry,
  setOpen,
}: CountrySelectorContentProps) => {
  return (
    <Command>
      <CommandInput placeholder='Search country...' className='h-9' />
      <CommandList>
        <CommandEmpty>No country found.</CommandEmpty>
        <CommandGroup>
          {countries.map((country) => (
            <CommandItem
              key={country.value}
              value={country.value}
              onSelect={(currentValue) => {
                setSelectedCountry(
                  currentValue === selectedCountry ? '' : currentValue,
                );
                setOpen(false);
              }}
            >
              {country.label}
              <Check
                className={cn(
                  'ml-auto',
                  selectedCountry === country.value
                    ? 'opacity-100'
                    : 'opacity-0',
                )}
              />
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export const CountrySelector = ({
  open,
  setOpen,
  selectedCountry,
  setSelectedCountry,
  id,
}: CountrySelectorProps) => {
  const { countriesForComboBox } = useAppConstants();
  const isDesktop = useMediaQuery('(min-width: 768px)');
  if (isDesktop) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className={`w-full md:w-[200px] justify-between font-normal ${selectedCountry ? 'text-foreground' : 'text-muted-foreground'} bg-transparent focus-visible:ring-foreground/50 focus-visible:ring-[2px] dark:focus-visible:ring-foreground/40 hover:bg-transparent`}
          >
            <span className='truncate'>
              {selectedCountry
                ? countriesForComboBox.find(
                    (country) => country.value === selectedCountry,
                  )?.label
                : 'Select a country...'}
            </span>
            <ChevronsUpDown className='opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-[200px] p-0'>
          <CountrySelectorContent
            countries={countriesForComboBox}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            setOpen={setOpen}
            open={open}
          />
        </PopoverContent>
      </Popover>
    );
  }
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          id={id}
          variant='outline'
          role='combobox'
          aria-expanded={open}
          className={`w-full md:w-[200px] justify-between font-normal ${selectedCountry ? 'text-foreground' : 'text-muted-foreground'} bg-transparent focus-visible:ring-foreground/50 focus-visible:ring-[2px] dark:focus-visible:ring-foreground/40 hover:bg-transparent`}
        >
          {selectedCountry
            ? countriesForComboBox.find(
                (country) => country.value === selectedCountry,
              )?.label
            : 'Select a country...'}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className='sr-only'>
          <DrawerTitle>Select a Country</DrawerTitle>
          <DrawerDescription>Select a country from the list</DrawerDescription>
        </DrawerHeader>
        <div className='mt-4 border-t'>
          <CountrySelectorContent
            countries={countriesForComboBox}
            selectedCountry={selectedCountry}
            setSelectedCountry={setSelectedCountry}
            setOpen={setOpen}
            open={open}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
};
