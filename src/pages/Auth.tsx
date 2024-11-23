import { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LogIn } from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Connexion réussie!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Compte créé avec succès!');
      }
      navigate('/');
    } catch (error) {
      toast.error('Une erreur est survenue');
      console.error(error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Connexion avec Google réussie!');
      navigate('/');
    } catch (error) {
      toast.error('Erreur lors de la connexion avec Google');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-lg p-6 md:p-8 rounded-lg shadow-lg border border-white/10">
          <h2 className="text-2xl font-bold mb-6 text-center">
            {isLogin ? 'Connexion' : 'Inscription'}
          </h2>
          
          <button
            onClick={handleGoogleSignIn}
            className="w-full bg-white text-gray-900 py-2 px-4 rounded-md font-medium mb-6 flex items-center justify-center space-x-2 hover:bg-gray-100 transition-colors"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            <span>Continuer avec Google</span>
          </button>
          
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-800/50 text-gray-400">Ou</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700/50 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-purple-500 hover:bg-purple-600 py-2 rounded-md font-medium flex items-center justify-center space-x-2 transition-colors"
            >
              <LogIn className="w-5 h-5" />
              <span>{isLogin ? 'Se connecter' : "S'inscrire"}</span>
            </button>
          </form>
          
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="w-full text-center mt-4 text-sm text-gray-400 hover:text-white transition-colors"
          >
            {isLogin ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
          </button>
        </div>
      </div>
    </div>
  );
}