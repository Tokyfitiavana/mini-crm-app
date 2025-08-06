import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "../utils/swal";
import { Mail, Lock, LogIn } from "lucide-react";
import ApexLogo from "../components/Logo";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/api/auth/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));

      await Swal.fire({
        icon: "success",
        title: `Bienvenue, ${user.name} !`,
        text: "Vous êtes maintenant connecté.",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/dashboard", { replace: true });
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Une erreur est survenue lors de la connexion.";
      Swal.fire({
        icon: "error",
        title: "Erreur de connexion",
        text: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-indigo-400 to-blue-300 flex items-center justify-center px-4 text-text-primary">
      <div className="bg-white dark:bg-bg rounded-xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in">
        <div className="flex justify-center mb-6">
          <ApexLogo className="h-12 w-auto" />
        </div>
  
        <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white mb-1">
          Bienvenue 👋
        </h2>
        <p className="text-center text-sm text-gray-500 dark:text-text-secondary mb-6">
          Connectez-vous pour accéder à votre tableau de bord
        </p>
  
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1"
            >
              Adresse Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-border bg-white dark:bg-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
  
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1"
            >
              Mot de passe
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-border bg-white dark:bg-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>
  
          <div className="text-right text-sm">
            <Link
              to="/mot-de-passe-oublie"
              className="text-primary font-medium hover:underline"
            >
              Mot de passe oublié ?
            </Link>
          </div>
  
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 disabled:opacity-50 transition"
          >
            {isLoading ? (
              "Connexion en cours..."
            ) : (
              <>
                <LogIn size={18} /> Se connecter
              </>
            )}
          </button>
        </form>
  
        <div className="mt-6 text-center text-sm text-gray-500">
          Pas encore de compte ?{" "}
          <Link
            to="/signup"
            className="text-primary font-semibold hover:underline"
          >
            Inscription
          </Link>
        </div>
      </div>
    </div>
  );
  
};

export default Login;
