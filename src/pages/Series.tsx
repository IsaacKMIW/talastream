import { useEffect, useState } from 'react';
import { fetchByGenre, fetchGenres } from '../lib/tmdb';
import { Link } from 'react-router-dom';
import { Star, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { useCache } from '../hooks/useCache';

interface Series {
  id: number;
  name: string;
  poster_path: string;
  vote_average: number;
}

interface Genre {
  id: number;
  name: string;
}

export default function Series() {
  const [series, setSeries] = useState<Series[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Use cache for genres
  const { data: genresData } = useCache<{ genres: Genre[] }>(
    'tv-genres',
    () => fetchGenres('tv'),
    []
  );

  const genres = genresData?.genres || [];

  useEffect(() => {
    const loadSeries = async () => {
      setLoading(true);
      try {
        const data = await fetchByGenre('tv', selectedGenre, currentPage);
        setSeries(data.results);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Error loading series:', error);
        toast.error('Erreur lors du chargement des séries');
      } finally {
        setLoading(false);
      }
    };

    loadSeries();
  }, [selectedGenre, currentPage]);

  const handleAddToFavorites = async (serie: Series) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${serie.id}`);
      await setDoc(favoriteRef, {
        userId: user.uid,
        mediaId: serie.id,
        title: serie.name,
        posterPath: serie.poster_path,
        mediaType: 'tv',
        addedAt: new Date(),
      });
      setFavorites(new Set([...favorites, serie.id]));
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-8">Séries</h1>

      {/* Genres */}
      <div className="flex flex-wrap gap-2 mb-8">
        <button
          onClick={() => {
            setSelectedGenre(0);
            setCurrentPage(1);
          }}
          className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-full ${
            selectedGenre === 0
              ? 'bg-purple-500'
              : 'bg-gray-800/50 hover:bg-gray-700/50'
          }`}
        >
          Toutes
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            onClick={() => {
              setSelectedGenre(genre.id);
              setCurrentPage(1);
            }}
            className={`px-3 py-1 md:px-4 md:py-2 text-sm md:text-base rounded-full ${
              selectedGenre === genre.id
                ? 'bg-purple-500'
                : 'bg-gray-800/50 hover:bg-gray-700/50'
            }`}
          >
            {genre.name}
          </button>
        ))}
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {series.map((serie) => (
          <div key={serie.id} className="group relative">
            <Link to={`/tv/${serie.id}`}>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w500${serie.poster_path}`}
                  alt={serie.name}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-sm font-medium line-clamp-2">{serie.name}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{serie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            {user && (
              <button
                onClick={() => handleAddToFavorites(serie)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/50"
                title={favorites.has(serie.id) ? 'Dans vos favoris' : 'Ajouter aux favoris'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(serie.id) ? 'fill-red-500 text-red-500' : 'text-white'
                  }`}
                />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center space-x-4 mt-12">
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
  );
}