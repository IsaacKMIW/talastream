const YOUTUBE_API_KEY = 'AIzaSyBqMTLyAht0e2W4pRn_PfAYmVQ_I8DNmXg';

export const fetchYouTubeDetails = async (videoId: string) => {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${YOUTUBE_API_KEY}`
    );
    return response.json();
  } catch (error) {
    console.error('Error fetching YouTube details:', error);
    return null;
  }
};