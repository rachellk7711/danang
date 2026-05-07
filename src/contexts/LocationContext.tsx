import React, { createContext, useContext, useState, useEffect } from 'react';

interface Coords {
  lat: number;
  lng: number;
}

interface LocationContextType {
  coords: Coords | null;
  setCoords: (coords: Coords) => void;
  locationName: string;
  setLocationName: (name: string) => void;
  isMock: boolean;
  setIsMock: (isMock: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

const DANANG_DEFAULT = { lat: 16.0544, lng: 108.2022 };

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locationName, setLocationName] = useState<string>("위치 파악 중...");
  const [isMock, setIsMock] = useState<boolean>(false);

  useEffect(() => {
    // Initial GPS fetch
    if ("geolocation" in navigator && !isMock) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCoords({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          setCoords(DANANG_DEFAULT);
          setLocationName("다낭");
        }
      );
    }
  }, []);

  return (
    <LocationContext.Provider value={{ coords, setCoords, locationName, setLocationName, isMock, setIsMock }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
