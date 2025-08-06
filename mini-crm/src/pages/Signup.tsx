import { useState, useEffect, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "../utils/swal";
import { Mail, Lock, User, UserPlus, Sun, Moon } from "lucide-react";
import ApexLogo from "../components/Logo";

const Signup = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
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

    if (password !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: "Les mots de passe ne correspondent pas !",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/api/auth/register", {
        name,
        email,
        password,
      });

      await Swal.fire({
        icon: "success",
        title: "Inscription réussie !",
        text: response.data.message,
      });

      navigate("/login");
    } catch (error: any) {
      const message =
        error.response?.data?.message ||
        "Une erreur est survenue lors de l'inscription.";
      Swal.fire({
        icon: "error",
        title: "Erreur d'inscription",
        text: message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Bouton changement de thème */}
      <div className="absolute top-4 right-4 z-50">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-card border border-border text-text-primary hover:bg-border transition"
          title="Changer le thème"
        >
          {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      {/* Page d'inscription */}
      <div className="min-h-screen bg-gradient-to-br from-primary via-indigo-400 to-blue-300 flex items-center justify-center px-4 text-text-primary">
        <div className="bg-white dark:bg-bg rounded-xl shadow-2xl w-full max-w-md p-8 md:p-10 animate-fade-in">
          <div className="flex justify-center mb-6">
            <ApexLogo className="h-12 w-auto" />
          </div>

          <h2 className="text-center text-2xl font-bold text-gray-800 dark:text-white mb-1">
            Créez votre compte 👤
          </h2>
          <p className="text-center text-sm text-gray-500 dark:text-text-secondary mb-6">
            Inscrivez-vous pour accéder à votre espace personnel
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1"
              >
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Jean Dupont"
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-border bg-white dark:bg-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-600 dark:text-text-secondary mb-1"
              >
                Confirmez le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 dark:border-border bg-white dark:bg-bg text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 disabled:opacity-50 transition"
            >
              {isLoading ? (
                "Création en cours..."
              ) : (
                <>
                  <UserPlus size={18} /> Créer le compte
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Vous avez déjà un compte ?{" "}
            <Link
              to="/login"
              className="text-primary font-semibold hover:underline"
            >
              Connexion
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
