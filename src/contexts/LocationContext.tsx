import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Location {
  lat: number;
  lng: number;
  address: string;
}

interface LocationContextType {
  location: Location | null;
  setLocation: (location: Location) => void;
  getCurrentLocation: () => Promise<Location>;
  isLoading: boolean;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocationState] = useState<Location | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const setLocation = (newLocation: Location) => {
    setLocationState(newLocation);
    localStorage.setItem('userLocation', JSON.stringify(newLocation));
  };

  const getCurrentLocation = async (): Promise<Location> => {
    setIsLoading(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const { latitude, longitude } = position.coords;

      // Mock reverse geocoding
      const mockLocation: Location = {
        lat: latitude,
        lng: longitude,
        address: '123 Main St, City, State 12345'
      };

      setLocation(mockLocation);
      return mockLocation;
    } catch (error) {
      // Fallback location
      const fallbackLocation: Location = {
        lat: 40.7128,
        lng: -74.0060,
        address: 'New York, NY, USA'
      };
      setLocation(fallbackLocation);
      return fallbackLocation;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const savedLocation = localStorage.getItem('userLocation');
    if (savedLocation) {
      setLocationState(JSON.parse(savedLocation));
    }
  }, []);

  const value = {
    location,
    setLocation,
    getCurrentLocation,
    isLoading
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
};