import React, { createContext, useContext, useState, useEffect } from 'react';
import { Coordinates } from '../types';
import { nativeBridge } from '../services/bridge';

export interface IndonesianCity {
  id: string;
  name: string;
  province: string;
  latitude: number;
  longitude: number;
}

export const POPULAR_INDONESIAN_CITIES: IndonesianCity[] = [
  { id: 'jkt-selatan', name: 'Jakarta Selatan', province: 'DKI Jakarta', latitude: -6.2615, longitude: 106.8106 },
  { id: 'jkt-pusat', name: 'Jakarta Pusat', province: 'DKI Jakarta', latitude: -6.1805, longitude: 106.8284 },
  { id: 'jkt-barat', name: 'Jakarta Barat', province: 'DKI Jakarta', latitude: -6.1683, longitude: 106.7589 },
  { id: 'jkt-utara', name: 'Jakarta Utara', province: 'DKI Jakarta', latitude: -6.1384, longitude: 106.8640 },
  { id: 'jkt-timur', name: 'Jakarta Timur', province: 'DKI Jakarta', latitude: -6.2250, longitude: 106.9004 },
  { id: 'bdg', name: 'Bandung', province: 'Jawa Barat', latitude: -6.9175, longitude: 107.6191 },
  { id: 'bgr', name: 'Bogor', province: 'Jawa Barat', latitude: -6.5971, longitude: 106.8060 },
  { id: 'dpk', name: 'Depok', province: 'Jawa Barat', latitude: -6.4025, longitude: 106.7942 },
  { id: 'tng', name: 'Tangerang', province: 'Banten', latitude: -6.1783, longitude: 106.6319 },
  { id: 'bks', name: 'Bekasi', province: 'Jawa Barat', latitude: -6.2383, longitude: 106.9756 },
  { id: 'sby', name: 'Surabaya', province: 'Jawa Timur', latitude: -7.2575, longitude: 112.7521 },
  { id: 'yk', name: 'Yogyakarta', province: 'DI Yogyakarta', latitude: -7.7956, longitude: 110.3695 },
  { id: 'smg', name: 'Semarang', province: 'Jawa Tengah', latitude: -6.9667, longitude: 110.4167 },
  { id: 'slo', name: 'Solo (Surakarta)', province: 'Jawa Tengah', latitude: -7.5755, longitude: 110.8243 },
  { id: 'mlg', name: 'Malang', province: 'Jawa Timur', latitude: -7.9666, longitude: 112.6326 },
  { id: 'dps', name: 'Denpasar (Bali)', province: 'Bali', latitude: -8.6705, longitude: 115.2126 },
  { id: 'mdn', name: 'Medan', province: 'Sumatera Utara', latitude: -3.5952, longitude: 98.6722 },
  { id: 'mks', name: 'Makassar', province: 'Sulawesi Selatan', latitude: -5.1477, longitude: 119.4327 },
];

interface LocationContextType {
  coords: Coordinates;
  cityName: string;
  isCustomCity: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'requesting';
  refreshLocation: () => Promise<void>;
  setCityManually: (city: IndonesianCity | { name: string; latitude: number; longitude: number }) => void;
  calculateDistanceKm: (lat: number, lng: number) => number;
  calculateBearingDeg: (lat: number, lng: number) => number;
  isLocationModalOpen: boolean;
  setIsLocationModalOpen: (open: boolean) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

// Default center: Bentara Budaya Palmerah / TIM Jakarta
const DEFAULT_COORDS: Coordinates = {
  latitude: -6.2297,
  longitude: 106.8184,
};

// Calculate nearest known city by Haversine formula
const findNearestCity = (lat: number, lng: number): string => {
  let nearest = POPULAR_INDONESIAN_CITIES[0].name;
  let minDist = Infinity;
  for (const city of POPULAR_INDONESIAN_CITIES) {
    const dLat = ((city.latitude - lat) * Math.PI) / 180;
    const dLon = ((city.longitude - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((city.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const dist = 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    if (dist < minDist) {
      minDist = dist;
      nearest = city.name;
    }
  }
  return nearest;
};

// Reverse geocode to get actual city / regency name
const resolveCityName = async (lat: number, lng: number): Promise<string> => {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=id`,
      { signal: controller.signal }
    );
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      const detected = data.city || data.locality || data.principalSubdivision;
      if (detected) {
        return detected.replace(/^(Kota|Kabupaten)\s+/i, '');
      }
    }
  } catch {
    // network or timeout fallback
  }
  return findNearestCity(lat, lng);
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<Coordinates>(() => {
    try {
      const saved = localStorage.getItem('gigradar_coords');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_COORDS;
  });

  const [cityName, setCityName] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('gigradar_city_name');
      if (saved) return saved;
    } catch {}
    return 'Jakarta Selatan';
  });

  const [isCustomCity, setIsCustomCity] = useState<boolean>(() => {
    return localStorage.getItem('gigradar_city_is_manual') === 'true';
  });

  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'requesting'>('prompt');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  const refreshLocation = async () => {
    setPermissionStatus('requesting');
    try {
      const result = await nativeBridge.requestLocation();
      setCoords(result.coords);
      setIsCustomCity(false);
      localStorage.setItem('gigradar_city_is_manual', 'false');
      localStorage.setItem('gigradar_coords', JSON.stringify(result.coords));

      if (result.source === 'fallback') {
        setPermissionStatus('denied');
        // If fallback, use nearest city or default
        const detected = findNearestCity(result.coords.latitude, result.coords.longitude);
        setCityName(detected);
        localStorage.setItem('gigradar_city_name', detected);
      } else {
        setPermissionStatus('granted');
        const detected = await resolveCityName(result.coords.latitude, result.coords.longitude);
        setCityName(detected);
        localStorage.setItem('gigradar_city_name', detected);
      }
    } catch {
      setPermissionStatus('denied');
      setCoords(DEFAULT_COORDS);
      setCityName('Jakarta Selatan');
    }
  };

  const setCityManually = (city: IndonesianCity | { name: string; latitude: number; longitude: number }) => {
    const newCoords = { latitude: city.latitude, longitude: city.longitude };
    setCoords(newCoords);
    setCityName(city.name);
    setIsCustomCity(true);
    setPermissionStatus('granted');
    localStorage.setItem('gigradar_city_is_manual', 'true');
    localStorage.setItem('gigradar_coords', JSON.stringify(newCoords));
    localStorage.setItem('gigradar_city_name', city.name);
  };

  useEffect(() => {
    // Only auto-refresh if user hasn't chosen a custom city
    const wasManual = localStorage.getItem('gigradar_city_is_manual') === 'true';
    if (!wasManual) {
      refreshLocation();
    }
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
        isCustomCity,
        permissionStatus,
        refreshLocation,
        setCityManually,
        calculateDistanceKm,
        calculateBearingDeg,
        isLocationModalOpen,
        setIsLocationModalOpen,
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
