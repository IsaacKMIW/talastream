import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Film, Tv, Heart, Search, User as UserIcon, LogIn, Menu, X } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [location.pathname]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
      setIsSearchOpen(false);
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/30 backdrop-blur-md z-50 border-b border-white/10">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <Film className="w-7 h-7 md:w-8 md:h-8 text-purple-500" />
            <span className="text-lg md:text-xl font-bold hidden sm:inline">TalaStream</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 max-w-xl mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher un film ou une série..."
                  className="w-full bg-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-6">
            <Link 
              to="/movies" 
              className="flex items-center space-x-1 hover:text-purple-500 transition-colors"
            >
              <Film className="w-5 h-5" />
              <span>Films</span>
            </Link>
            <Link 
              to="/series" 
              className="flex items-center space-x-1 hover:text-purple-500 transition-colors"
            >
              <Tv className="w-5 h-5" />
              <span>Séries</span>
            </Link>
            {user && (
              <Link 
                to="/favorites" 
                className="flex items-center space-x-1 hover:text-purple-500 transition-colors"
              >
                <Heart className="w-5 h-5" />
                <span>Favoris</span>
              </Link>
            )}
            {user ? (
              <Link 
                to="/profile" 
                className="flex items-center space-x-1 hover:text-purple-500 transition-colors"
              >
                <UserIcon className="w-5 h-5" />
                <span>Profil</span>
              </Link>
            ) : (
              <Link 
                to="/auth" 
                className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 px-4 py-2 rounded-full transition-colors"
              >
                <LogIn className="w-5 h-5" />
                <span>Connexion</span>
              </Link>
            )}
          </div>

          {/* Mobile Controls */}
          <div className="flex items-center space-x-2 md:hidden">
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Search"
            >
              <Search className="w-6 h-6" />
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search */}
        {isSearchOpen && (
          <div ref={searchRef} className="md:hidden py-4 px-2">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="search"
                  placeholder="Rechercher..."
                  className="w-full bg-white/10 rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
          </div>
        )}

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div ref={menuRef} className="md:hidden py-4 border-t border-white/10">
            <div className="flex flex-col space-y-2">
              <Link
                to="/movies"
                className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Film className="w-5 h-5" />
                <span>Films</span>
              </Link>
              <Link
                to="/series"
                className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Tv className="w-5 h-5" />
                <span>Séries</span>
              </Link>
              {user && (
                <Link
                  to="/favorites"
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="w-5 h-5" />
                  <span>Favoris</span>
                </Link>
              )}
              {user ? (
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 px-4 py-3 hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <UserIcon className="w-5 h-5" />
                  <span>Profil</span>
                </Link>
              ) : (
                <Link
                  to="/auth"
                  className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 px-4 py-3 rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <LogIn className="w-5 h-5" />
                  <span>Connexion</span>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}