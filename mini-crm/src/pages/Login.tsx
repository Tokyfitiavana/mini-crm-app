import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "../utils/swal";
import { Mail, Lock, LogIn, Sun, Moon } from "lucide-react";
import ApexLogo from "../components/Logo";

const Login = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post(
        "http://localhost:3001/api/auth/login",
        { email, password }
      );

      const { token, user } = response.data;

      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("userRole", user.role);

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
    <>
      {/* Bouton Accueil */}
      <div className="absolute top-4 left-4 z-50">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#A78BFA] hover:bg-[#8F6FEF] text-white font-medium shadow-md transition"
        >
          Accueil
        </Link>
      </div>

      {/* Bouton changement de thème */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 transition"
          title="Changer le thème"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Formulaire Login */}
      <div className="min-h-screen bg-gradient-to-br from-[#A78BFA] via-purple-300 to-purple-200 flex items-center justify-center px-4 text-gray-900 dark:text-white">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in">
          
          <div className="flex justify-center mb-6">
            <ApexLogo className="h-12 w-auto" />
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-900 dark:text-white mb-1">
            Bienvenue 👋
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
            Connectez-vous pour accéder à votre tableau de bord
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
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
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1"
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
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#A78BFA]"
                />
              </div>
            </div>

            <div className="text-right text-sm">
              <Link
                to="/mot-de-passe-oublie"
                className="text-[#A78BFA] font-medium hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton Connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-[#A78BFA] hover:bg-[#8F6FEF] disabled:opacity-50 transition"
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

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Pas encore de compte ?{" "}
            <Link
              to="/signup"
              className="text-[#A78BFA] font-semibold hover:underline"
            >
              Inscription
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
