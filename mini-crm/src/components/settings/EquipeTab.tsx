import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";
import Swal from "../../utils/swal";
import { PlusCircle } from "lucide-react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar: string;
};

const EquipeTab = () => {
  const { user: currentUser, token } = useAuth();
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get("http://localhost:3001/api/team", config);
        
        const teamWithAvatars = response.data.map((member: any) => ({
          ...member,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`,
        }));
        
        setTeam(teamWithAvatars);
        setError(null);
      } catch (err: any) {
        setError(err.message || "Erreur réseau");
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, [token]);

  const handleRoleChange = async (memberId: number, newRole: "admin" | "user") => {
    const originalTeam = [...team];
    setTeam((prevTeam) =>
      prevTeam.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );

    try {
      if (!token) throw new Error("Non authentifié");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.patch(`http://localhost:3001/api/team/${memberId}/role`, { role: newRole }, config);
      Swal.fire('Succès', 'Le rôle a été mis à jour.', 'success');
    } catch (err) {
      Swal.fire('Erreur', "Impossible de mettre à jour le rôle.", 'error');
      setTeam(originalTeam);
    }
  };

  if (loading) return <p>Chargement de l'équipe...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Gestion de l'équipe</h2>
        <button className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg text-sm hover:opacity-90">
            <PlusCircle size={18} />
            Inviter un membre
        </button>
      </div>

      <div className="space-y-4">
        {team.map((member) => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-bg rounded-lg">
            <div className="flex items-center gap-4">
              <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-semibold text-text-primary">{member.name}</p>
                <p className="text-sm text-text-secondary">{member.email}</p>
              </div>
            </div>

            <div>
              {currentUser?.id === member.id ? (
                <span className="px-3 py-1 text-sm font-medium text-text-secondary bg-gray-700 rounded-md">C'est vous</span>
              ) : (
                <select
                  value={member.role}
                  onChange={(e) => handleRoleChange(member.id, e.target.value as "admin" | "user")}
                  className="bg-bg border border-border text-text-primary text-sm rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="admin">Administrateur</option>
                  <option value="user">Utilisateur</option>
                </select>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipeTab;