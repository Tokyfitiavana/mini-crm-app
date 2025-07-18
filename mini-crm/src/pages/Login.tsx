import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Swal from '../utils/swal';
import { Mail, Lock, LogIn } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3001/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user)); 

      await Swal.fire({
        icon: 'success',
        title: `Bienvenue, ${user.name} !`,
        text: 'Vous êtes maintenant connecté.',
        timer: 1500,
        showConfirmButton: false,
      });

      navigate('/dashboard');

    } catch (error: any) {
      const message = error.response?.data?.message || 'Une erreur est survenue lors de la connexion.';
      Swal.fire({
        icon: 'error',
        title: 'Erreur de connexion',
        text: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-bg text-text-primary p-4">
      <div className="w-full max-w-md">
        <h1 className="text-center text-5xl font-extrabold text-text-secondary/20 mb-8 hidden sm:block">
          MINI CRM
        </h1>
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="flex">
            <button className="flex-1 py-3 text-center font-semibold text-white bg-primary">Connexion</button>
            <Link to="/signup" className="flex-1 py-3 text-center font-semibold text-text-secondary hover:bg-bg">Inscription</Link>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">Adresse Email</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" /><input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="Saisissez votre email" className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-md placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"/></div>
            </div>
            
            <div>
              <label htmlFor="password">Mot de passe</label>
              <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" /><input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="Saisissez votre mot de passe" className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-md placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"/></div>
            </div>
            
            <div className="text-right text-sm"><Link to="/mot-de-passe-oublie" className="font-medium text-primary hover:underline">Mot de passe oublié ?</Link></div>
            
            <button type="submit" disabled={isLoading} className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 disabled:opacity-50">
              {isLoading ? 'Connexion en cours...' : <><LogIn size={18} /> Se connecter</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;