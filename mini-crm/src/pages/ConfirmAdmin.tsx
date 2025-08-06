// ConfirmAdmin.tsx
import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";

const ConfirmAdmin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      Swal.fire("Erreur", "Lien invalide", "error");
      return;
    }

    const confirmPromotion = async () => {
      try {
        await axios.post("http://localhost:3001/api/team/confirm-admin", { token });
        Swal.fire("Succès", "Votre rôle a été mis à jour", "success");
        navigate("/login"); // Redirection ou dashboard
      } catch (err: any) {
        Swal.fire("Erreur", err.response?.data?.message || "Lien expiré", "error");
      } finally {
        setLoading(false);
      }
    };

    confirmPromotion();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      {loading ? (
        <p className="text-gray-600">Confirmation en cours...</p>
      ) : null}
    </div>
  );
};

export default ConfirmAdmin;
