import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import ClientForm from "../components/ClientForm";
import { ChevronLeft } from "lucide-react";
import Swal from "../utils/swal";
import { useAuth } from "../context/AuthContext";

type User = { id: number; name: string };

const AddClientPage = () => {
  const navigate = useNavigate();
  const { token, isAdmin } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAdmin && token) {
      const fetchUsers = async () => {
        try {
          const config = { headers: { Authorization: `Bearer ${token}` } };
          const response = await axios.get(
            "http://localhost:3001/api/team",
            config
          );
          setUsers(response.data);
        } catch (error) {
          console.error("Erreur chargement de l'équipe", error);
        } finally {
          setLoading(false);
        }
      };
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, [token, isAdmin]);

  const handleFormSubmit = async (data: any) => {
    try {
      if (!token) throw new Error("Non authentifié");

      const dataToSubmit = {
        ...data,
        assigned_to_user_id: data.assigned_to_user_id
          ? Number(data.assigned_to_user_id)
          : null,
      };

      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "http://localhost:3001/api/clients",
        dataToSubmit,
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
      Swal.fire({
        icon: "error",
        title: "Échec de l'ajout",
        text: error.response?.data?.message || "Une erreur est survenue.",
      });
    }
  };

  if (loading)
    return (
      <DashboardLayout>
        <div className="text-center p-10">Chargement...</div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => navigate("/clients")}
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <ChevronLeft size={20} />
            Retour
          </button>
          <h1 className="text-3xl font-bold text-text-primary">
            Nouveau Client
          </h1>
        </div>
        <div className="bg-card p-8 rounded-lg shadow-xl">
          <ClientForm
            onClose={() => navigate("/clients")}
            onSubmit={handleFormSubmit}
            users={users}
          />
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AddClientPage;
