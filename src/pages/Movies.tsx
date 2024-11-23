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

interface Movie {
  id: number;
  title: string;
  poster_path: string;
  vote_average: number;
}

interface Genre {
  id: number;
  name: string;
}

export default function Movies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  // Use cache for genres
  const { data: genresData } = useCache<{ genres: Genre[] }>(
    'movie-genres',
    () => fetchGenres('movie'),
    []
  );

  const genres = genresData?.genres || [];

  useEffect(() => {
    const loadMovies = async () => {
      setLoading(true);
      try {
        const data = await fetchByGenre('movie', selectedGenre, currentPage);
        setMovies(data.results);
        setTotalPages(data.total_pages);
      } catch (error) {
        console.error('Error loading movies:', error);
        toast.error('Erreur lors du chargement des films');
      } finally {
        setLoading(false);
      }
    };

    loadMovies();
  }, [selectedGenre, currentPage]);

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
        title: movie.title,
        posterPath: movie.poster_path,
        mediaType: 'movie',
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

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-3xl font-bold mb-8">Films</h1>

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
          Tous
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

      {/* Movies Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {movies.map((movie) => (
          <div key={movie.id} className="group relative">
            <Link to={`/movie/${movie.id}`}>
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                <img
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 p-4">
                    <h3 className="text-sm font-medium line-clamp-2">{movie.title}</h3>
                    <div className="flex items-center space-x-2 mt-2">
                      <Star className="w-4 h-4 text-yellow-400" />
                      <span className="text-sm">{movie.vote_average?.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
            {user && (
              <button
                onClick={() => handleAddToFavorites(movie)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-purple-500/50"
                title={favorites.has(movie.id) ? 'Dans vos favoris' : 'Ajouter aux favoris'}
              >
                <Heart
                  className={`w-5 h-5 ${
                    favorites.has(movie.id) ? 'fill-red-500 text-red-500' : 'text-white'
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