import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import ClientForm from "../components/ClientForm";
import { ChevronLeft } from "lucide-react";
import Swal from "../utils/swal";

const AddClientPage = () => {
  const navigate = useNavigate();

  const handleFormSubmit = async (data: any) => {
    console.log("Données du formulaire à envoyer :", data);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: "Vous n'êtes pas connecté.",
        });
        navigate("/login");
        return;
      }

      const config = {
        headers: {
          "x-auth-token": token,
        },
      };

      const response = await axios.post(
        "http://localhost:3001/api/clients",
        data,
        config
      );

      Swal.fire({
        icon: "success",
        title: "Client Ajouté !",
        text: `${response.data.name} a été ajouté avec succès.`,
      }).then(() => {
        navigate("/clients");
      });
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Une erreur est survenue.";
      Swal.fire({
        icon: "error",
        title: "Échec de l'ajout",
        text: message,
      });
      console.error("Erreur lors de l'ajout du client:", error);
    }
  };

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
            Nouveau Client
          </h1>
          <p className="text-text-secondary mt-1">
            Remplissez les informations ci-dessous pour créer un nouveau client.
          </p>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-xl">
          <ClientForm
            onClose={() => navigate("/clients")}
            onSubmit={handleFormSubmit}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddClientPage;
