import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import ClientForm from "../components/ClientForm";
import { ChevronLeft } from "lucide-react";
import Swal from "../utils/swal";
import { useAuth } from "../context/AuthContext";

type ClientData = {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: "Actif" | "Inactif" | "Prospect";
  assigned_to_user_id?: number;
};

const EditClientPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const { token } = useAuth();
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId || !token) {
      setLoading(false);
      return;
    }

    const fetchClientData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          `http://localhost:3001/api/clients/${clientId}`,
          config
        );
        setClientData(response.data);
      } catch (error) {
        console.error("Erreur lors du chargement du client :", error);
        setClientData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClientData();
  }, [clientId, token]);

  const handleFormSubmit = async (updatedData: Partial<ClientData>) => {
    try {
      if (!token) throw new Error("Non authentifié");

      const config = { headers: { Authorization: `Bearer ${token}` } };

      await axios.put(
        `http://localhost:3001/api/clients/${clientId}`,
        updatedData,
        config
      );

      Swal.fire({
        icon: "success",
        title: "Client modifié",
        text: "Les informations ont été mises à jour avec succès.",
      }).then(() => {
        navigate("/clients");
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Échec de la modification du client.";
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: message,
      });
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center p-10 text-text-secondary">
          Chargement...
        </div>
      </DashboardLayout>
    );
  }

  if (!clientData) {
    return (
      <DashboardLayout>
        <div className="text-center p-10 text-text-secondary">
          <p className="text-lg font-semibold">
            Client non trouvé ou accès non autorisé.
          </p>
          <Link
            to="/clients"
            className="text-primary underline mt-4 inline-block"
          >
            Retourner à la liste
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <ChevronLeft size={20} />
            Retour à la liste des clients
          </button>
          <h1 className="text-3xl font-bold text-text-primary">
            Modifier le client
          </h1>
          <p className="text-text-secondary mt-1">
            Mettez à jour les informations de {clientData.name}.
          </p>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-xl">
          <ClientForm
            onClose={() => navigate("/clients")}
            onSubmit={handleFormSubmit}
            initialData={clientData}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EditClientPage;
