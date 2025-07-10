import { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface UserType {
  id: number;
  name: string;
  email: string;
  role?: string;
}

const ProfilTab = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState("");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      setName(parsed.name);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.put(
        "http://localhost:3001/api/auth/me",
        { name },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Mise à jour locale
      localStorage.setItem("user", JSON.stringify(response.data));
      setUser(response.data);

      await Swal.fire({
        icon: "success",
        title: "Profil mis à jour",
        text: "Votre nom a été modifié avec succès",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error: any) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Erreur",
        text: error.response?.data?.message || "Une erreur s'est produite",
      });
    }
  };

  if (!user) return <p>Chargement...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold text-text-primary mb-6">
        Profil Public
      </h2>
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">
            Nom complet
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">
            Adresse Email
          </label>
          <input
            type="email"
            id="email"
            value={user.email}
            disabled
            className="mt-1 w-full bg-bg border border-border rounded-md p-2"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-lg"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfilTab;
