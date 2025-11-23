import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as quranService from '../services/quranService';
import Cookies from 'js-cookie';

interface QuranState {
  // Data
  surahs: quranService.Surah[];
  currentSurah: quranService.Surah | null;
  verses: quranService.QuranVerse[];
  editions: quranService.Edition[];
  audioSources: Record<string, string>; // Cache for audio URLs
  searchResults: any[];
  
  // Reading state
  currentPage: number;
  currentVerse: number | null;
  currentAudio: HTMLAudioElement | null;
  
  // UI preferences
  fontSize: number;
  showTranslation: boolean;
  showTransliteration: boolean;
  selectedReciterId: string;
  selectedTranslationId: string;
  
  // Audio state
  isPlaying: boolean;
  
  // Loading states
  isLoadingSurahs: boolean;
  isLoadingVerses: boolean;
  isLoadingEditions: boolean;
  
  // Actions
  loadAllSurahs: () => Promise<void>;
  loadSurah: (surahNumber: number) => Promise<void>;
  loadEditions: (type?: 'translation' | 'tafsir' | 'quran' | 'versebyverse') => Promise<void>;
  searchQuran: (query: string) => Promise<void>;
  loadPage: (pageNumber: number) => Promise<void>;
  
  // Audio control
  playAudioForVerse: (verse: quranService.QuranVerse) => Promise<void>;
  stopAudio: () => void;
  
  // UI adjustments
  adjustFontSize: (increment: number) => void;
  toggleTranslation: () => void;
  toggleTransliteration: () => void;
  setReciter: (identifier: string) => void;
  setTranslation: (identifier: string) => void;
  
  // Navigation
  navigateToNextSurah: () => void;
  navigateToPreviousSurah: () => void;
  saveReadingProgress: (page: number, verse?: number) => void;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      // Initial state
      surahs: [],
      currentSurah: null,
      verses: [],
      editions: [],
      audioSources: {},
      searchResults: [],
      
      currentPage: parseInt(Cookies.get('quranPage') || '1'),
      currentVerse: null,
      currentAudio: null,
      
      fontSize: 28,
      showTranslation: true,
      showTransliteration: false,
      selectedReciterId: 'ar.alafasy',
      selectedTranslationId: 'en.asad',
      
      isPlaying: false,
      
      isLoadingSurahs: false,
      isLoadingVerses: false,
      isLoadingEditions: false,
      
      // Actions
      loadAllSurahs: async () => {
        set({ isLoadingSurahs: true });
        try {
          const surahs = await quranService.getAllSurahs();
          set({ surahs, isLoadingSurahs: false });
        } catch (error) {
          console.error('Error loading surahs:', error);
          set({ isLoadingSurahs: false });
        }
      },
      
      loadSurah: async (surahNumber: number) => {
        set({ isLoadingVerses: true });
        try {
          const verses = await quranService.getSurah(surahNumber);
          const currentSurah = verses.length > 0 
            ? verses[0].surah 
            : get().surahs.find(s => s.number === surahNumber) || null;
            
          set({ 
            verses, 
            currentSurah,
            isLoadingVerses: false,
            currentPage: verses.length > 0 ? verses[0].page : get().currentPage
          });
          
          // Save reading progress
          if (verses.length > 0) {
            get().saveReadingProgress(verses[0].page);
          }
        } catch (error) {
          console.error(`Error loading surah ${surahNumber}:`, error);
          set({ isLoadingVerses: false });
        }
      },
      
      loadEditions: async (type) => {
        set({ isLoadingEditions: true });
        try {
          const editions = await quranService.getEditions(type);
          set({ editions, isLoadingEditions: false });
        } catch (error) {
          console.error('Error loading editions:', error);
          set({ isLoadingEditions: false });
        }
      },
      
      searchQuran: async (query: string) => {
        try {
          const results = await quranService.searchQuran(query);
          set({ searchResults: results });
        } catch (error) {
          console.error(`Error searching for "${query}":`, error);
          set({ searchResults: [] });
        }
      },
      
      loadPage: async (pageNumber: number) => {
        set({ isLoadingVerses: true });
        try {
          const page = await quranService.getPage(pageNumber);
          set({ 
            verses: page.ayahs,
            currentPage: pageNumber,
            isLoadingVerses: false
          });
          get().saveReadingProgress(pageNumber);
        } catch (error) {
          console.error(`Error loading page ${pageNumber}:`, error);
          set({ isLoadingVerses: false });
        }
      },
      
      playAudioForVerse: async (verse: quranService.QuranVerse) => {
        const { currentAudio, stopAudio, audioSources } = get();
        
        // Stop current audio if any
        if (currentAudio) {
          stopAudio();
        }
        
        try {
          // Generate a cache key
          const cacheKey = `${verse.surah.number}:${verse.numberInSurah}:${get().selectedReciterId}`;
          
          // Check if we have the audio URL cached
          let audioUrl = audioSources[cacheKey];
          
          if (!audioUrl) {
            audioUrl = await quranService.getAudioAyah(
              verse.surah.number,
              verse.numberInSurah,
              get().selectedReciterId
            );
            
            // Cache the audio URL
            set(state => ({
              audioSources: {
                ...state.audioSources,
                [cacheKey]: audioUrl
              }
            }));
          }
          
          const audio = new Audio(audioUrl);
          
          audio.addEventListener('ended', () => {
            set({ isPlaying: false, currentVerse: null });
          });
          
          set({ 
            currentAudio: audio, 
            isPlaying: true,
            currentVerse: verse.numberInSurah
          });
          
          await audio.play();
        } catch (error) {
          console.error('Error playing audio:', error);
          set({ isPlaying: false });
        }
      },
      
      stopAudio: () => {
        const { currentAudio } = get();
        if (currentAudio) {
          currentAudio.pause();
          currentAudio.currentTime = 0;
        }
        set({ isPlaying: false, currentVerse: null, currentAudio: null });
      },
      
      adjustFontSize: (increment: number) => {
        set(state => ({ 
          fontSize: Math.min(Math.max(state.fontSize + increment, 20), 40)
        }));
      },
      
      toggleTranslation: () => {
        set(state => ({ showTranslation: !state.showTranslation }));
      },
      
      toggleTransliteration: () => {
        set(state => ({ showTransliteration: !state.showTransliteration }));
      },
      
      setReciter: (identifier: string) => {
        set({ selectedReciterId: identifier });
      },
      
      setTranslation: (identifier: string) => {
        set({ selectedTranslationId: identifier });
      },
      
      navigateToNextSurah: () => {
        const { currentSurah } = get();
        if (currentSurah && currentSurah.number < 114) {
          get().loadSurah(currentSurah.number + 1);
        }
      },
      
      navigateToPreviousSurah: () => {
        const { currentSurah } = get();
        if (currentSurah && currentSurah.number > 1) {
          get().loadSurah(currentSurah.number - 1);
        }
      },
      
      saveReadingProgress: (page: number, verse?: number) => {
        Cookies.set('quranPage', page.toString(), { expires: 365 });
        if (verse) {
          Cookies.set('quranVerse', verse.toString(), { expires: 365 });
        }
      }
    }),
    {
      name: 'quran-store',
      partialize: (state) => ({
        fontSize: state.fontSize,
        showTranslation: state.showTranslation,
        showTransliteration: state.showTransliteration,
        selectedReciterId: state.selectedReciterId,
        selectedTranslationId: state.selectedTranslationId
      })
    }
  )
);
