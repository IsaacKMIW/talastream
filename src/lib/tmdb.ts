const TMDB_API_KEY = '37b978190117221b699eceb0162981a5';
const BEARER_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzN2I5NzgxOTAxMTcyMjFiNjk5ZWNlYjAxNjI5ODFhNSIsIm5iZiI6MTczMjMwNzk1NS4yMzQ3NzU4LCJzdWIiOiI2NzQwNGUyMmRhZTJlNmE5MzgyNTViODEiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.1iBz0prQ9IrVDSv1Ht5-qikvxNQuZk8NgTU4uXWXWPU';
const BASE_URL = 'https://api.themoviedb.org/3';

const headers = {
  'Authorization': `Bearer ${BEARER_TOKEN}`,
  'accept': 'application/json'
};

export const fetchTrending = async (page = 1) => {
  const response = await fetch(
    `${BASE_URL}/trending/all/week?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`
  );
  return response.json();
};

export const fetchMovieDetails = async (id: string, type: string) => {
  const response = await fetch(
    `${BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=fr-FR&append_to_response=videos,watch/providers,credits`
  );
  return response.json();
};

export const fetchVideos = async (id: string, type: string) => {
  const response = await fetch(
    `${BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}&language=fr-FR`,
    { headers }
  );
  const data = await response.json();
  return data.results.filter((video: any) => 
    video.site === 'YouTube' && 
    (video.type === 'Trailer' || video.type === 'Teaser')
  );
};

export const searchContent = async (query: string) => {
  const response = await fetch(
    `${BASE_URL}/search/multi?api_key=${TMDB_API_KEY}&language=fr-FR&query=${encodeURIComponent(query)}`
  );
  return response.json();
};

export const fetchByGenre = async (mediaType: string, genreId: number, page = 1) => {
  const url = genreId === 0
    ? `${BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&language=fr-FR&page=${page}`
    : `${BASE_URL}/discover/${mediaType}?api_key=${TMDB_API_KEY}&language=fr-FR&with_genres=${genreId}&page=${page}`;
  
  const response = await fetch(url);
  return response.json();
};

export const fetchGenres = async (mediaType: string) => {
  const response = await fetch(
    `${BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_API_KEY}&language=fr-FR`
  );
  return response.json();
};