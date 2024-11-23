import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { auth, db } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import { Heart, Trash2, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

interface Favorite {
  id: string;
  title: string;
  posterPath: string;
  mediaType: string;
  mediaId: number;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const loadFavorites = async () => {
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
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Déconnexion réussie');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
      console.error(error);
    }
  };

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
    return <LoadingSpinner />;
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto text-center">
          <Heart className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">Connectez-vous pour accéder à votre profil</h1>
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
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="bg-purple-500 rounded-full p-4">
                <User className="w-8 h-8" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl font-bold">{user.email}</h1>
                <p className="text-gray-400">
                  Membre depuis {new Date(user.metadata.creationTime || '').toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>

        {/* Favorites Section */}
        <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-4 md:p-8">
          <div className="flex items-center space-x-2 mb-6">
            <Heart className="w-6 h-6 text-red-500" />
            <h2 className="text-xl font-bold">Mes Favoris</h2>
          </div>

          {favorites.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
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
            <div className="text-center py-12">
              <Heart className="w-12 h-12 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">Vous n'avez pas encore de favoris</p>
              <Link
                to="/"
                className="inline-block mt-4 bg-purple-500 hover:bg-purple-600 px-6 py-2 rounded-full text-sm"
              >
                Découvrir des films et séries
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}