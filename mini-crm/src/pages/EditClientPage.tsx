import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import ClientForm from "../components/ClientForm";
import { ChevronLeft } from "lucide-react";
import Swal from "../utils/swal";

const EditClientPage = () => {
  const navigate = useNavigate();
  const { clientId } = useParams<{ clientId: string }>();
  const [clientData, setClientData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    fetch(`http://localhost:3001/api/clients/${clientId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Client introuvable");
        return res.json();
      })
      .then((data) => setClientData(data))
      .catch(() => setClientData(null))
      .finally(() => setLoading(false));
  }, [clientId]);

  const handleFormSubmit = (updatedData: any) => {
    fetch(`http://localhost:3001/api/clients/${clientId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de mise à jour");
        Swal.fire({
          icon: "success",
          title: "Client modifié",
          text: "Les informations du client ont été mises à jour avec succès.",
          confirmButtonText: "Retour à la liste",
        }).then(() => {
          navigate("/clients");
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Échec de la modification du client.",
        });
      });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center p-10">Chargement en cours...</div>
      </DashboardLayout>
    );
  }

  if (!clientData) {
    return (
      <DashboardLayout>
        <div className="text-center p-10">Client non trouvé.</div>
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
