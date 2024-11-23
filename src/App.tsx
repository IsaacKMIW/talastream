import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import { AuthProvider } from './contexts/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Auth = lazy(() => import('./pages/Auth'));
const Profile = lazy(() => import('./pages/Profile'));
const MediaDetails = lazy(() => import('./pages/MediaDetails'));
const Search = lazy(() => import('./pages/Search'));
const Movies = lazy(() => import('./pages/Movies'));
const Series = lazy(() => import('./pages/Series'));
const Favorites = lazy(() => import('./pages/Favorites'));

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-900 text-white">
          <Navbar />
          <Suspense fallback={<LoadingSpinner />}>
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/:type/:id" element={<MediaDetails />} />
                <Route path="/search" element={<Search />} />
                <Route path="/movies" element={<Movies />} />
                <Route path="/series" element={<Series />} />
                <Route path="/favorites" element={<Favorites />} />
              </Routes>
            </main>
          </Suspense>
          <Toaster position="bottom-right" />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}