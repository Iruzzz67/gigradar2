import React, { createContext, useContext, useState, useEffect } from 'react';
import { Coordinates } from '../types';
import { nativeBridge } from '../services/bridge';

interface LocationContextType {
  coords: Coordinates;
  cityName: string;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'requesting';
  refreshLocation: () => Promise<void>;
  calculateDistanceKm: (lat: number, lng: number) => number;
  calculateBearingDeg: (lat: number, lng: number) => number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default center: Bentara Budaya Palmerah / TIM Jakarta
const DEFAULT_COORDS: Coordinates = {
  latitude: -6.2297,
  longitude: 106.8184,
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<Coordinates>(DEFAULT_COORDS);
  const [cityName, setCityName] = useState<string>('Jakarta Selatan');
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');

  const refreshLocation = async () => {
    setPermissionStatus('requesting');
    try {
      const result = await nativeBridge.requestLocation();
      setCoords(result.coords);
      setPermissionStatus(result.source === 'fallback' ? 'denied' : 'granted');
      
      // Determine nearest scene hub
      if (Math.abs(result.coords.latitude - (-6.8849)) < 0.3) {
        setCityName('Bandung');
      } else {
        setCityName('Jakarta Selatan');
      }
    } catch {
      setPermissionStatus('denied');
      setCoords(DEFAULT_COORDS);
    }
  };

  useEffect(() => {
    refreshLocation();
  }, []);

  // Haversine formula for distance
  const calculateDistanceKm = (lat: number, lng: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = ((lat - coords.latitude) * Math.PI) / 180;
    const dLon = ((lng - coords.longitude) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((coords.latitude * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return Math.round(d * 10) / 10;
  };

  // Bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  const calculateBearingDeg = (lat: number, lng: number): number => {
    const y = Math.sin(((lng - coords.longitude) * Math.PI) / 180) * Math.cos((lat * Math.PI) / 180);
    const x =
      Math.cos((coords.latitude * Math.PI) / 180) * Math.sin((lat * Math.PI) / 180) -
      Math.sin((coords.latitude * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.cos(((lng - coords.longitude) * Math.PI) / 180);
    let bearing = (Math.atan2(y, x) * 180) / Math.PI;
    return (bearing + 360) % 360;
  };

  return (
    <LocationContext.Provider
      value={{
        coords,
        cityName,
        permissionStatus,
        refreshLocation,
        calculateDistanceKm,
        calculateBearingDeg,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};
