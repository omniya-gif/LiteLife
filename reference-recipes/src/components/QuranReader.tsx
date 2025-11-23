import { useState, useEffect, useRef } from 'react';
import { getSurah, QuranVerse } from '../services/quranService';
import Cookies from 'js-cookie';

interface QuranReaderProps {
  surahNumber: number;
  mode: 'surah' | 'page';
  initialVerse?: number;
  translationEdition?: string;
}

interface SurahInfo {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
}

const QuranReader = ({ 
  surahNumber, 
  mode, 
  initialVerse = 0,
  translationEdition = 'en.asad'  // Default to Muhammad Asad's translation
}: QuranReaderProps) => {
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [currentVerse, setCurrentVerse] = useState<number>(initialVerse);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(1);
  const [repeatMode, setRepeatMode] = useState<'none' | 'verse' | 'page'>('none');
  const [surahInfo, setSurahInfo] = useState<SurahInfo | null>(null);
  const [reader, setReader] = useState<string>('ar.alafasy');
  const [currentTranslation, setCurrentTranslation] = useState<string>(translationEdition);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const verseRepeatCountRef = useRef<number>(0);
  const maxVerseRepeat = 3;

  // Load verses for the current surah
  useEffect(() => {
    const loadVerses = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const data = await getSurah(surahNumber, reader, currentTranslation);
        setVerses(data);
        
        // Extract surah info from the first verse
        if (data.length > 0) {
          const firstVerse = data[0];
          setSurahInfo({
            number: firstVerse.surah.number,
            name: firstVerse.surah.name,
            englishName: firstVerse.surah.englishName,
            englishNameTranslation: '',  // This might not be available in the API response
            revelationType: firstVerse.surah.revelationType,
            numberOfAyahs: data.length
          });
          
          // Save current surah to cookies for "continue reading" functionality
          Cookies.set('quranSurah', String(firstVerse.surah.number), { expires: 30 });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Quran data');
        console.error('Error in QuranReader:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadVerses();
  }, [surahNumber, reader, currentTranslation]);

  // Handle changing reciter
  const changeReciter = (reciterId: string) => {
    // Stop current playback
    if (isPlaying) {
      togglePlayPause();
    }
    
    setReader(reciterId);
  };

  // Handle changing translation
  const changeTranslation = async (translationId: string) => {
    setCurrentTranslation(translationId);
  };

  // Play a specific verse
  const playVerse = (verseIndex: number) => {
    if (verseIndex < 0 || verseIndex >= verses.length) {
      return;
    }

    setCurrentVerse(verseIndex);
    
    // Save current verse position to cookies
    if (verses[verseIndex]?.numberInSurah) {
      Cookies.set('quranVerse', String(verses[verseIndex].numberInSurah), { expires: 30 });
    }
    
    if (audioRef.current && verses[verseIndex]?.audio) {
      audioRef.current.src = verses[verseIndex].audio || '';
      audioRef.current.volume = volume;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        verseRepeatCountRef.current = 0;
      }).catch(err => {
        console.error('Error playing audio:', err);
        setIsPlaying(false);
      });
    }
  };

  // Handle audio ending
  const handleAudioEnd = () => {
    // Implement repeat logic
    if (repeatMode === 'verse') {
      if (verseRepeatCountRef.current < maxVerseRepeat) {
        verseRepeatCountRef.current++;
        audioRef.current?.play().catch(console.error);
        return;
      }
      verseRepeatCountRef.current = 0;
    }
    
    // Play next verse or stop at the end
    if (currentVerse < verses.length - 1) {
      playVerse(currentVerse + 1);
    } else {
      // End of surah
      setIsPlaying(false);
      setCurrentVerse(0);
    }
  };

  // Toggle play/pause
  const togglePlayPause = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      playVerse(currentVerse);
    }
  };

  // Save reading progress
  const saveProgress = () => {
    if (surahInfo) {
      // Save current position to cookies
      Cookies.set('quranSurah', String(surahInfo.number), { expires: 30 });
      
      if (verses[currentVerse]?.numberInSurah) {
        Cookies.set('quranVerse', String(verses[currentVerse].numberInSurah), { expires: 30 });
      }
      
      // Show some feedback to user
      return true;
    }
    return false;
  };

  // Bookmark management
  const toggleBookmark = (verseKey: string) => {
    const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
    const bookmarkIndex = bookmarks.indexOf(verseKey);
    
    if (bookmarkIndex === -1) {
      bookmarks.push(verseKey);
    } else {
      bookmarks.splice(bookmarkIndex, 1);
    }
    
    localStorage.setItem('quranBookmarks', JSON.stringify(bookmarks));
    return bookmarks.includes(verseKey);
  };

  const isBookmarked = (verseKey: string) => {
    const bookmarks = JSON.parse(localStorage.getItem('quranBookmarks') || '[]');
    return bookmarks.includes(verseKey);
  };

  return {
    verses,
    currentVerse,
    isPlaying,
    isLoading,
    error,
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
  };
};

export default QuranReader;