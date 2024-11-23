import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { searchContent } from '../lib/tmdb';
import { Link } from 'react-router-dom';
import { Star, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import toast from 'react-hot-toast';

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string;
  vote_average: number;
  media_type: string;
}

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchResults = async () => {
      if (!query) return;
      
      setLoading(true);
      try {
        const data = await searchContent(query);
        setResults(data.results.filter((item: SearchResult) => item.poster_path));
      } catch (error) {
        console.error('Error searching content:', error);
        toast.error('Erreur lors de la recherche');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]);

  const handleAddToFavorites = async (item: SearchResult) => {
    if (!user) {
      toast.error('Connectez-vous pour ajouter aux favoris');
      return;
    }

    try {
      const favoriteRef = doc(db, 'favorites', `${user.uid}_${item.id}`);
      await setDoc(favoriteRef, {
        userId: user.uid,
        mediaId: item.id,
        title: item.title || item.name,
        posterPath: item.poster_path,
        mediaType: item.media_type,
        addedAt: new Date(),
      });
      toast.success('Ajouté aux favoris');
    } catch (error) {
      console.error('Error adding to favorites:', error);
      toast.error('Erreur lors de l\'ajout aux favoris');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-2xl font-bold mb-8">Résultats pour "{query}"</h1>
      
      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {results.map((item) => (
            <div key={item.id} className="group relative">
              <Link to={`/${item.media_type}/${item.id}`}>
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden">
                  <img
                    src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                    alt={item.title || item.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-0 p-4">
                      <h3 className="text-sm font-medium line-clamp-2">
                        {item.title || item.name}
                      </h3>
                      <div className="flex items-center space-x-2 mt-2">
                        <Star className="w-4 h-4 text-yellow-400" />
                        <span className="text-sm">{item.vote_average?.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
              {user && (
                <button
                  onClick={() => handleAddToFavorites(item)}
                  className="absolute top-2 right-2 p-2 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-400">Aucun résultat trouvé pour "{query}"</p>
        </div>
      )}
    </div>
  );
}