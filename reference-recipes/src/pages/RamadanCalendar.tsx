import React, { useState, useEffect } from 'react';
import { Moon, ArrowLeft, Calendar, MapPin, Download, Info, RefreshCw, AlertTriangle, Settings, ChevronDown, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useRamadanCalendar } from '../hooks/useRamadanCalendar';
import { formatPrayerTime } from '../services/prayerService';
import { generateRamadanCalendarPDF } from '../utils/pdfUtils';
import Cookies from 'js-cookie';
// Import the image properly
import backgroundImage from '../assets/images/background.jpeg';

function RamadanCalendar() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(Cookies.get('prayerLocation') || 'London, UK');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [manualLocation, setManualLocation] = useState('');
  const [selectedYear, setSelectedYear] = useState(2025);
  const [useGeolocationData, setUseGeolocationData] = useState(
    Cookies.get('useGeolocation') === 'false' ? false : true // Default to true
  );
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Get Ramadan calendar data
  const { 
    calendar, 
    loading, 
    error, 
    refresh 
  } = useRamadanCalendar({
    year: selectedYear,
    address: location
  });

  // Update location from cookies when component mounts
  useEffect(() => {
    const savedLocation = Cookies.get('prayerLocation');
    if (savedLocation) {
      setLocation(savedLocation);
    }
  }, []);

  // Handle location change
  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualLocation.trim()) {
      setLocation(manualLocation);
      Cookies.set('prayerLocation', manualLocation, { expires: 365 });
      setUseGeolocationData(false);
      Cookies.set('useGeolocation', 'false', { expires: 365 });
      setShowLocationInput(false);
      refresh();
    }
  };

  // Toggle geolocation usage
  const toggleGeolocation = () => {
    const newValue = !useGeolocationData;
    setUseGeolocationData(newValue);
    Cookies.set('useGeolocation', newValue.toString(), { expires: 365 });
    setShowLocationInput(false);
    
    if (newValue) {
      refresh();
    }
  };

  // Format date for display - Fixed to handle different date formats
  const formatDate = (dateString: string) => {
    try {
      // Check if format is DD-MM-YYYY
      if (dateString.includes('-')) {
        const [day, month, year] = dateString.split('-').map(Number);
        if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
          const date = new Date(year, month - 1, day);
          return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short'
          });
        }
      }
      
      // Fallback to standard Date parsing
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        day: 'numeric', 
        month: 'short'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };

  // Safe prayer time formatter that handles invalid values and timezone information
  const safeFormatPrayerTime = (timeString: string | undefined) => {
    if (!timeString) return '--:--';
    
    try {
      // Strip timezone information if present (e.g., "05:53 (+03)")
      const cleanTimeString = timeString.replace(/\s*\([+-]\d+\)/, '').trim();
      
      // Check if it's a valid time string after cleaning
      if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(cleanTimeString)) {
        return formatPrayerTime(timeString);
      }
      
      // Try to format anyway in case our regex missed something
      const formattedTime = formatPrayerTime(timeString);
      if (formattedTime !== "--:--") {
        return formattedTime;
      }
      
      return '--:--';
    } catch (error) {
      console.error('Error formatting prayer time:', error, timeString);
      return '--:--';
    }
  };

  // Handle download calendar
  const handleDownloadCalendar = () => {
    if (calendar.length === 0 || loading) return;
    
    setIsDownloading(true);
    
    try {
      generateRamadanCalendarPDF(calendar, location, selectedYear);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-cover bg-center bg-no-repeat bg-emerald-900/95" 
         style={{ backgroundImage: `linear-gradient(to left, rgba(20, 24, 23, 0.001), rgba(10, 14, 13, 0.002)), url(${backgroundImage})` }}>
      {/* Navigation */}
      <nav className="p-4">
        <div className="container mx-auto flex items-center justify-between">
          <button 
            onClick={() => navigate('/')} 
            className="text-yellow-400 flex items-center gap-2 hover:text-yellow-500 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
            <span className="text-lg">Back to Home</span>
          </button>
          
          <div className="w-12 h-12">
            <div className="w-full h-full rounded-full bg-yellow-400/90 flex items-center justify-center">
              <Moon className="text-emerald-900 w-8 h-8" />
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">Ramadan Calendar 2025</h1>
          
          {/* Download Button - Moved to top */}
          <div className="mb-4">
            <button 
              onClick={handleDownloadCalendar}
              disabled={loading || calendar.length === 0 || isDownloading}
              className={`inline-flex items-center gap-2 px-8 py-3 rounded-full font-semibold transition-colors ${
                loading || calendar.length === 0 || isDownloading
                  ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                  : 'bg-yellow-400 text-emerald-900 hover:bg-yellow-500'
              }`}
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-emerald-900 border-t-transparent rounded-full"></div>
                  <span>Generating PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download Full Calendar</span>
                </>
              )}
            </button>
          </div>
          
          <div className="inline-flex items-center gap-2 bg-emerald-800/50 px-6 py-3 rounded-full mb-4 relative">
            <MapPin className="w-5 h-5 text-yellow-400" />
            <span className="text-white">{location || 'Loading location...'}</span>
            <button 
              onClick={() => setShowLocationInput(!showLocationInput)}
              className="ml-2 text-yellow-400 hover:text-yellow-500 transition-colors"
            >
              <Settings className="w-4 h-4" />
            </button>
            
            {/* Location Settings Dropdown */}
            {showLocationInput && (
              <div className="absolute top-full left-0 mt-2 w-full bg-emerald-800/95 backdrop-blur-sm border border-yellow-400/20 rounded-lg shadow-lg z-50 p-4">
                <form onSubmit={handleLocationSubmit} className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter city, country"
                      value={manualLocation}
                      onChange={(e) => setManualLocation(e.target.value)}
                      className="flex-1 bg-emerald-700/50 text-white placeholder-gray-400 px-4 py-2 rounded-md border border-emerald-600 focus:border-yellow-400 focus:outline-none"
                    />
                    <button 
                      type="submit"
                      className="bg-yellow-400 text-emerald-900 px-4 py-2 rounded-md hover:bg-yellow-500 transition-colors"
                    >
                      Set
                    </button>
                  </div>
                </form>
                
                <div className="flex items-center gap-2 text-white">
                  <button 
                    onClick={toggleGeolocation}
                    className={`w-5 h-5 rounded-sm flex items-center justify-center ${useGeolocationData ? 'bg-yellow-400' : 'border border-yellow-400'}`}
                  >
                    {useGeolocationData && <Check className="w-4 h-4 text-emerald-900" />}
                  </button>
                  <span>Use my current location</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Info Box */}
        <div className="max-w-4xl mx-auto mb-8 bg-emerald-800/30 rounded-2xl p-6 backdrop-blur-sm border border-emerald-700/30">
          <div className="flex items-start gap-4">
            <Info className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-yellow-400 text-lg font-semibold mb-2">Ramadan Information</h3>
              <p className="text-white text-sm">
                Ramadan is expected to begin around March 1, 2025, subject to moon sighting. Times are calculated based on the Muslim World League method.
              </p>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="max-w-4xl mx-auto mb-8 bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-xl text-white mb-2">Error Loading Ramadan Calendar</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            <button 
              onClick={refresh}
              className="bg-yellow-400 text-emerald-900 px-6 py-2 rounded-full hover:bg-yellow-500 transition-colors flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="max-w-4xl mx-auto mb-8 bg-emerald-800/30 rounded-lg p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {/* Calendar Table */}
        {!loading && !error && calendar.length > 0 && (
          <div className="bg-emerald-800/30 rounded-2xl backdrop-blur-sm border border-emerald-700/30 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-7 gap-4 p-4 bg-emerald-800/50 text-yellow-400 font-semibold">
              <div>Day</div>
              <div>Date</div>
              <div>Suhoor</div>
              <div>Fajr</div>
              <div>Dhuhr</div>
              <div>Asr</div>
              <div>Iftar</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-emerald-700/30">
              {calendar.map((day, index) => {
                // Ensure the date exists and is properly formatted
                const date = day.date?.gregorian?.date || '';
                const dayNumber = day.date?.hijri?.day || (index + 1).toString();
                
                // Ensure timings exist before trying to format them
                const timings = day.timings || {};
                
                return (
                  <div key={index} className="grid grid-cols-7 gap-4 p-4 text-white hover:bg-emerald-800/40 transition-colors">
                    <div className="font-semibold">{dayNumber}</div>
                    <div>{formatDate(date)}</div>
                    <div className="text-yellow-400">{safeFormatPrayerTime(timings.Imsak)}</div>
                    <div>{safeFormatPrayerTime(timings.Fajr)}</div>
                    <div>{safeFormatPrayerTime(timings.Dhuhr)}</div>
                    <div>{safeFormatPrayerTime(timings.Asr)}</div>
                    <div className="text-yellow-400">{safeFormatPrayerTime(timings.Maghrib)}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Download button has been moved to the top */}
      </div>
    </div>
  );
}

export default RamadanCalendar;