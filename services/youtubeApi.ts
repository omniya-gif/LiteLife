
const YOUTUBE_API_KEY = process.env.EXPO_PUBLIC_YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

interface YouTubeVideo {
  videoId: string;
  title: string;
  thumbnailUrl: string;
  channelName: string;
}

/**
 * Search YouTube for exercise tutorial videos using YouTube Data API v3 (FREE)
 */
export const searchExerciseVideos = async (exerciseName: string): Promise<YouTubeVideo[]> => {
  try {
    console.log('🎥 Searching YouTube Data API v3 for:', exerciseName);

    if (!YOUTUBE_API_KEY) {
      console.warn('⚠️ YouTube API key not found. Add EXPO_PUBLIC_YOUTUBE_API_KEY to .env');
      return [];
    }

    const searchQuery = encodeURIComponent(`${exerciseName} exercise tutorial how to`);
    const url = `${YOUTUBE_API_BASE}/search?part=snippet&q=${searchQuery}&type=video&maxResults=3&order=relevance&key=${YOUTUBE_API_KEY}`;

    console.log('🔗 YouTube Data API URL:', url.replace(YOUTUBE_API_KEY, 'API_KEY_HIDDEN'));

    const response = await fetch(url);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ YouTube API error:', response.status, errorText);
      
      if (response.status === 403) {
        console.error('🔑 API Key issue: Check if YouTube Data API v3 is enabled in Google Cloud Console');
      } else if (response.status === 400) {
        console.error('📝 Bad request: Check API key format');
      }
      
      return [];
    }

    const data = await response.json();
    console.log('📦 YouTube Data API Response:', data.pageInfo?.totalResults || 0, 'total results');

    if (!data.items || !Array.isArray(data.items)) {
      console.warn('⚠️ No items in YouTube response');
      return [];
    }

    const videos = data.items
      .filter((item: any) => item.id?.videoId)
      .map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        thumbnailUrl: 
          item.snippet.thumbnails?.high?.url || 
          item.snippet.thumbnails?.medium?.url || 
          item.snippet.thumbnails?.default?.url || 
          '',
        channelName: item.snippet.channelTitle,
      }))
      .filter((video) => video.videoId && video.thumbnailUrl);

    console.log(`✅ Found ${videos.length} YouTube videos (FREE API)`);
    return videos;
  } catch (error) {
    console.error('❌ Error fetching exercise videos:', error);
    return [];
  }
};

/**
 * Get YouTube search URL for an exercise (fallback)
 */
export const getYouTubeSearchUrl = (exerciseName: string): string => {
  const searchQuery = encodeURIComponent(`${exerciseName} exercise tutorial how to`);
  return `https://www.youtube.com/results?search_query=${searchQuery}`;
};

/**
 * Get YouTube video URL
 */
export const getYouTubeUrl = (videoId: string): string => {
  return `https://www.youtube.com/watch?v=${videoId}`;
};
