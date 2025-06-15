import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import './index.css';
import App from './App.tsx';

import { CurrentWeatherProvider } from '@/contexts/current-weather-provider.tsx';
import { AppConstantsProvider } from '@/contexts/app-constants-provider.tsx';
import { Toaster } from '@/components/ui/sonner.tsx';
import { SearchHistoryProvider } from '@/contexts/search-history-provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster />
    <AppConstantsProvider>
      <SearchHistoryProvider>
        <CurrentWeatherProvider>
          <App />
        </CurrentWeatherProvider>
      </SearchHistoryProvider>
    </AppConstantsProvider>
  </StrictMode>,
);
