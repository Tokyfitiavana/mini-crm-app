import { useState, FormEvent } from "react";
import axios from "axios";
import Swal from "../utils/swal";
import { Mail } from "lucide-react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    try {
      const response = await axios.post("http://localhost:3001/api/auth/forgot-password", {
        email,
      });

      Swal.fire({
        icon: "success",
        title: "Vérifiez votre boîte mail",
        text: response.data.message || "Un lien vous a été envoyé.",
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Une erreur est survenue.";
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: message,
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg text-text-primary px-4">
      <div className="bg-card p-8 rounded-xl shadow-xl w-full max-w-md animate-fade-in">
        <h2 className="text-2xl font-bold mb-2 text-center">Mot de passe oublié ?</h2>
        <p className="text-sm text-text-secondary mb-6 text-center">
          Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
            <input
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 rounded-md border border-border bg-bg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="w-full py-3 px-4 rounded-md bg-primary text-white font-semibold hover:opacity-90 disabled:opacity-50 transition"
          >
            {isSending ? "Envoi en cours..." : "Envoyer le lien"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
