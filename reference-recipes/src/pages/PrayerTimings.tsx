import React, { useState, useEffect } from 'react';
import { Moon, MapPin, Bell, Calendar, Clock, ArrowLeft, Settings, RefreshCw, AlertTriangle, ChevronDown, Check, Wifi } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useGeolocation } from '../hooks/useGeolocation';
import { usePrayerTimes } from '../hooks/usePrayerTimes';
import { calculationMethods, formatPrayerTime } from '../services/prayerService';
import Cookies from 'js-cookie';
// Import the image properly
import backgroundImage from '../assets/images/background.jpeg';

// Map of country to recommended calculation method - no longer used for auto-selection
const countryMethodMap: Record<string, number> = {
  'Singapore': 4,
  'France': 5,
  'Turkey': 6,
  'Russia': 7,
  'United States': 2,
};

function PrayerTimings() {
  const navigate = useNavigate();
  const [location, setLocation] = useState(Cookies.get('prayerLocation') || '');
  const [showMethodDropdown, setShowMethodDropdown] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState(Number(Cookies.get('prayerMethod')) || 1); // Default to Muslim World League (1)
  const [useGeolocationData, setUseGeolocationData] = useState(
    Cookies.get('useGeolocation') === 'false' ? false : true // Default to true
  );
  const [manualLocation, setManualLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [countryDetected, setCountryDetected] = useState('');
  
  // Get user's geolocation with high accuracy
  const geolocation = useGeolocation({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0
  });
  
  // Get prayer times based on location
  const { 
    prayerTimes, 
    nextPrayer, 
    date, 
    meta, 
    loading, 
    error, 
    refresh 
  } = usePrayerTimes({
    latitude: useGeolocationData ? geolocation.latitude : null,
    longitude: useGeolocationData ? geolocation.longitude : null,
    address: !useGeolocationData ? location : undefined,
    method: selectedMethod
  });

  // Update location display but DON'T auto-select calculation method
  useEffect(() => {
    if (useGeolocationData && meta.latitude && meta.longitude) {
      // Reverse geocode to get location name and country
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${meta.latitude}&lon=${meta.longitude}&zoom=10`)
        .then(response => response.json())
        .then(data => {
          const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || '';
          const country = data.address?.country || '';
          const locationName = `${city}, ${country}`.trim();
          
          setLocation(locationName || `${meta.latitude.toFixed(2)}, ${meta.longitude.toFixed(2)}`);
          Cookies.set('prayerLocation', locationName, { expires: 365 });
          
          // Set country detected for display purposes only
          if (country) {
            setCountryDetected(country);
          }
          
          // Always use Muslim World League (1) regardless of location
          if (selectedMethod !== 1) {
            setSelectedMethod(1);
            Cookies.set('prayerMethod', '1', { expires: 365 });
          }
        })
        .catch(() => {
          setLocation(`${meta.latitude.toFixed(2)}, ${meta.longitude.toFixed(2)}`);
        });
    }
  }, [useGeolocationData, meta.latitude, meta.longitude]);

  // Handle method change
  const handleMethodChange = (methodId: number) => {
    setSelectedMethod(methodId);
    Cookies.set('prayerMethod', methodId.toString(), { expires: 365 });
    setShowMethodDropdown(false);
  };

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

  // Get current time
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Determine if error is likely due to VPN
  const isVpnRelatedError = error && 
    (error.includes("location") || 
     error.includes("geolocation") || 
     error.toLowerCase().includes("permission") ||
     !geolocation.latitude || 
     !geolocation.longitude);

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
        {/* Location and Date Header */}
        <div className="text-center mb-8">
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
          
          <div className="flex justify-center gap-4 text-white">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-yellow-400" />
              <span>{date?.gregorian || new Date().toLocaleDateString()}</span>
            </div>
            <span className="text-yellow-400">|</span>
            <div className="flex items-center gap-2">
              <Moon className="w-5 h-5 text-yellow-400" />
              <span>{date?.hijri || 'Loading...'}</span>
            </div>
          </div>
        </div>

        {/* Calculation Method Selector */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative">
            <button 
              onClick={() => setShowMethodDropdown(!showMethodDropdown)}
              className="w-full bg-emerald-800/30 text-white px-6 py-4 rounded-full border border-emerald-700/30 hover:border-yellow-400/30 transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-yellow-400" />
                <span>Calculation Method: {calculationMethods.find(m => m.id === selectedMethod)?.name || 'Loading...'}</span>
              </div>
              <ChevronDown className="w-5 h-5 text-yellow-400" />
            </button>
            
            {showMethodDropdown && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-emerald-800/95 backdrop-blur-sm border border-yellow-400/20 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                {calculationMethods.map(method => (
                  <button
                    key={method.id}
                    className={`w-full text-left px-6 py-3 hover:bg-emerald-700/30 transition-colors ${
                      selectedMethod === method.id ? 'text-yellow-400 bg-emerald-700/20' : 'text-white'
                    }`}
                    onClick={() => handleMethodChange(method.id)}
                  >
                    <div className="font-medium">{method.name}</div>
                    {method.description && (
                      <div className="text-sm text-gray-300">{method.description}</div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Error State - Enhanced with VPN suggestion */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 bg-red-500/20 border border-red-500/30 rounded-lg p-6 text-center">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <h3 className="text-xl text-white mb-2">Error Loading Prayer Times</h3>
            <p className="text-gray-300 mb-4">{error}</p>
            
            {isVpnRelatedError && (
              <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-5 h-5 text-yellow-400" />
                  <p className="text-yellow-300 font-medium">VPN Detected</p>
                </div>
                <p className="text-gray-300 text-sm">Please try turning off your VPN for more accurate location calculation.</p>
              </div>
            )}
            
            <div className="flex flex-wrap justify-center gap-3">
              <button 
                onClick={refresh}
                className="bg-yellow-400 text-emerald-900 px-6 py-2 rounded-full hover:bg-yellow-500 transition-colors flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Try Again</span>
              </button>
              
              {!useGeolocationData && (
                <button 
                  onClick={() => {
                    setUseGeolocationData(true);
                    Cookies.set('useGeolocation', 'true', { expires: 365 });
                    refresh();
                  }}
                  className="bg-emerald-700 text-white px-6 py-2 rounded-full hover:bg-emerald-600 transition-colors flex items-center gap-2"
                >
                  <MapPin className="w-4 h-4" />
                  <span>Use My Location</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Auto-selected Method Info (when country is detected) - Updated message */}
        {countryDetected && !error && (
          <div className="max-w-3xl mx-auto mb-6">
            <div className="bg-yellow-400/10 border border-yellow-400/20 rounded-lg p-4 text-center">
              <p className="text-white">
                <span className="text-yellow-300">Muslim World League method</span> is used for prayer times in <span className="text-yellow-300">{countryDetected}</span>
              </p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && !error && (
          <div className="max-w-3xl mx-auto mb-8 bg-emerald-800/30 rounded-lg p-8 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        )}

        {/* Next Prayer Countdown */}
        {!loading && !error && nextPrayer && (
          <div className="mb-12">
            <div className="max-w-3xl mx-auto bg-emerald-800/30 rounded-2xl p-8 backdrop-blur-sm border border-emerald-700/30">
              <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-4">
                <div className="text-center md:text-left">
                  <h2 className="text-xl text-yellow-400 mb-2">Next Prayer</h2>
                  <div className="text-4xl font-bold text-white">{nextPrayer.name}</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-yellow-400">{nextPrayer.timeRemaining}</div>
                  <div className="text-white mt-2">Until {nextPrayer.name} Prayer</div>
                </div>
                <div className="text-center md:text-right">
                  <div className="text-xl text-white mb-1">Current Time</div>
                  <div className="text-2xl text-yellow-400">{currentTime}</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Prayer Times Grid */}
        {!loading && !error && prayerTimes && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {[
              { name: 'Fajr', arabicName: 'الفجر', time: formatPrayerTime(prayerTimes.Fajr) },
              { name: 'Sunrise', arabicName: 'الشروق', time: formatPrayerTime(prayerTimes.Sunrise) },
              { name: 'Dhuhr', arabicName: 'الظهر', time: formatPrayerTime(prayerTimes.Dhuhr) },
              { name: 'Asr', arabicName: 'العصر', time: formatPrayerTime(prayerTimes.Asr) },
              { name: 'Maghrib', arabicName: 'المغرب', time: formatPrayerTime(prayerTimes.Maghrib) },
              { name: 'Isha', arabicName: 'العشاء', time: formatPrayerTime(prayerTimes.Isha) }
            ].map((prayer) => (
              <div 
                key={prayer.name}
                className={`bg-emerald-800/30 rounded-2xl p-6 backdrop-blur-sm border ${
                  nextPrayer?.name === prayer.name 
                    ? 'border-yellow-400/50 ring-2 ring-yellow-400/20' 
                    : 'border-emerald-700/30 hover:border-yellow-400/30'
                } transition-all duration-300`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">{prayer.name}</h3>
                    <p className="text-yellow-400 text-lg font-arabic">{prayer.arabicName}</p>
                  </div>
                  <button className="text-yellow-400 hover:text-yellow-500 transition-colors">
                    <Bell className="w-6 h-6" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-yellow-400" />
                  <span className="text-3xl font-bold text-white">{prayer.time}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default PrayerTimings;