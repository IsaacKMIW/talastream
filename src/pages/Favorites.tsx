import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { Heart, Star, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface Favorite {
  id: string;
  title: string;
  posterPath: string;
  mediaType: string;
  mediaId: number;
  vote_average?: number;
}

export default function Favorites() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFavorites = async () => {
      if (!user) return;

      try {
        const q = query(collection(db, 'favorites'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);
        const favs: Favorite[] = [];
        querySnapshot.forEach((doc) => {
          favs.push({ id: doc.id, ...doc.data() } as Favorite);
        });
        setFavorites(favs);
      } catch (error) {
        console.error('Error loading favorites:', error);
        toast.error('Erreur lors du chargement des favoris');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [user]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      await deleteDoc(doc(db, 'favorites', favoriteId));
      setFavorites(favorites.filter(fav => fav.id !== favoriteId));
      toast.success('Retiré des favoris');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Erreur lors de la suppression du favori');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Connectez-vous pour voir vos favoris</h1>
          <Link
            to="/auth"
            className="inline-block bg-purple-500 hover:bg-purple-600 px-6 py-3 rounded-full"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex items-center space-x-3 mb-8">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">Mes Favoris</h1>
      </div>

      {favorites.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {favorites.map((favorite) => (
            <div key={favorite.id} className="group relative">
              <Link to={`/${favorite.mediaType}/${favorite.mediaId}`}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${favorite.posterPath}`}
                    alt={favorite.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-4">
                      <h3 className="text-sm font-medium line-clamp-2">{favorite.title}</h3>
                      {favorite.vote_average && (
                        <div className="flex items-center space-x-2 mt-2">
                          <Star className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm">{favorite.vote_average.toFixed(1)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
              <button
                onClick={() => handleRemoveFavorite(favorite.id)}
                className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/50"
                title="Retirer des favoris"
              >
                <Trash2 className="w-4 h-4 text-white" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-800/50 backdrop-blur-sm rounded-2xl">
          <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
          <p className="text-gray-400 mb-4">Vous n'avez pas encore de favoris</p>
          <div className="flex justify-center space-x-4">
            <Link
              to="/movies"
              className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-full text-sm"
            >
              Découvrir des films
            </Link>
            <Link
              to="/series"
              className="bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-full text-sm"
            >
              Découvrir des séries
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}