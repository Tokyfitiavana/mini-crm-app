import { useEffect, useState } from "react";

type TeamMember = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  avatar: string;
};

const EquipeTab = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const res = await fetch("http://localhost:3001/api/team");
        if (!res.ok) throw new Error("Erreur lors du chargement de l'équipe");
        const data = await res.json();

        const teamWithAvatars = data.map((member: any) => ({
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
  }, []);

  const handleRoleChange = async (memberId: number, newRole: "admin" | "user") => {
    // Optimistic UI update
    setTeam((prevTeam) =>
      prevTeam.map((member) =>
        member.id === memberId ? { ...member, role: newRole } : member
      )
    );

    try {
      const res = await fetch(`http://localhost:3001/api/team/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        throw new Error("Impossible de mettre à jour le rôle");
      }
    } catch (err) {
      alert("Erreur lors de la mise à jour du rôle");
      // Revert UI update si erreur
      setTeam((prevTeam) =>
        prevTeam.map((member) =>
          member.id === memberId ? { ...member, role: newRole === "admin" ? "user" : "admin" } : member
        )
      );
    }
  };

  if (loading) return <p>Chargement de l'équipe...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-text-primary">Gestion de l'équipe</h2> 
      </div>

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
                <p className="font-semibold text-text-primary">{member.name}</p>
                <p className="text-sm text-text-secondary">{member.email}</p>
              </div>
            </div>

            <div>
              <select
                value={member.role}
                onChange={(e) =>
                  handleRoleChange(member.id, e.target.value as "admin" | "user")
                }
                className="bg-bg border border-border text-text-primary text-sm rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="admin">Administrateur</option>
                <option value="user">Utilisateur</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EquipeTab;
