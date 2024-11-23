import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Star, Heart, Film, Tv, ChevronLeft, ChevronRight } from 'lucide-react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCache } from '../hooks/useCache';
import { fetchTrending } from '../lib/tmdb';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

interface Movie {
  id: number;
  title: string;
  name: string;
  poster_path: string;
  backdrop_path: string;
  overview: string;
  vote_average: number;
  media_type: string;
}

type MediaType = 'all' | 'movie' | 'tv';

export default function Home() {
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [mediaType, setMediaType] = useState<MediaType>('all');
  const { user } = useAuth();

  const { data: trendingData, loading, error } = useCache<{ results: Movie[]; total_pages: number }>(
    `trending-${mediaType}-${currentPage}`,
    () => fetchTrending(currentPage),
    [currentPage, mediaType]
  );

  const trending = trendingData?.results || [];

  useEffect(() => {
    if (trendingData?.total_pages) {
      setTotalPages(trendingData.total_pages);
    }
  }, [trendingData]);

  const handleAddToFavorites = async (movie: Movie) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${movie.id}`);
      await setDoc(favoriteRef, {
        userId: user.uid,
        mediaId: movie.id,
        title: movie.title || movie.name,
        posterPath: movie.poster_path,
        mediaType: movie.media_type,
        addedAt: new Date(),
      });
      setFavorites(new Set([...favorites, movie.id]));
      toast.success('Ajouté aux favoris');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const filteredContent = trending.filter(item => {
    if (mediaType === 'all') return true;
    return item.media_type === mediaType;
  });

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <p className="text-red-500">Une erreur est survenue lors du chargement des données.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative w-full">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          autoplay={{ delay: 5000 }}
          pagination={{ clickable: true }}
          navigation
          loop
          className="h-[50vh] sm:h-[60vh] md:h-[70vh] lg:h-[85vh] w-full"
        >
          {trending.slice(0, 5).map((item) => (
            <SwiperSlide key={item.id}>
              <div className="relative h-full w-full">
                <img
                  src={`https://image.tmdb.org/t/p/original${item.backdrop_path}`}
                  alt={item.title || item.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50" />
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
                  <div className="container mx-auto max-w-6xl">
                    <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
                      {item.title || item.name}
                    </h2>
                    <p className="text-gray-200 max-w-xl mb-4 md:mb-6 text-sm sm:text-base md:text-lg line-clamp-2 sm:line-clamp-3">
                      {item.overview}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                      <Link
                        to={`/${item.media_type}/${item.id}`}
                        className="bg-purple-500 hover:bg-purple-600 px-4 sm:px-6 md:px-8 py-2 md:py-3 rounded-full flex items-center space-x-2 text-sm sm:text-base md:text-lg transition-colors"
                      >
                        <Play className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                        <span>Plus d'infos</span>
                      </Link>
                      {user && (
                        <button
                          onClick={() => handleAddToFavorites(item)}
                          className="bg-gray-800/50 hover:bg-gray-700/50 px-4 sm:px-6 py-2 sm:py-3 rounded-full flex items-center space-x-2 backdrop-blur-sm text-sm sm:text-base transition-colors"
                        >
                          <Heart
                            className={`w-4 h-4 sm:w-5 sm:h-5 ${
                              favorites.has(item.id) ? 'fill-red-500 text-red-500' : ''
                            }`}
                          />
                          <span className="hidden sm:inline">
                            {favorites.has(item.id) ? 'Dans vos favoris' : 'Ajouter aux favoris'}
                          </span>
                          <span className="sm:hidden">Favoris</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Filter Section */}
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 text-center">
            Découvrez nos films & séries
          </h2>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMediaType('all')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm sm:text-base transition-colors ${
                mediaType === 'all'
                  ? 'bg-purple-500'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <span>Tout</span>
            </button>
            <button
              onClick={() => setMediaType('movie')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm sm:text-base transition-colors ${
                mediaType === 'movie'
                  ? 'bg-purple-500'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <Film className="w-5 h-5" />
              <span>Films</span>
            </button>
            <button
              onClick={() => setMediaType('tv')}
              className={`flex items-center space-x-2 px-6 py-3 rounded-full text-sm sm:text-base transition-colors ${
                mediaType === 'tv'
                  ? 'bg-purple-500'
                  : 'bg-gray-800/50 hover:bg-gray-700/50'
              }`}
            >
              <Tv className="w-5 h-5" />
              <span>Séries</span>
            </button>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
          {filteredContent.map((item) => (
            <div key={item.id} className="group relative">
              <Link to={`/${item.media_type}/${item.id}`}>
                <div className="relative aspect-[2/3] rounded-lg sm:rounded-xl overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-2 sm:p-4">
                      <h3 className="text-xs sm:text-sm font-medium line-clamp-2">
                        {item.title || item.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-1 sm:mt-2">
                        <Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                        <span className="text-xs sm:text-sm">{item.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {user && (
                <button
                  onClick={() => handleAddToFavorites(item)}
                  className="absolute top-1 right-1 sm:top-2 sm:right-2 p-1.5 sm:p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/50"
                  title={favorites.has(item.id) ? 'Dans vos favoris' : 'Ajouter aux favoris'}
                >
                  <Heart
                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      favorites.has(item.id) ? 'fill-red-500 text-red-500' : 'text-white'
                    }`}
                  />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center space-x-4 mt-8">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm md:text-base ${
              currentPage === 1
                ? 'bg-gray-800/30 cursor-not-allowed'
                : 'bg-gray-800/50 hover:bg-gray-700/50'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Précédent</span>
          </button>
          <span className="text-gray-400 text-sm md:text-base">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm md:text-base ${
              currentPage === totalPages
                ? 'bg-gray-800/30 cursor-not-allowed'
                : 'bg-gray-800/50 hover:bg-gray-700/50'
            }`}
          >
            <span className="hidden sm:inline">Suivant</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}