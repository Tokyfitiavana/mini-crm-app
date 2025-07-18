// src/pages/Signup.tsx
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "../utils/swal";
import { Mail, Lock, User, UserPlus } from "lucide-react";

const Signup = () => {
  // Ajout du state pour le nom
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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
      const response = await axios.post(
        "http://localhost:3001/api/auth/register",
        {
          name,
          email,
          password,
        }
      );

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
    <div className="flex items-center justify-center min-h-screen bg-bg text-text-primary p-4">
      <div className="w-full max-w-md">
        <h1 className="text-center text-5xl font-extrabold text-text-secondary/20 mb-8 hidden sm:block">
          CRÉER UN COMPTE
        </h1>
        <div className="bg-card rounded-xl shadow-lg overflow-hidden">
          <div className="flex">
            <Link
              to="/login"
              className="flex-1 py-3 text-center font-semibold text-text-secondary hover:bg-bg"
            >
              Connexion
            </Link>
            <button className="flex-1 py-3 text-center font-semibold text-white bg-primary">
              Inscription
            </button>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Nom complet
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Saisissez votre nom complet"
                  className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-md placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Adresse Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Saisissez votre email"
                  className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-md placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Créez un mot de passe"
                  className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-md placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-text-secondary mb-1"
              >
                Confirmez le mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Confirmez votre mot de passe"
                  className="w-full pl-10 pr-3 py-2 bg-bg border border-border rounded-md placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 text-sm font-medium rounded-md text-white bg-primary hover:opacity-90 disabled:opacity-50 mt-6"
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
        </div>
      </div>
    </div>
  );
};

export default Signup;
