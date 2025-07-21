import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { PlusCircle, ChevronDown } from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar: string;
};

const roleLabel = {
  admin: "Administrateur",
  user: "Utilisateur",
};

const EquipeTab = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const fetchTeam = async () => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Aucun token trouvé. Veuillez vous reconnecter.");

      const response = await axios.get("http://localhost:3001/api/team", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const teamWithAvatars = response.data.map((member: any) => ({
        ...member,
        avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`,
      }));

      setTeam(teamWithAvatars);
    } catch (error: any) {
      if (error.response?.status === 403) {
        Swal.fire({
          icon: "error",
          title: "Accès refusé",
          text: "Vous n’avez pas les droits pour consulter cette équipe.",
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Erreur",
          text: error.message || "Une erreur est survenue.",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (memberId: number, newRole: "admin" | "user") => {
    const originalTeam = [...team];
    setTeam((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m))
    );

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("Non authentifié");

      await axios.patch(
        `http://localhost:3001/api/team/${memberId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire("Succès", "Rôle mis à jour", "success");
    } catch (err: any) {
      setTeam(originalTeam);
      Swal.fire("Erreur", "Impossible de changer le rôle", "error");
    }
  };

  const toggleDropdown = (id: number) => {
    setOpenDropdownId((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading) {
    return <div className="text-center text-gray-500">Chargement de l’équipe...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Gestion de l'équipe</h2>
        <button className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg text-sm hover:opacity-90">
          <PlusCircle size={18} />
          Inviter un membre
        </button>
      </div>

      {team.length === 0 ? (
        <p>Aucun membre trouvé.</p>
      ) : (
        <div className="space-y-4">
          {team.map((member) => (
            <div
              key={member.id}
              className="flex items-center justify-between p-4 bg-bg rounded-lg relative"
            >
              <div className="flex items-center gap-4">
                <img
                  src={member.avatar}
                  alt={member.name}
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-semibold text-text-primary">{member.name}</p>
                  <p className="text-sm text-text-secondary">{member.email}</p>
                </div>
              </div>

              <div className="relative">
                <button
                  onClick={() => toggleDropdown(member.id)}
                  className="flex items-center px-3 py-1 text-sm bg-bg border border-border text-text-primary rounded-md hover:bg-border"
                >
                  {roleLabel[member.role]} <ChevronDown size={16} className="ml-2" />
                </button>

                {openDropdownId === member.id && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-md border z-50">
                    {(["admin", "user"] as const).map((roleOption) => (
                      <div
                        key={roleOption}
                        onClick={() => {
                          toggleDropdown(member.id);
                          handleRoleChange(member.id, roleOption);
                        }}
                        className={`px-4 py-2 text-sm cursor-pointer hover:bg-gray-100 ${
                          member.role === roleOption
                            ? "font-semibold text-primary"
                            : ""
                        }`}
                      >
                        {roleLabel[roleOption]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EquipeTab;
