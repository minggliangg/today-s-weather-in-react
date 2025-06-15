# Today's Weather

A modern, responsive web application that allows users to check the current weather conditions for any location around the world. Built with React, TypeScript, and Vite.

![Today's Weather App](https://openweathermap.org/img/wn/02d@4x.png)

## Features

- **Weather Search**: Search for weather information by city and country
- **Current Weather Display**: View detailed current weather information including temperature, feels like temperature, humidity, and pressure
- **Search History**: Keep track of your recent searches (up to 20) and easily search for them again
- **Dark/Light Mode**: Toggle between dark and light themes for comfortable viewing in any environment
- **Responsive Design**: Works seamlessly on both desktop and mobile devices

## Technologies Used

- **React 19**: For building the user interface
- **TypeScript**: For type safety and better developer experience
- **Vite**: For fast development and optimized production builds
- **Tailwind CSS**: For styling and responsive design
- **Context API**: For state management
- **OpenWeatherMap API**: For weather data
- **Local Storage**: For persisting search history

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/todays_weather.git
   cd todays_weather
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn
   ```

3. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To preview the production build:

```bash
npm run preview
# or
yarn preview
```

## Project Structure

- `src/components`: Reusable UI components
- `src/features`: Feature-specific components
  - `current-weather-display`: Components for displaying current weather
  - `search-history`: Components for managing and displaying search history
  - `weather-search`: Components for searching weather by location
- `src/contexts`: React contexts for state management
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and API clients
- `src/common`: Common constants and error types

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [OpenWeatherMap](https://openweathermap.org/) for providing the weather data API
- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Lucide React](https://lucide.dev/) for the beautiful icons
