import { useState, useEffect } from 'react';
import { searchExerciseVideos } from '../services/youtubeApi';

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
}

export const useExerciseVideos = (exerciseName: string | null) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exerciseName) return;

    const fetchVideos = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const results = await searchExerciseVideos(exerciseName);
        setVideos(results);
      } catch (err) {
        console.error('Error loading videos:', err);
        setError('Failed to load videos');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, [exerciseName]);

  return { videos, isLoading, error };
};
