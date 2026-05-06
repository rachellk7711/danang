const API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;
const DANANG_LAT = 16.0544;
const DANANG_LON = 108.2022;

export type WeatherData = {
  temp: number;
  tempMax: number;
  sunrise: number;
  sunset: number;
};

export const fetchWeather = async (): Promise<WeatherData> => {
  try {
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${DANANG_LAT}&lon=${DANANG_LON}&appid=${API_KEY}&units=metric`
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Weather API Error: ${errorData.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    return {
      temp: Math.round(data.main.temp),
      tempMax: Math.round(data.main.temp_max),
      sunrise: data.sys.sunrise,
      sunset: data.sys.sunset,
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    // Return mock data as fallback if API fails (e.g. 401)
    return {
      temp: 32,
      tempMax: 34,
      sunrise: 1715030400, // Mock sunrise
      sunset: 1715077200,  // Mock sunset
    };
  }
};
