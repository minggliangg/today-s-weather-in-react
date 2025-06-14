import "./App.css";
import WeatherSearch from "@/features/weather-search/weather-search.tsx";

const App = () => {
  return (
    <>
      <h1>Today's Weather</h1>
      <WeatherSearch />
    </>
  );
};

export default App;
