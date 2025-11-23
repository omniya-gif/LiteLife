import { useState, useEffect } from 'react';
import { getPrayerCalendar, PrayerTimesResponse } from '../services/prayerService';
import Cookies from 'js-cookie';

interface UseRamadanCalendarProps {
  year: number;
  month?: number; // Ramadan month - will default to correct month for the year
  latitude?: number;
  longitude?: number;
  address?: string;
  method?: number;
}

interface RamadanCalendarResult {
  calendar: PrayerTimesResponse[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useRamadanCalendar({
  year,
  month, // Optional month parameter
  latitude,
  longitude,
  address,
  method // We'll ignore this parameter
}: UseRamadanCalendarProps): RamadanCalendarResult {
  const [calendar, setCalendar] = useState<PrayerTimesResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Force refresh function
  const refresh = () => setRefreshTrigger(prev => prev + 1);

  useEffect(() => {
    const fetchCalendar = async () => {
      setLoading(true);
      setError(null);

      try {
        // Determine which month is Ramadan for the given year
        // This is a simplified approach - a more accurate one would use hijri calendar APIs
        const ramadanMonth = month || 3; // Default to March (approximate for 2025)
        
        // Use coordinates from cookies if available and not provided
        let lat = latitude;
        let lng = longitude;
        
        if (!lat || !lng) {
          // Try to get from cookies or use defaults
          const useGeo = Cookies.get('useGeolocation') !== 'false';
          
          if (useGeo) {
            try {
              const position = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
              });
              
              lat = position.coords.latitude;
              lng = position.coords.longitude;
            } catch (err) {
              console.error('Geolocation error:', err);
              // Fall back to default location if geolocation fails
              lat = 21.3891; // Mecca
              lng = 39.8579;
            }
          } else {
            // Default coordinates for Mecca
            lat = 21.3891;
            lng = 39.8579;
          }
        }
        
        // Always use Muslim World League (method 1) regardless of input
        const calculationMethod = 1;
        
        // Fetch the calendar data
        const calendarData = await getPrayerCalendar(year, ramadanMonth, lat, lng, calculationMethod);
        
        // Validate calendar data
        if (Array.isArray(calendarData) && calendarData.length > 0) {
          // Process the calendar data to ensure all time strings are valid
          const processedData = calendarData.map(day => {
            // Make sure timings object exists
            if (!day.timings) {
              day.timings = {};
            }
            
            // Ensure all required timings are present
            const requiredTimings = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha', 'Imsak'];
            requiredTimings.forEach(timing => {
              if (!day.timings[timing]) {
                day.timings[timing] = '';
              }
            });
            
            return day;
          });
          
          setCalendar(processedData);
        } else {
          console.error('Invalid calendar data received:', calendarData);
          setError('Invalid calendar data received from API.');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching Ramadan calendar:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch Ramadan calendar');
        setLoading(false);
      }
    };

    fetchCalendar();
  }, [year, month, latitude, longitude, address, refreshTrigger]); // Removed method from dependencies

  return {
    calendar,
    loading,
    error,
    refresh
  };
}