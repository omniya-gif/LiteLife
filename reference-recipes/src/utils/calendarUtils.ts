import { PrayerTimesResponse } from '../services/prayerService';

/**
 * Validates calendar data from API response
 */
export const validateCalendarData = (data: any): boolean => {
  if (!Array.isArray(data)) return false;
  if (data.length === 0) return false;
  
  // Check if the first item has the expected structure
  const firstDay = data[0];
  return (
    firstDay &&
    typeof firstDay === 'object' &&
    firstDay.timings &&
    typeof firstDay.timings === 'object' &&
    firstDay.date &&
    typeof firstDay.date === 'object'
  );
};

/**
 * Safe getter for prayer time values with fallbacks
 */
export const getPrayerTime = (
  calendar: PrayerTimesResponse[], 
  dayIndex: number, 
  prayerName: string
): string => {
  try {
    if (
      calendar && 
      calendar[dayIndex] && 
      calendar[dayIndex].timings && 
      calendar[dayIndex].timings[prayerName]
    ) {
      // Strip timezone information if present
      return calendar[dayIndex].timings[prayerName].replace(/\s*\([+-]\d+\)/, '').trim();
    }
    return '';
  } catch (error) {
    console.error(`Error getting prayer time for ${prayerName} on day ${dayIndex}:`, error);
    return '';
  }
};

/**
 * Format a date string for display in the calendar
 */
export const formatCalendarDate = (dateString: string): string => {
  try {
    // Handle DD-MM-YYYY format
    if (dateString.includes('-')) {
      const parts = dateString.split('-');
      if (parts.length === 3) {
        const [day, month, year] = parts.map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short' 
          });
        }
      }
    }
    
    // Try standard date parsing as fallback
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short' 
      });
    }
    
    return 'Invalid date';
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Cleans prayer time string from timezone information
 */
export const cleanPrayerTime = (timeString: string): string => {
  if (!timeString) return '';
  
  // Remove timezone information in parentheses, e.g. "05:53 (+03)"
  return timeString.replace(/\s*\([+-]\d+\)/, '').trim();
};
