import React, { useState, useEffect, useRef } from 'react';
import { Moon, ArrowLeft, Volume2, Shuffle, RotateCcw, Pause, BookmarkPlus, Share2, Settings2, MinusCircle, PlusCircle, Globe, Mic2, ChevronDown, AlertTriangle, Search, ChevronLeft, ChevronRight, Book, Download } from 'lucide-react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import QuranReader from '../components/QuranReader';
import { getAvailableTranslations, EditionInfo } from '../services/quranService';
import { shareQuranVerseViaWhatsApp } from '../utils/shareUtils';
import { getAvailableReciters, ReciterInfo } from '../utils/quranUtils';
import SurahDownloadModal from '../components/SurahDownloadModal';
// Import the images properly
import backgroundImage from '../assets/images/background.jpeg';
import bgTopImage from '../assets/images/bg-top.jpeg';

interface Reciter {
  id: string;
  name: string;
  arabicName: string;
}

const reciters: Reciter[] = [
  { id: 'ar.alafasy', name: 'Mishary Rashid Alafasy', arabicName: 'مشاري راشد العفاسي' },
  { id: 'ar.abdulbasitmurattal', name: 'Abdul Basit Abdul Samad', arabicName: 'عبد الباسط عبد الصمد' },
  { id: 'ar.abdurrahmaansudais', name: 'Abdurrahmaan As-Sudais', arabicName: 'عبدالرحمن السديس' },
  { id: 'ar.minshawi', name: 'Mohamed Siddiq El-Minshawi', arabicName: 'محمد صديق المنشاوي' },
];

function SurahPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const surahId = id ? parseInt(id, 10) : 1;
  
  const [fontSize, setFontSize] = useState(28);
  const [showTranslation, setShowTranslation] = useState(true);
  const [selectedReciter, setSelectedReciter] = useState(reciters[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<EditionInfo | null>(null);
  const [availableTranslations, setAvailableTranslations] = useState<EditionInfo[]>([]);
  const [showReciterDropdown, setShowReciterDropdown] = useState(false);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [translationsLoading, setTranslationsLoading] = useState(false);
  const [translationsError, setTranslationsError] = useState<string | null>(null);
  const [verseToFind, setVerseToFind] = useState<string>('');
  const [verseError, setVerseError] = useState<string | null>(null);
  const [bookmarkFeedback, setBookmarkFeedback] = useState<string | null>(null);
  
  // Create a ref for each verse to enable scrolling
  const verseRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Parse the hash to get the initial verse if provided
  const getInitialVerseFromHash = (): number => {
    if (location.hash.startsWith('#verse-')) {
      const verseNumber = parseInt(location.hash.replace('#verse-', ''), 10);
      return verseNumber > 0 ? verseNumber - 1 : 0; // Convert to 0-based index
    }
    return 0;
  };
  
  // Initialize QuranReader with default translation
  const {
    verses,
    currentVerse,
    isPlaying,
    isLoading,
    error: quranError,
    volume,
    repeatMode,
    reader,
    surahInfo,
    currentTranslation,
    playVerse,
    togglePlayPause,
    setVolume,
    setRepeatMode,
    saveProgress,
    toggleBookmark,
    isBookmarked,
    changeReciter,
    changeTranslation,
    audioRef,
    handleAudioEnd
  } = QuranReader({ 
    surahNumber: surahId,
    mode: 'surah',
    initialVerse: getInitialVerseFromHash(),
    translationEdition: selectedLanguage?.identifier || 'en.asad'
  });
  
  // Add a state for share feedback
  const [shareStatus, setShareStatus] = useState<{verseId: number, status: string} | null>(null);

  // Add new states for download functionality
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [availableReciters, setAvailableReciters] = useState<ReciterInfo[]>([]);
  const [recitersLoading, setRecitersLoading] = useState<boolean>(false);

  // Add a state for surah sharing feedback
  const [surahShareStatus, setSurahShareStatus] = useState<string | null>(null);

  // Load available translations when component mounts
  useEffect(() => {
    const loadTranslations = async () => {
      setTranslationsLoading(true);
      try {
        const translations = await getAvailableTranslations();
        setAvailableTranslations(translations);
        
        // Set default translation (English - Asad)
        const defaultTranslation = translations.find(t => t.identifier === 'en.asad');
        if (defaultTranslation) {
          setSelectedLanguage(defaultTranslation);
        } else if (translations.length > 0) {
          // Fallback to first available translation
          setSelectedLanguage(translations[0]);
        }
      } catch (err) {
        setTranslationsError('Failed to load available translations');
        console.error('Error loading translations:', err);
      } finally {
        setTranslationsLoading(false);
      }
    };

    loadTranslations();
  }, []);

  // Load available reciters for download
  useEffect(() => {
    const loadReciters = async () => {
      setRecitersLoading(true);
      try {
        const reciters = await getAvailableReciters();
        setAvailableReciters(reciters);
      } catch (error) {
        console.error('Error loading reciters:', error);
      } finally {
        setRecitersLoading(false);
      }
    };
    
    loadReciters();
  }, []);

  // Reset verse refs array when verses change
  useEffect(() => {
    verseRefs.current = verseRefs.current.slice(0, verses.length);
  }, [verses]);
  
  // Scroll to current verse when it changes
  useEffect(() => {
    if (currentVerse !== undefined && verseRefs.current[currentVerse]) {
      scrollToVerse(currentVerse);
    }
  }, [currentVerse]);

  // Apply translation changes
  useEffect(() => {
    if (selectedLanguage) {
      changeTranslation(selectedLanguage.identifier);
    }
  }, [selectedLanguage]);

  // Handle URL hash changes for direct verse navigation
  useEffect(() => {
    if (location.hash.startsWith('#verse-') && verses.length > 0) {
      const verseNumber = parseInt(location.hash.replace('#verse-', ''), 10);
      if (!isNaN(verseNumber) && verseNumber > 0) {
        // Find the verse index (0-based) from the verse number (1-based)
        const verseIndex = verses.findIndex(v => v.numberInSurah === verseNumber);
        if (verseIndex !== -1) {
          // Scroll to the verse after a short delay to ensure rendering is complete
          setTimeout(() => {
            scrollToVerse(verseIndex);
            playVerse(verseIndex);
          }, 500);
        }
      }
    }
  }, [location.hash, verses]);

  const scrollToVerse = (index: number) => {
    if (verseRefs.current[index]) {
      // Scroll with a slight offset from the top
      verseRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  useEffect(() => {
    // Find the selected reciter in our list
    const reciter = reciters.find(r => r.id === reader);
    if (reciter) {
      setSelectedReciter(reciter);
    }
  }, [reader]);

  const adjustFontSize = (increment: number) => {
    setFontSize(prev => Math.min(Math.max(prev + increment, 20), 40));
  };

  const handleReciterChange = (reciter: Reciter) => {
    setSelectedReciter(reciter);
    changeReciter(reciter.id);
    setShowReciterDropdown(false);
  };

  const handleTranslationChange = (translation: EditionInfo) => {
    setSelectedLanguage(translation);
    setShowLanguageDropdown(false);
  };

  const handleFindVerse = () => {
    setVerseError(null);
    
    // Validate input
    const verseNum = parseInt(verseToFind, 10);
    
    if (isNaN(verseNum)) {
      setVerseError('Please enter a valid number');
      return;
    }
    
    if (!surahInfo) {
      setVerseError('Surah information not available');
      return;
    }
    
    if (verseNum < 1 || verseNum > surahInfo.numberOfAyahs) {
      setVerseError(`Please enter a number between 1 and ${surahInfo.numberOfAyahs}`);
      return;
    }
    
    // Find the verse index (0-based) from the verse number (1-based)
    const verseIndex = verses.findIndex(v => v.numberInSurah === verseNum);
    
    if (verseIndex === -1) {
      setVerseError('Verse not found');
      return;
    }
    
    // Update URL hash for direct linking
    navigate(`#verse-${verseNum}`, { replace: true });
    
    // Scroll to the verse
    scrollToVerse(verseIndex);
    
    // Optionally play the verse
    playVerse(verseIndex);
  };

  // Handle sharing a verse via WhatsApp
  const handleShareVerse = (verse: any, index: number) => {
    if (!surahInfo) return;
    
    const success = shareQuranVerseViaWhatsApp(
      surahInfo.name,
      surahInfo.englishName,
      verse.numberInSurah,
      verse.text,
      verse.translation || 'Translation not available'
    );
    
    if (success) {
      setShareStatus({ verseId: index, status: 'shared' });
      // Clear the status after a delay
      setTimeout(() => {
        setShareStatus(null);
      }, 2000);
    } else {
      setShareStatus({ verseId: index, status: 'failed' });
      // Clear the error status after a delay
      setTimeout(() => {
        setShareStatus(null);
      }, 2000);
    }
  };

  const handleDownloadClick = () => {
    setShowDownloadModal(true);
  };

  // Handle bookmark with feedback
  const handleBookmark = (verseKey: string) => {
    const isNowBookmarked = toggleBookmark(verseKey);
    
    // Show feedback
    setBookmarkFeedback(isNowBookmarked ? 'Bookmark added' : 'Bookmark removed');
    
    // Clear feedback after 2 seconds
    setTimeout(() => {
      setBookmarkFeedback(null);
    }, 2000);
    
    // Also save reading progress
    saveProgress();
  };

  // Handle save progress with feedback
  const handleSaveProgress = () => {
    const saved = saveProgress();
    if (saved) {
      setBookmarkFeedback('Reading position saved');
      setTimeout(() => {
        setBookmarkFeedback(null);
      }, 2000);
    }
  };

  // Handle sharing the surah URL via WhatsApp
  const handleShareSurah = () => {
    if (!surahInfo) return;
    
    // Get the current URL
    const surahUrl = window.location.href;
    
    try {
      // Create WhatsApp share URL
      const whatsappUrl = `https://api.whatsapp.com/send?text=Read Surah ${surahInfo.englishName} (${surahInfo.name}) online: ${encodeURIComponent(surahUrl)}`;
      
      // Open in a new window
      window.open(whatsappUrl, '_blank');
      
      // Show feedback
      setSurahShareStatus('shared');
      setTimeout(() => {
        setSurahShareStatus(null);
      }, 2000);
    } catch (error) {
      console.error('Error sharing via WhatsApp:', error);
      setSurahShareStatus('failed');
      setTimeout(() => {
        setSurahShareStatus(null);
      }, 2000);
    }
  };

  const totalVerses = verses.length;

  // Helper function to check if verse starts with Bismillah
  const startsWithBismillah = (verseText: string) => {
    return verseText.startsWith('بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ');
  };

  // Check if the first verse already contains Bismillah
  const firstVerseHasBismillah = verses.length > 0 && startsWithBismillah(verses[0]?.text || '');

  // Convert numbers to Arabic numerals
  const toArabicNumbers = (num: number): string => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
  };

  // Extract Bismillah from first verse if it exists
  const extractBismillah = (verseText: string): string => {
    if (startsWithBismillah(verseText)) {
      return verseText.replace(/^(بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ)(.*)$/, '$2');
    }
    return verseText;
  };

  // Add this new function after your existing handler functions
  const handleVersePlayPause = (index: number) => {
    if (currentVerse === index && isPlaying) {
      // If this verse is currently playing, pause it
      togglePlayPause();
    } else {
      // Otherwise, play this verse
      playVerse(index);
    }
  };

  return (
    <div 
      className="min-h-screen flex flex-col relative overflow-hidden bg-emerald-900/95" 
      style={{ 
        backgroundImage: `linear-gradient(to left, rgba(20, 24, 23, 0.001), rgba(10, 14, 13, 0.002)), url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Top Navigation Bar - Updated with bg-top.jpeg background and green gradient */}
      <nav 
        className="sticky top-0 backdrop-blur-md border-b border-yellow-400/20 z-50"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(16, 185, 129, 0.7), rgba(16, 185, 129, 0.4), rgba(16, 185, 129, 0.5)), url(${bgTopImage})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          boxShadow: "inset 0 0 0 2000px rgba(0, 0, 0, 0.4)" // Slightly lighter dark overlay
        }}
      >
        <div className="container mx-auto px-4 py-3">
          {/* Back button and app logo */}
          <div className="flex items-center justify-between mb-2">
            <button 
              onClick={() => navigate('/quran')} 
              className="text-yellow-400 flex items-center gap-2 hover:text-yellow-500 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
              <span className="text-lg">Back</span>
            </button>
            
            <div className="w-12 h-12">
              <div className="w-full h-full rounded-full bg-yellow-400/90 flex items-center justify-center">
                <Moon className="text-emerald-900 w-8 h-8" />
              </div>
            </div>
          </div>
          
          {/* Surah information with navigation arrows repositioned */}
          {surahInfo && (
            <>
              <h1 className="text-xl font-bold text-yellow-400 text-center">{surahInfo.englishName}</h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-300 mt-1">
                <span className="text-white font-arabic text-lg">{surahInfo.name}</span>
                <span className="hidden sm:block w-1 h-1 rounded-full bg-gray-300"></span>
                <span>{surahInfo.numberOfAyahs} Verses</span>
              </div>
              
              {/* Row with verse filter and navigation arrows */}
              <div className="flex items-center justify-between mt-3">
                <button 
                  className="text-yellow-400 hover:text-yellow-500 transition-colors p-2"
                  onClick={() => navigate(`/quran/surah/${Math.max(1, surahId - 1)}`)}
                  disabled={surahId <= 1}
                  aria-label="Previous Surah"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1 text-yellow-400 font-medium">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      value={verseToFind}
                      onChange={(e) => setVerseToFind(e.target.value)}
                      placeholder={`${currentVerse !== undefined && verses[currentVerse]?.numberInSurah || 1}`}
                      className="w-10 h-6 bg-emerald-800/50 border border-yellow-400/30 rounded text-center text-yellow-400 focus:outline-none focus:border-yellow-400"
                      aria-label="Find verse"
                    />
                    <button 
                      onClick={handleFindVerse}
                      className="ml-1 text-yellow-400 hover:text-yellow-500"
                      aria-label="Go to verse"
                    >
                      <Search className="w-4 h-4" />
                    </button>
                  </div>
                  <span>/</span>
                  <span>{totalVerses}</span>
                </div>
                
                <button 
                  className="text-yellow-400 hover:text-yellow-500 transition-colors p-2"
                  onClick={() => navigate(`/quran/surah/${Math.min(114, surahId + 1)}`)}
                  disabled={surahId >= 114}
                  aria-label="Next Surah"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              
              {verseError && (
                <div className="text-red-400 text-xs mt-1 text-center">{verseError}</div>
              )}
            </>
          )}
        </div>
      </nav>

      {/* Controls Bar */}
      <div className="sticky top-[109px] bg-emerald-800/50 backdrop-blur-sm border-b border-yellow-400/20 z-40">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Audio Controls with Reciter Selection */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  className="flex items-center gap-2 text-yellow-400 hover:text-yellow-500 transition-colors bg-emerald-800/30 px-4 py-2 rounded-full"
                  onClick={() => setShowReciterDropdown(!showReciterDropdown)}
                >
                  <Mic2 className="w-5 h-5" />
                  <span className="hidden md:inline">{selectedReciter.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showReciterDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-emerald-800/95 backdrop-blur-sm border border-yellow-400/20 rounded-lg shadow-lg z-50">
                    {reciters.map(reciter => (
                      <button
                        key={reciter.id}
                        className={`w-full text-left px-4 py-3 hover:bg-emerald-700/30 ${
                          selectedReciter.id === reciter.id ? 'text-yellow-400' : 'text-white hover:text-yellow-400'
                        } transition-colors`}
                        onClick={() => handleReciterChange(reciter)}
                      >
                        <div>{reciter.name}</div>
                        <div className="text-sm text-gray-400 font-arabic">{reciter.arabicName}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button 
                className="text-yellow-400 hover:text-yellow-500 transition-colors"
                onClick={togglePlayPause}
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              
              <button 
                className={`text-yellow-400 hover:text-yellow-500 transition-colors ${
                  repeatMode === 'page' ? 'bg-yellow-400/20 rounded-full p-1' : ''
                }`}
                onClick={() => setRepeatMode(mode => mode === 'page' ? 'none' : 'page')}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button 
                className={`text-yellow-400 hover:text-yellow-500 transition-colors ${
                  repeatMode === 'verse' ? 'bg-yellow-400/20 rounded-full p-1' : ''
                }`}
                onClick={() => setRepeatMode(mode => mode === 'verse' ? 'none' : 'verse')}
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            </div>

            {/* Translation Language Selection */}
            <div className="relative">
              <button 
                className="flex items-center gap-2 text-yellow-400 hover:text-yellow-500 transition-colors bg-emerald-800/30 px-4 py-2 rounded-full"
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              >
                <Globe className="w-5 h-5" />
                <span className="hidden md:inline">
                  {translationsLoading 
                    ? 'Loading...' 
                    : selectedLanguage 
                      ? selectedLanguage.englishName 
                      : 'Select translation'}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-emerald-800/95 backdrop-blur-sm border border-yellow-400/20 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                  {translationsLoading ? (
                    <div className="px-4 py-3 text-white">Loading translations...</div>
                  ) : translationsError ? (
                    <div className="px-4 py-3 text-red-400">{translationsError}</div>
                  ) : (
                    availableTranslations.map(translation => (
                      <button
                        key={translation.identifier}
                        className={`w-full text-left px-4 py-3 hover:bg-emerald-700/30 ${
                          selectedLanguage?.identifier === translation.identifier 
                            ? 'text-yellow-400' 
                            : 'text-white hover:text-yellow-400'
                        } transition-colors`}
                        onClick={() => handleTranslationChange(translation)}
                      >
                        <div>{translation.englishName}</div>
                        <div className="text-sm text-gray-400">
                          {translation.name} ({translation.language})
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Font Size Controls */}
            <div className="flex items-center gap-4">
              <button 
                onClick={() => adjustFontSize(-2)}
                className="text-yellow-400 hover:text-yellow-500 transition-colors"
              >
                <MinusCircle className="w-5 h-5" />
              </button>
              <button 
                onClick={() => adjustFontSize(2)}
                className="text-yellow-400 hover:text-yellow-500 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Additional Controls */}
            <div className="flex items-center gap-4">
              <button 
                className="text-yellow-400 hover:text-yellow-500 transition-colors relative"
                onClick={handleSaveProgress}
              >
                <BookmarkPlus className="w-5 h-5" />
              </button>
              <button 
                className={`text-yellow-400 hover:text-yellow-500 transition-colors relative ${
                  surahShareStatus ? 'bg-yellow-400/20 rounded-full p-1' : ''
                }`}
                onClick={handleShareSurah}
              >
                <Share2 className="w-5 h-5" />
                {surahShareStatus && (
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {surahShareStatus === 'shared' ? 'Opening WhatsApp...' : 'Failed to share'}
                  </span>
                )}
              </button>
              <button 
                className={`flex items-center gap-1 px-3 py-1 rounded-full transition-colors ${
                  showTranslation ? 'bg-yellow-400 text-emerald-900' : 'text-yellow-400 border border-yellow-400'
                }`}
                onClick={() => setShowTranslation(!showTranslation)}
              >
                <Book className="w-4 h-4" />
                <span className="text-sm">Translation</span>
              </button>
              <button 
                className="flex items-center gap-1 px-3 py-1 rounded-full transition-colors text-yellow-400 border border-yellow-400 hover:bg-yellow-400 hover:text-emerald-900"
                onClick={handleDownloadClick}
                disabled={recitersLoading}
              >
                <Download className="w-4 h-4" />
                <span className="text-sm">
                  {recitersLoading ? 'Loading...' : 'Download'}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bookmark/Save Feedback Toast */}
      {bookmarkFeedback && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-emerald-900 px-4 py-2 rounded-full z-50 animate-fadeIn">
          {bookmarkFeedback}
        </div>
      )}

      {/* Verses Content - Scrollable Area */}
      <div className="flex-grow overflow-y-auto" style={{ height: "calc(100vh - 109px - 62px)" }}>
        <div className="container mx-auto px-4 py-8">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
            </div>
          ) : quranError ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Error Loading Quran</h3>
              <p className="text-gray-300 max-w-md">{quranError}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-6 bg-yellow-400 text-emerald-900 px-6 py-3 rounded-full hover:bg-yellow-500 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-12 pb-20">
              {/* Bismillah - Show for all surahs except:
                  1. Surah 9 (At-Tawbah) which doesn't have Bismillah
                  2. Surahs where the first verse already includes Bismillah */}
              {surahInfo && surahInfo.number !== 9 && !firstVerseHasBismillah && (
                <div className="text-center mb-10">
                  <p 
                    className="font-arabic text-yellow-400 leading-loose"
                    style={{ fontSize: `${fontSize + 4}px` }}
                  >
                    بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
                  </p>
                  {showTranslation && (
                    <p className="text-white text-lg mt-3">
                      In the name of Allah, the Most Gracious, the Most Merciful
                    </p>
                  )}
                </div>
              )}
              
              {/* Concatenated View (when translation is disabled) */}
              {!showTranslation && (
                <div className="bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 rounded-2xl p-6">
                  <div className="text-right font-arabic leading-loose text-white" style={{ fontSize: `${fontSize}px` }}>
                    {verses.map((verse, index) => {
                      // Process verse text - remove Bismillah from first verse if needed
                      const verseText = index === 0 && firstVerseHasBismillah 
                        ? extractBismillah(verse.text) 
                        : verse.text;
                      
                      return (
                        <span 
                          key={verse.number}
                          ref={el => verseRefs.current[index] = el}
                          id={`verse-${verse.numberInSurah}`}
                          className={`relative inline ${currentVerse === index ? 'text-yellow-400' : ''}`}
                          onClick={() => handleVersePlayPause(index)} // Updated to handle play/pause toggle
                        >
                          {verseText}
                          <span className="inline-block mx-1 text-yellow-400 select-none">
                            ﴾{toArabicNumbers(verse.numberInSurah)}﴿
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              
              {/* Individual Verses View (when translation is enabled) */}
              {showTranslation && verses.map((verse, index) => {
                // Special handling for first verse that contains Bismillah (like in Al-Fatihah)
                const verseContainsBismillah = index === 0 && startsWithBismillah(verse.text);
                // Process verse text for display if it contains Bismillah
                const displayText = verseContainsBismillah ? extractBismillah(verse.text) : verse.text;
                
                return (
                  <div 
                    key={verse.number}
                    ref={el => verseRefs.current[index] = el}
                    id={`verse-${verse.numberInSurah}`}
                    className={`rounded-2xl p-6 transition-all duration-300 bg-emerald-800/30 backdrop-blur-sm border border-emerald-700/30 hover:border-yellow-400/30 ${
                      currentVerse === index ? 'border-yellow-400 border-2' : ''
                    } ${verseContainsBismillah ? 'text-center' : ''}`}
                  >
                    {/* Verse Number and Controls */}
                    <div className="flex justify-between items-center mb-6">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-yellow-400 font-arabic
                        ${currentVerse === index ? 'bg-yellow-400/30' : 'bg-emerald-800/50'}`}>
                        {verse.numberInSurah}
                      </div>
                      <div className="flex gap-2">
                        <button 
                          className={`${currentVerse === index && isPlaying ? 'text-yellow-400 bg-yellow-400/20 rounded-full p-1' : 'text-yellow-400 hover:text-yellow-500'} transition-colors`}
                          onClick={() => handleVersePlayPause(index)} // Updated to handle play/pause toggle
                        >
                          {currentVerse === index && isPlaying ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Volume2 className="w-5 h-5" />
                          )}
                        </button>
                        <button 
                          className={`text-yellow-400 hover:text-yellow-500 transition-colors ${
                            isBookmarked(`${verse.surah.number}:${verse.numberInSurah}`) ? 'text-yellow-500' : ''
                          }`}
                          onClick={() => handleBookmark(`${verse.surah.number}:${verse.numberInSurah}`)}
                        >
                          <BookmarkPlus className="w-5 h-5" />
                        </button>
                        <button 
                          className={`text-yellow-400 hover:text-yellow-500 transition-colors relative ${
                            shareStatus?.verseId === index ? 'bg-yellow-400/20 rounded-full p-1' : ''
                          }`}
                          onClick={() => handleShareVerse(verse, index)}
                          title="Share via WhatsApp"
                        >
                          <Share2 className="w-5 h-5" />
                          {shareStatus?.verseId === index && (
                            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-emerald-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                              {shareStatus.status === 'shared' ? 'Opening WhatsApp...' : 'Failed to share'}
                            </span>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Arabic Text */}
                    <p 
                      className={`${verseContainsBismillah ? 'text-center' : 'text-right'} font-arabic leading-loose mb-6 ${
                        currentVerse === index ? 'text-yellow-400' : 'text-white'
                      }`}
                      style={{ fontSize: `${fontSize}px` }}
                    >
                      {displayText}
                    </p>

                    {/* Translation */}
                    <p className={`text-white text-lg ${verseContainsBismillah ? 'text-center' : ''}`}>
                      {verse.translation || 'Translation not available'}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Download Modal */}
      {surahInfo && (
        <SurahDownloadModal 
          isOpen={showDownloadModal}
          onClose={() => setShowDownloadModal(false)}
          surahId={surahInfo.number}
          surahName={surahInfo.englishName}
          reciters={availableReciters}
        />
      )}

      <audio
        ref={audioRef}
        onEnded={handleAudioEnd}
        onPlay={() => {}}
        onPause={() => {}}
      />
    </div>
  );
}

export default SurahPage;