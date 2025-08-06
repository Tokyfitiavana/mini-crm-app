import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { PlusCircle } from "lucide-react";

// Types
interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  promote?: boolean;
  avatar: string;
}

const EquipeTab = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const response = await axios.get("http://localhost:3001/api/team", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const withAvatars = response.data.map((member: any) => ({
        ...member,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          member.name
        )}`,
        promote: false,
      }));

      setTeam(withAvatars);
    } catch (err) {
      Swal.fire("Erreur", "Chargement de l'équipe échoué", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePromote = (id: number) => {
    setTeam((prev) =>
      prev.map((m) => (m.id === id ? { ...m, promote: !m.promote } : m))
    );
  };

  const handleSendInvites = async () => {
    const selected = team.filter((m) => m.promote && m.role === "user");

    if (selected.length === 0) {
      Swal.fire("Aucun utilisateur sélectionné", "", "info");
      return;
    }

    const token = localStorage.getItem("authToken");

    try {
      for (const member of selected) {
        await axios.post(
          "http://localhost:3001/api/team/invite",
          {
            name: member.name,
            email: member.email,
            role: "admin",
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      }

      Swal.fire("Succès", "Invitations envoyées avec succès", "success");
      fetchTeam();
    } catch (err: any) {
      Swal.fire(
        "Erreur",
        err.response?.data?.message || "Erreur d'envoi",
        "error"
      );
    }
  };

  const handleDemoteAdmin = async (id: number) => {
    const token = localStorage.getItem("authToken");

    try {
      await axios.put(
        `http://localhost:3001/api/team/demote/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      Swal.fire("Succès", "L’utilisateur a été rétrogradé.", "success");
      fetchTeam();
    } catch (err: any) {
      Swal.fire(
        "Erreur",
        err.response?.data?.message || "Échec de la rétrogradation.",
        "error"
      );
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading)
    return <div className="text-center text-gray-500">Chargement...</div>;

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Équipe</h2>
        <button
          className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg text-sm hover:opacity-90"
          onClick={handleSendInvites}
        >
          <PlusCircle size={18} /> Inviter
        </button>
      </div>

      {team.length === 0 ? (
        <p>Aucun membre trouvé.</p>
      ) : (
        <div className="space-y-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-bg rounded-lg"
            >
              <div className="flex items-center gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-text-primary">
                    {member.name}
                  </p>
                  <p className="text-sm text-text-secondary">{member.email}</p>
                </div>
              </div>

              {member.role === "user" ? (
                <input
                  type="checkbox"
                  checked={!!member.promote}
                  onChange={() => handleTogglePromote(member.id)}
                  className="form-checkbox w-5 h-5 text-primary"
                  title="Promouvoir en tant qu'administrateur"
                />
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm px-3 py-1 bg-green-100 text-green-800 rounded-full">
                    Administrateur
                  </span>
                  <button
                    onClick={() => handleDemoteAdmin(member.id)}
                    className="text-xs text-red-600 hover:underline"
                    title="Rétrograder en utilisateur"
                  >
                    Destituer
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipeTab;
