import axios from 'axios';
import { PrayerTimesResponse, formatPrayerTime as formatPrayerTimeFromPrayerService } from './prayerService';

// Base API URL for Aladhan API
const API_URL = 'https://api.aladhan.com/v1';

export interface RamadanDay {
  date: {
    readable: string;
    timestamp: string;
    gregorian: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string };
      month: { number: number; en: string };
      year: string;
    };
    hijri: {
      date: string;
      format: string;
      day: string;
      weekday: { en: string; ar: string };
      month: { number: number; en: string; ar: string; days: number };
      year: string;
      holidays: string[];
    };
  };
  timings: {
    Fajr: string;
    Sunrise: string;
    Dhuhr: string;
    Asr: string;
    Sunset: string;
    Maghrib: string;
    Isha: string;
    Imsak: string;
    Midnight: string;
    [key: string]: string;
  };
  meta: {
    latitude: number;
    longitude: number;
    timezone: string;
    method: {
      id: number;
      name: string;
    };
  };
}

export interface RamadanCalendarResponse {
  code: number;
  status: string;
  data: RamadanDay[];
}

// Re-export the formatPrayerTime function
export const formatPrayerTime = formatPrayerTimeFromPrayerService;

// Function to determine the default calculation method (always 1 - Muslim World League)
export const getDefaultCalculationMethod = (): number => {
  return 1; // Always return Muslim World League
};

// Get Ramadan calendar by address
export const getRamadanCalendarByAddress = async (
  year: number,
  month: number,
  address: string,
  method: number = 3
): Promise<RamadanDay[]> => {
  try {
    const response = await axios.get(`${API_URL}/calendarByAddress/${year}/${month}`, {
      params: {
        address,
        method,
        month,
        year,
        latitudeAdjustmentMethod: 3,
        tune: '0,0,0,0,0,0,0,0,0',
        school: 0,
        annual: false,
        adjustment: 1
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Ramadan calendar:', error);
    throw new Error('Failed to fetch Ramadan calendar. Please try again later.');
  }
};

// Get Ramadan calendar by coordinates
export const getRamadanCalendarByCoordinates = async (
  year: number,
  month: number,
  latitude: number,
  longitude: number,
  method: number = 3
): Promise<RamadanDay[]> => {
  try {
    const response = await axios.get(`${API_URL}/calendar/${year}/${month}`, {
      params: {
        latitude,
        longitude,
        method,
        month,
        year,
        latitudeAdjustmentMethod: 3,
        tune: '0,0,0,0,0,0,0,0,0',
        school: 0,
        annual: false,
        adjustment: 1
      }
    });
    
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Ramadan calendar:', error);
    throw new Error('Failed to fetch Ramadan calendar. Please try again later.');
  }
};

// Determine if a given date is in Ramadan
export const isRamadan = (hijriDate: { month: { number: number } }): boolean => {
  return hijriDate.month.number === 9; // Ramadan is the 9th month in the Hijri calendar
};

// Find Ramadan start and end dates for a given year
export const findRamadanDates = async (
  gregorianYear: number,
  address: string,
  method: number = 3
): Promise<{ startDate: string; endDate: string; startMonth: number; endMonth: number }> => {
  // We need to check multiple months since Ramadan can fall in different Gregorian months
  // For 2025, Ramadan is expected to start around March 1
  let ramadanStart = null;
  let ramadanEnd = null;
  let startMonth = 0;
  let endMonth = 0;
  
  // Check February, March, and April to be safe
  for (let month = 2; month <= 4; month++) {
    const calendar = await getRamadanCalendarByAddress(gregorianYear, month, address, method);
    
    for (const day of calendar) {
      if (isRamadan(day.date.hijri)) {
        if (!ramadanStart) {
          ramadanStart = day.date.gregorian.date;
          startMonth = month;
        }
        ramadanEnd = day.date.gregorian.date;
        endMonth = month;
      } else if (ramadanStart && !ramadanEnd) {
        // If we've found the start but not the end, and we're no longer in Ramadan,
        // then the last day we saw was the end
        break;
      }
    }
    
    if (ramadanStart && (month > startMonth)) {
      // We've checked at least one month after Ramadan started, so we should have found the end
      break;
    }
  }
  
  return {
    startDate: ramadanStart || '',
    endDate: ramadanEnd || '',
    startMonth,
    endMonth
  };
};

// Get the full Ramadan calendar
export const getRamadanCalendar = async (
  gregorianYear: number,
  address: string,
  method: number = 3
): Promise<RamadanDay[]> => {
  try {
    // First find when Ramadan starts and ends
    const { startMonth, endMonth } = await findRamadanDates(gregorianYear, address, method);
    
    if (!startMonth) {
      throw new Error('Could not determine Ramadan dates');
    }
    
    // Get calendar data for the relevant months
    const months = startMonth === endMonth ? [startMonth] : [startMonth, endMonth];
    let allDays: RamadanDay[] = [];
    
    for (const month of months) {
      const monthData = await getRamadanCalendarByAddress(gregorianYear, month, address, method);
      allDays = [...allDays, ...monthData];
    }
    
    // Filter to only include Ramadan days
    return allDays.filter(day => isRamadan(day.date.hijri));
  } catch (error) {
    console.error('Error fetching complete Ramadan calendar:', error);
    throw new Error('Failed to fetch Ramadan calendar. Please try again later.');
  }
};