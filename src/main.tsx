import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { CurrentWeatherProvider } from '@/contexts/current-weather-provider.tsx';
import { AppConstantsProvider } from '@/contexts/app-constants-provider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppConstantsProvider>
      <CurrentWeatherProvider>
        <App />
      </CurrentWeatherProvider>
    </AppConstantsProvider>
  </StrictMode>,
);
