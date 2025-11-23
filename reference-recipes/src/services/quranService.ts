import axios from 'axios';

// Base API URL
const API_URL = 'https://api.alquran.cloud/v1';

export interface QuranVerse {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
  translation?: string;
  surah: {
    number: number;
    name: string;
    englishName: string;
    revelationType: string;
  };
}

export interface QuranPage {
  number: number;
  ayahs: QuranVerse[];
}

export interface SurahResponse {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  revelationType: string;
  numberOfAyahs: number;
  ayahs: QuranVerse[];
}

export interface EditionInfo {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  direction: string;
}

export const getPage = async (pageNumber: number, reciter: string = 'ar.alafasy'): Promise<QuranPage> => {
  try {
    const response = await axios.get(`${API_URL}/page/${pageNumber}/${reciter}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching Quran page:', error);
    throw new Error(`Failed to fetch Quran page ${pageNumber}: ${getErrorMessage(error)}`);
  }
};

export const getSurah = async (
  surahNumber: number, 
  reciter: string = 'ar.alafasy',
  translationEdition?: string
): Promise<QuranVerse[]> => {
  try {
    // First get the Arabic text with recitation
    const arabicResponse = await axios.get(`${API_URL}/surah/${surahNumber}/${reciter}`);
    
    if (!arabicResponse.data?.data?.ayahs) {
      throw new Error('Invalid response format from Quran API');
    }

    const surahData = arabicResponse.data.data;
    let verses: QuranVerse[] = surahData.ayahs.map((ayah: any) => ({
      ...ayah,
      audio: ayah.audio,
      surah: {
        number: surahData.number,
        name: surahData.name,
        englishName: surahData.englishName,
        revelationType: surahData.revelationType
      }
    }));

    // If translation is requested, fetch it and merge with Arabic text
    if (translationEdition) {
      try {
        const translationResponse = await axios.get(`${API_URL}/surah/${surahNumber}/${translationEdition}`);
        
        if (translationResponse.data?.data?.ayahs) {
          const translationAyahs = translationResponse.data.data.ayahs;
          
          // Merge translation with Arabic verses
          verses = verses.map((verse, index) => {
            if (index < translationAyahs.length) {
              return {
                ...verse,
                translation: translationAyahs[index].text
              };
            }
            return verse;
          });
        }
      } catch (translationError) {
        console.error('Error fetching translation:', translationError);
        // Continue with Arabic only if translation fails
      }
    }
    
    return verses;
  } catch (error) {
    console.error('Error fetching surah:', error);
    throw new Error(`Failed to fetch Surah ${surahNumber}: ${getErrorMessage(error)}`);
  }
};

export const getAllSurahs = async (): Promise<any[]> => {
  try {
    const response = await axios.get(`${API_URL}/surah`);
    if (!response.data?.data) {
      throw new Error('Invalid response format from Quran API');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching surahs:', error);
    throw new Error(`Failed to fetch Surahs list: ${getErrorMessage(error)}`);
  }
};

export const getAvailableTranslations = async (): Promise<EditionInfo[]> => {
  try {
    const response = await axios.get(`${API_URL}/edition?format=text&type=translation`);
    if (!response.data?.data) {
      throw new Error('Invalid response format from Quran API');
    }
    return response.data.data;
  } catch (error) {
    console.error('Error fetching translations:', error);
    throw new Error(`Failed to fetch available translations: ${getErrorMessage(error)}`);
  }
};

// Helper function to extract readable error messages
const getErrorMessage = (error: any): string => {
  if (axios.isAxiosError(error)) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      return `Server error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      // The request was made but no response was received
      return 'Network error: No response received from the server';
    }
  }
  return error.message || 'Unknown error occurred';
};