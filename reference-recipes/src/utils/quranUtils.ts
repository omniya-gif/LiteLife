/**
 * Utilities for Quran-related functionality
 */

export interface ReciterInfo {
  identifier: string;
  language: string;
  name: string;
  englishName: string;
  format: string;
  type: string;
  bitrate: string;
}

/**
 * Gets the list of available surah audio reciters
 */
export const getAvailableReciters = async (): Promise<ReciterInfo[]> => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/islamic-network/cdn/master/info/cdn_surah_audio.json');
    
    if (!response.ok) {
      throw new Error('Failed to fetch reciters');
    }
    
    const reciters: ReciterInfo[] = await response.json();
    return reciters;
  } catch (error) {
    console.error('Error fetching reciters:', error);
    return [
      // Fallback list of common reciters if fetch fails
      {
        identifier: "ar.alafasy",
        language: "ar",
        name: "مشاري راشد العفاسي",
        englishName: "Mishary Rashid Alafasy",
        format: "audio",
        type: "surahbysurah",
        bitrate: "128"
      },
      {
        identifier: "ar.abdulbasitmurattal",
        language: "ar",
        name: "عبد الباسط عبد الصمد",
        englishName: "AbdulBaset AbdulSamad [Murattal]",
        format: "audio",
        type: "surahbysurah",
        bitrate: "128"
      },
      {
        identifier: "ar.abdulsamad",
        language: "ar",
        name: "عبدالباسط عبدالصمد",
        englishName: "Abdul Samad",
        format: "audio",
        type: "surahbysurah",
        bitrate: "128"
      },
      {
        identifier: "ar.minshawi",
        language: "ar",
        name: "محمد صديق المنشاوي",
        englishName: "Mohamed Siddiq El-Minshawi",
        format: "audio",
        type: "surahbysurah",
        bitrate: "128"
      },
      {
        identifier: "ar.hudhaify",
        language: "ar",
        name: "علي بن عبدالرحمن الحذيفي",
        englishName: "Ali Al-Hudhaify",
        format: "audio",
        type: "surahbysurah",
        bitrate: "128"
      }
    ];
  }
};
