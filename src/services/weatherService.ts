const DANANG_LAT = 16.0544;
const DANANG_LON = 108.2022;

export type WeatherData = {
  temp: number;
  tempMax: number;
  sunrise: number; // unix timestamp
  sunset: number;  // unix timestamp
  locationName: string;
};

export const fetchWeather = async (lat: number = DANANG_LAT, lon: number = DANANG_LON): Promise<WeatherData> => {
  try {
    // 1. Fetch weather data from Open-Meteo
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&daily=temperature_2m_max,sunrise,sunset&timezone=auto`;
    const weatherResponse = await fetch(weatherUrl);
    
    if (!weatherResponse.ok) {
      throw new Error(`Weather API Error: ${weatherResponse.statusText}`);
    }
    
    const weatherData = await weatherResponse.json();
    
    // 2. Fetch location name (Reverse Geocoding)
    let locationName = "알 수 없는 위치";
    try {
      // Use Nominatim (OpenStreetMap) for reverse geocoding
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`;
      const geoResponse = await fetch(geoUrl, {
        headers: {
          'Accept-Language': 'ko-KR' // Request Korean name
        }
      });
      if (geoResponse.ok) {
        const geoData = await geoResponse.json();
        const addr = geoData.address;
        
        // Get the best representative name
        let name = addr.city || addr.town || addr.village || addr.city_district || addr.suburb || addr.county || addr.province || "";
        
        // Match specific mock locations for better UX
        const isNear = (l1: number, n1: number, l2: number, n2: number) => Math.abs(l1 - l2) < 0.01 && Math.abs(n1 - n2) < 0.01;
        
        if (isNear(lat, lon, 16.0683, 108.2234)) locationName = "다낭"; // 한시장
        else if (isNear(lat, lon, 16.0471, 108.2479)) locationName = "다낭"; // 미케비치
        else if (isNear(lat, lon, 15.9973, 107.9881)) locationName = "다낭"; // 바나힐 (목록엔 없으나 예외처리 유지)
        else if (isNear(lat, lon, 15.8801, 108.3380)) locationName = "호이안"; // 올드타운
        else if (isNear(lat, lon, 15.9060, 108.3710)) locationName = "호이안"; // 안방비치
        else if (name.includes("Đà Nẵng") || name.includes("Da Nang") || name.includes("Sơn Trà") || name.includes("Hải Châu") || name.includes("Ngũ Hành Sơn")) {
          locationName = "다낭";
        } else if (name.includes("Hội An") || name.includes("Hoi An")) {
          locationName = "호이안";
        } else {
          locationName = name || "다낭";
        }
      }
    } catch (geoError) {
      console.error('Error fetching location name:', geoError);
      if (lat === DANANG_LAT && lon === DANANG_LON) locationName = "다낭";
    }

    // Convert Open-Meteo ISO strings to unix timestamps (seconds)
    const sunriseStr = weatherData.daily.sunrise[0];
    const sunsetStr = weatherData.daily.sunset[0];
    const sunriseTimestamp = Math.floor(new Date(sunriseStr).getTime() / 1000);
    const sunsetTimestamp = Math.floor(new Date(sunsetStr).getTime() / 1000);

    return {
      temp: Math.round(weatherData.current_weather.temperature),
      tempMax: Math.round(weatherData.daily.temperature_2m_max[0]),
      sunrise: sunriseTimestamp,
      sunset: sunsetTimestamp,
      locationName: locationName
    };
  } catch (error) {
    console.error('Error fetching weather:', error);
    return {
      temp: 32,
      tempMax: 34,
      sunrise: 1715030400,
      sunset: 1715077200,
      locationName: "다낭"
    };
  }
};
