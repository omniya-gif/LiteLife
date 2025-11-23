/**
 * Utility functions for sharing content across various platforms
 */

/**
 * Share content via WhatsApp
 * @param text The text content to share
 * @returns A boolean indicating whether the sharing was initiated
 */
export const shareViaWhatsApp = (text: string): boolean => {
  try {
    // Encode the text to make it URL-safe
    const encodedText = encodeURIComponent(text);
    
    // Construct the WhatsApp sharing URL
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodedText}`;
    
    // Open the URL in a new tab/window
    window.open(whatsappUrl, '_blank');
    return true;
  } catch (error) {
    console.error('Error sharing to WhatsApp:', error);
    return false;
  }
};

/**
 * Share Quran verse via WhatsApp
 * @param surahName The name of the surah
 * @param surahEnglishName The English name of the surah
 * @param verseNumber The verse number
 * @param arabicText The Arabic text of the verse
 * @param translationText The translation of the verse
 * @returns A boolean indicating whether the sharing was initiated
 */
export const shareQuranVerseViaWhatsApp = (
  surahName: string,
  surahEnglishName: string,
  verseNumber: number,
  arabicText: string,
  translationText: string
): boolean => {
  // Construct a nicely formatted message with promotional link
  const shareText = `
${arabicText}

${translationText}

${surahEnglishName} (${surahName}), Verse ${verseNumber}

Make your Ramadan more effective with reflectiveramadan.com

Shared via Ramadan Planner
`;

  return shareViaWhatsApp(shareText);
};
