import React, { useState } from 'react';
import { X, Download, Loader2 } from 'lucide-react';

interface Reciter {
  identifier: string;
  name: string;
  englishName: string;
  language: string;
  bitrate: string;
}

interface SurahDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahId: number;
  surahName: string;
  reciters: Reciter[];
}

const SurahDownloadModal: React.FC<SurahDownloadModalProps> = ({
  isOpen,
  onClose,
  surahId,
  surahName,
  reciters
}) => {
  const [selectedReciter, setSelectedReciter] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!selectedReciter) {
      setDownloadError('Please select a reciter first');
      return;
    }

    setDownloading(true);
    setDownloadError(null);

    try {
      // Find the selected reciter's details
      const reciter = reciters.find(r => r.identifier === selectedReciter);
      if (!reciter) throw new Error('Reciter not found');

      // Create the download URL based on the API format
      const url = `https://cdn.islamic.network/quran/audio-surah/${reciter.bitrate}/${reciter.identifier}/${surahId}.mp3`;
      
      // Create a temporary link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${surahName}-${reciter.englishName}.mp3`);
      link.setAttribute('target', '_blank');
      document.body.appendChild(link);
      link.click();
      link.remove();

      // Close the modal after a short delay to provide feedback
      setTimeout(() => {
        onClose();
        setDownloading(false);
      }, 1000);
    } catch (error) {
      console.error('Error downloading surah:', error);
      setDownloadError('Failed to download. Please try again.');
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-emerald-900/95 border border-yellow-400/30 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-emerald-800">
          <h3 className="text-xl font-bold text-yellow-400">Download Surah {surahName}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5">
          <p className="text-white mb-4">
            Select a reciter to download this surah:
          </p>
          
          <div className="max-h-60 overflow-y-auto mb-4 pr-2">
            {reciters.map(reciter => (
              <div 
                key={reciter.identifier}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedReciter === reciter.identifier 
                    ? 'bg-yellow-400/30 border border-yellow-400' 
                    : 'hover:bg-emerald-800/50'
                }`}
                onClick={() => setSelectedReciter(reciter.identifier)}
              >
                <div className="font-medium text-white">{reciter.englishName}</div>
                {reciter.language === 'ar' && (
                  <div className="text-sm text-gray-300 font-arabic">{reciter.name}</div>
                )}
              </div>
            ))}
          </div>
          
          {downloadError && (
            <div className="text-red-400 mb-4 text-sm p-2 bg-red-900/20 rounded">
              {downloadError}
            </div>
          )}
          
          <div className="flex items-center justify-end gap-3 mt-2">
            <button 
              onClick={onClose}
              className="px-4 py-2 text-white hover:text-yellow-400 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDownload}
              disabled={downloading || !selectedReciter}
              className={`flex items-center gap-2 px-6 py-2 rounded-full ${
                downloading || !selectedReciter
                  ? 'bg-emerald-800 text-gray-400 cursor-not-allowed'
                  : 'bg-yellow-400 text-emerald-900 hover:bg-yellow-300'
              } transition-colors`}
            >
              {downloading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Downloading...</span>
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SurahDownloadModal;
