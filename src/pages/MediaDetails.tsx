import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { fetchMovieDetails, fetchVideos } from '../lib/tmdb';
import { Star, Heart, Play } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCache } from '../hooks/useCache';

interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  overview: string;
  backdrop_path: string;
  poster_path: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  'watch/providers'?: {
    results: {
      FR?: {
        rent?: Array<{ provider_name: string; logo_path: string }>;
        buy?: Array<{ provider_name: string; logo_path: string }>;
        flatrate?: Array<{ provider_name: string; logo_path: string }>;
      };
    };
  };
}

export default function MediaDetails() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const [details, setDetails] = useState<MediaDetails | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const loadDetails = async () => {
      if (!id || !type) return;
      
      try {
        setLoading(true);
        const [mediaData, videosData] = await Promise.all([
          fetchMovieDetails(id, type),
          fetchVideos(id, type)
        ]);
        
        setDetails(mediaData);
        setVideos(videosData);

        // Check if it's in favorites
        if (user) {
          const favoriteRef = doc(db, 'favorites', `${user.uid}_${id}`);
          setIsFavorite(true);
        }
      } catch (err) {
        console.error('Error loading details:', err);
        setError(err instanceof Error ? err : new Error('Failed to load details'));
      } finally {
        setLoading(false);
      }
    };

    loadDetails();
  }, [id, type, user]);

  const handleAddToFavorites = async () => {
    if (!user || !details) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${details.id}`);
      await setDoc(favoriteRef, {
        userId: user.uid,
        mediaId: details.id,
        title: details.title || details.name,
        posterPath: details.poster_path,
        mediaType: type,
        addedAt: new Date(),
      });
      setIsFavorite(true);
      toast.success('Ajouté aux favoris');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !details) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des détails.</p>
      </div>
    );
  }

  const providers = details['watch/providers']?.results?.FR;

  return (
    <div>
      {/* Hero Section */}
      <div className="relative min-h-[70vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${details.backdrop_path}`}
            alt={details.title || details.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-48 md:w-64 mx-auto md:mx-0 flex-shrink-0">
              <img
                src={`https://image.tmdb.org/t/p/w500${details.poster_path}`}
                alt={details.title || details.name}
                className="w-full rounded-xl shadow-2xl"
              />
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {details.title || details.name}
              </h1>
              
              <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
                <div className="flex items-center">
                  <Star className="w-5 h-5 text-yellow-400 mr-1" />
                  <span>{details.vote_average?.toFixed(1)}</span>
                </div>
                <span>•</span>
                <span>
                  {details.release_date?.split('-')[0] ||
                    details.first_air_date?.split('-')[0]}
                </span>
              </div>

              <p className="text-gray-200 text-base md:text-lg mb-6">
                {details.overview}
              </p>

              {user && (
                <button
                  onClick={handleAddToFavorites}
                  className="bg-gray-800/50 hover:bg-gray-700/50 px-6 py-3 rounded-full flex items-center space-x-2 backdrop-blur-sm mx-auto md:mx-0"
                >
                  <Heart
                    className={`w-5 h-5 ${
                      isFavorite ? 'fill-red-500 text-red-500' : ''
                    }`}
                  />
                  <span>
                    {isFavorite ? 'Dans vos favoris' : 'Ajouter aux favoris'}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Streaming Providers */}
        {providers && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Où regarder</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
              {providers.flatrate && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">Streaming</h3>
                  <div className="flex flex-wrap gap-4">
                    {providers.flatrate.map((provider) => (
                      <img
                        key={provider.provider_name}
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              {providers.rent && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">Location</h3>
                  <div className="flex flex-wrap gap-4">
                    {providers.rent.map((provider) => (
                      <img
                        key={provider.provider_name}
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
              {providers.buy && (
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 md:p-6">
                  <h3 className="text-lg font-semibold mb-4">Achat</h3>
                  <div className="flex flex-wrap gap-4">
                    {providers.buy.map((provider) => (
                      <img
                        key={provider.provider_name}
                        src={`https://image.tmdb.org/t/p/original${provider.logo_path}`}
                        alt={provider.provider_name}
                        title={provider.provider_name}
                        className="w-10 h-10 md:w-12 md:h-12 rounded-lg"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Videos Section */}
        {videos.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              {videos.length > 1 ? 'Bandes-annonces' : 'Bande-annonce'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {videos.map((video) => (
                <div key={video.id} className="aspect-video rounded-xl overflow-hidden bg-gray-800">
                  <a 
                    href={`https://www.youtube.com/watch?v=${video.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full h-full relative group"
                  >
                    <img
                      src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
                      alt={video.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="bg-white rounded-full p-4">
                        <Play className="w-8 h-8 text-black" />
                      </div>
                    </div>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cast Section */}
        {details.credits?.cast && details.credits.cast.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Distribution</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {details.credits.cast.slice(0, 6).map((actor) => (
                <div key={actor.id} className="bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden">
                  <img
                    src={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : 'https://via.placeholder.com/200x300'
                    }
                    alt={actor.name}
                    className="w-full aspect-[2/3] object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-medium text-sm">{actor.name}</h3>
                    <p className="text-sm text-gray-400 mt-1">{actor.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}