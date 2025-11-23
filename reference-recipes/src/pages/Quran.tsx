import React, { useState, useEffect } from 'react';
import { Moon, ArrowLeft, Search, PlayCircle, BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getAllSurahs } from '../services/quranService';
import Cookies from 'js-cookie';
// Import the image properly
import backgroundImage from '../assets/images/background.jpeg';

interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

function Quran() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [savedSurah, setSavedSurah] = useState<string | undefined>();
  const [savedVerse, setSavedVerse] = useState<string | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    loadSurahs();
    checkSavedProgress();
  }, []);

  const loadSurahs = async () => {
    setLoading(true);
    try {
      const data = await getAllSurahs();
      setSurahs(data);
    } catch (error) {
      console.error('Error loading surahs:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkSavedProgress = () => {
    const surah = Cookies.get('quranSurah');
    const verse = Cookies.get('quranVerse');
    setSavedSurah(surah);
    setSavedVerse(verse);
  };
  
  // Convert numbers to Arabic numerals
  const toArabicNumbers = (num: number): string => {
    const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
    return num.toString().split('').map(digit => arabicNumbers[parseInt(digit)]).join('');
  };

  const handleSurahClick = (surahNumber: number) => {
    navigate(`/quran/surah/${surahNumber}`);
  };

  const continuePreviousReading = () => {
    if (savedSurah) {
      navigate(`/quran/surah/${savedSurah}${savedVerse ? `#verse-${savedVerse}` : ''}`);
    }
  };

  // Get the name of the saved surah
  const getSavedSurahName = (): string => {
    if (!savedSurah) return '';
    
    const surahNumber = parseInt(savedSurah, 10);
    const surah = surahs.find(s => s.number === surahNumber);
    return surah ? surah.englishName : `Surah ${savedSurah}`;
  };

  const filteredSurahs = surahs.filter(surah =>
    surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    surah.name.includes(searchQuery)
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-cover bg-center bg-fixed bg-no-repeat bg-emerald-900/95" 
         style={{ 
           backgroundImage: `linear-gradient(to left, rgba(20, 24, 23, 0.001), rgba(10, 14, 13, 0.002)), url(${backgroundImage})`,
           backgroundSize: "cover",
           backgroundPosition: "center",
           backgroundAttachment: "fixed"
         }}>
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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-yellow-400 mb-4 font-arabic">
            القرآن الكريم
          </h1>
          
          {savedSurah && (
            <button
              onClick={continuePreviousReading}
              className="mb-8 bg-yellow-400/20 text-yellow-400 px-6 py-3 rounded-full hover:bg-yellow-400/30 transition-colors"
            >
              Continue Reading from {getSavedSurahName()} {savedVerse ? `(Verse ${savedVerse})` : ''}
            </button>
          )}

          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by surah name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-emerald-800/30 text-white placeholder-gray-400 px-6 py-4 rounded-full border border-emerald-700/30 focus:border-yellow-400/50 focus:outline-none"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredSurahs.map((surah) => (
              <div 
                key={surah.number}
                className="bg-emerald-800/30 rounded-2xl p-6 backdrop-blur-sm border border-emerald-700/30 hover:border-yellow-400/30 transition-all duration-300 group cursor-pointer"
                onClick={() => handleSurahClick(surah.number)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-emerald-800/50 rounded-full flex items-center justify-center text-yellow-400 font-arabic">
                    {toArabicNumbers(surah.number)}
                  </div>
                  <span className="text-sm text-yellow-400 font-arabic">
                    {surah.revelationType === 'Meccan' ? 'مكية' : 'مدنية'}
                  </span>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-1 font-arabic text-right">
                  {surah.name}
                </h3>
                <p className="text-yellow-400 text-sm mb-4">{surah.englishName}</p>
                
                <div className="flex justify-between items-center">
                  <div className="text-white text-sm font-arabic">
                    عدد الآيات: {toArabicNumbers(surah.numberOfAyahs)}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-yellow-400 hover:text-yellow-500 transition-colors">
                      <PlayCircle className="w-6 h-6" />
                    </button>
                    <button className="text-yellow-400 hover:text-yellow-500 transition-colors">
                      <BookOpen className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Quran;