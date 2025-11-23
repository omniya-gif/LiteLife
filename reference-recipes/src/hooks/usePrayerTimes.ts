import { useState, useEffect, useRef } from 'react';
import { 
  getPrayerTimesByCoordinates, 
  getPrayerTimesByCity, 
  getPrayerTimesByAddress,
  getNextPrayer,
  PrayerTimesResponse,
  PrayerTimes
} from '../services/prayerService';
import Cookies from 'js-cookie';

interface UsePrayerTimesProps {
  latitude?: number | null;
  longitude?: number | null;
  city?: string;
  country?: string;
  address?: string;
  date?: string;
  method?: number;
  adjustments?: string;
}

interface UsePrayerTimesState {
  prayerTimes: PrayerTimes | null;
  nextPrayer: {
    name: string;
    time: string;
    timeRemaining: string;
  } | null;
  date: {
    gregorian: string;
    hijri: string;
  } | null;
  meta: {
    latitude: number | null;
    longitude: number | null;
    timezone: string | null;
    method: {
      id: number;
      name: string;
    } | null;
  };
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const usePrayerTimes = ({
  latitude,
  longitude,
  city,
  country,
  address,
  date,
  method, // We'll ignore this parameter and always use 1
  adjustments
}: UsePrayerTimesProps): UsePrayerTimesState => {
  const [state, setState] = useState<UsePrayerTimesState>({
    prayerTimes: null,
    nextPrayer: null,
    date: null,
    meta: {
      latitude: null,
      longitude: null,
      timezone: null,
      method: null
    },
    loading: true,
    error: null,
    refresh: async () => {}
  });

  // Use ref to hold prayerTimes so the interval always has access to latest data
  const prayerTimesRef = useRef<PrayerTimes | null>(null);

  const fetchPrayerTimes = async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      let response: PrayerTimesResponse;
      
      // Always use Muslim World League (method 1)
      const calculationMethod = 1;

      if (latitude && longitude) {
        response = await getPrayerTimesByCoordinates(latitude, longitude, date, calculationMethod, adjustments);
      } else if (city && country) {
        response = await getPrayerTimesByCity(city, country, date, calculationMethod, adjustments);
      } else if (address) {
        response = await getPrayerTimesByAddress(address, date, calculationMethod, adjustments);
      } else {
        throw new Error('Insufficient location data provided');
      }

      // Store the prayer times in the ref for the interval to use
      prayerTimesRef.current = response.timings;
      const nextPrayer = getNextPrayer(response.timings);

      setState({
        prayerTimes: response.timings,
        nextPrayer,
        date: {
          gregorian: response.date.gregorian.date,
          hijri: `${response.date.hijri.day} ${response.date.hijri.month.en}, ${response.date.hijri.year}`
        },
        meta: {
          latitude: response.meta.latitude,
          longitude: response.meta.longitude,
          timezone: response.meta.timezone,
          method: {
            id: response.meta.method.id,
            name: response.meta.method.name
          }
        },
        loading: false,
        error: null,
        refresh: fetchPrayerTimes
      });

      // Save the method preference - always set to 1
      Cookies.set('prayerMethod', '1', { expires: 365 });
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch prayer times',
        refresh: fetchPrayerTimes
      }));
    }
  };

  // Separate effect for fetching prayer times
  useEffect(() => {
    fetchPrayerTimes();
  }, [latitude, longitude, city, country, address, date, method, adjustments]);
  
  // Separate effect for setting up the countdown timer
  useEffect(() => {
    // Set up interval to update the "time remaining" every second
    const intervalId = setInterval(() => {
      if (prayerTimesRef.current) {
        const updatedNextPrayer = getNextPrayer(prayerTimesRef.current);
        setState(prev => ({
          ...prev,
          nextPrayer: updatedNextPrayer
        }));
      }
    }, 1000);

    // Clean up the interval when component unmounts or dependencies change
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount

  return state;
};