import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Check, ChevronsUpDown, Search, Trash } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command.tsx";
import { cn } from "@/lib/utils.ts";

const countries = [
  {
    value: "SG",
    label: "Singapore",
  },
  {
    value: "US",
    label: "United States of America",
  },
  {
    value: "GB",
    label: "United Kingdom of Great Britain and Northern Ireland",
  },
  {
    value: "CN",
    label: "China",
  },
  {
    value: "RU",
    label: "Russian Federation",
  },
];
const WeatherSearch = () => {
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [open, setOpen] = useState(false);

  const handleOnSubmit = async () => {
    try {
      const response = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=&appid=${import.meta.env.VITE_OPEN_WEATHER_API_KEY}&units=metric&lang=en`,
      );
      alert(JSON.stringify((await response.json())[0]["name"], null, 2));
    } catch (error) {
      console.error(error);
    }
  };

  const handleClearOnClick = () => {
    setCity("");
    setCountry("");
  };

  return (
    <div className="flex items-end gap-3">
      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="city">City</Label>
        <Input
          type="text"
          id="city"
          placeholder="eg. Singapore"
          onChange={(e) => setCity(e.target.value)}
          value={city}
        />
      </div>

      <div className="grid w-full max-w-sm items-center gap-3">
        <Label htmlFor="country">Country</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              id="country"
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-[200px] justify-between font-normal text-muted-foreground"
            >
              {country
                ? countries.find((framework) => framework.value === country)
                    ?.label
                : "Select a country..."}
              <ChevronsUpDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[200px] p-0">
            <Command>
              <CommandInput placeholder="Search framework..." className="h-9" />
              <CommandList>
                <CommandEmpty>No framework found.</CommandEmpty>
                <CommandGroup>
                  {countries.map((framework) => (
                    <CommandItem
                      key={framework.value}
                      value={framework.value}
                      onSelect={(currentValue) => {
                        setCountry(
                          currentValue === country ? "" : currentValue,
                        );
                        setOpen(false);
                      }}
                    >
                      {framework.label}
                      <Check
                        className={cn(
                          "ml-auto",
                          country === framework.value
                            ? "opacity-100"
                            : "opacity-0",
                        )}
                      />
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
      <Button onClick={handleOnSubmit} size="icon" variant="outline">
        <Search />
      </Button>
      <Button onClick={handleClearOnClick} size="icon" variant="destructive">
        <Trash />
      </Button>
    </div>
  );
};

export default WeatherSearch;
