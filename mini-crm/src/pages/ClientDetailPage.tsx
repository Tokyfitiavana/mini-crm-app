import { useEffect, useState, type FormEvent } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import {
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  Building,
  MessageSquare,
  Plus,
  CalendarPlus,
} from "lucide-react";
import Swal from "../utils/swal";

type Client = {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: string;
  assignedUserName?: string | null;
};
type Interaction = {
  id: number;
  type: string;
  content: string;
  date: string;
  userName: string;
};

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<Client | null>(null);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!clientId) return;
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        if (!token) throw new Error("Non authentifié");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [clientRes, interactionsRes] = await Promise.all([
          axios.get(`http://localhost:3001/api/clients/${clientId}`, config),
          axios.get(
            `http://localhost:3001/api/interactions/client/${clientId}`,
            config
          ),
        ]);
        setClient(clientRes.data);
        setInteractions(interactionsRes.data);
      } catch (err: any) {
        const message =
          err.response?.data?.message ||
          err.message ||
          "Impossible de charger les données du client.";
        Swal.fire("Erreur", message, "error");
        setClient(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clientId]);

  const handleAddNote = async (e: FormEvent) => {
    e.preventDefault();
    if (newNote.trim() === "") return;
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(
        "http://localhost:3001/api/interactions",
        { clientId: client?.id, content: newNote },
        config
      );
      setInteractions((prev) => [response.data, ...prev]);
      setNewNote("");
    } catch {
      Swal.fire("Erreur", "La note n'a pas pu être ajoutée.", "error");
    }
  };

  const statusColor: Record<string, string> = {
    Actif: "bg-green-500",
    Inactif: "bg-red-500",
    Prospect: "bg-yellow-500",
  };
  const lastInteraction =
    interactions.length > 0
      ? new Date(
          Math.max(...interactions.map((i) => new Date(i.date).getTime()))
        )
      : null;

  if (loading)
    return (
      <DashboardLayout>
        <div className="text-center p-10 text-text-secondary">Chargement...</div>
      </DashboardLayout>
    );

  if (!client)
    return (
      <DashboardLayout>
        <div className="text-center p-10 text-text-secondary">
          Client non trouvé.{" "}
          <Link to="/clients" className="text-primary underline">
            Retourner à la liste
          </Link>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sticky top-0 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
          <div className="flex items-center justify-between py-2">
            <button
              onClick={() => navigate("/clients")}
              className="flex items-center gap-2 text-text-secondary hover:text-text-primary"
            >
              <ChevronLeft size={20} />
              Retour
            </button>
            <div className="flex items-center gap-2">
              <a
                href={`tel:${client.phone ?? ""}`}
                title="Appeler"
                className="w-10 h-10 rounded-md flex items-center justify-center bg-card text-text-primary"
              >
                <Phone size={18} />
              </a>
              <a
                href={`mailto:${client.email}`}
                title="Envoyer un email"
                className="w-10 h-10 rounded-md flex items-center justify-center bg-card text-text-primary"
              >
                <Mail size={18} />
              </a>
              <button
                onClick={() => {
                  const el = document.getElementById("new-note-textarea");
                  if (el) el.focus();
                }}
                title="Nouvelle note"
                className="w-10 h-10 rounded-md flex items-center justify-center bg-card text-text-primary"
              >
                <MessageSquare size={18} />
              </button>
              <Link
                to="/rappels"
                title="Créer un rappel"
                className="w-10 h-10 rounded-md flex items-center justify-center bg-card text-text-primary"
              >
                <CalendarPlus size={18} />
              </Link>
              <Link
                to={`/clients/modifier/${client.id}`}
                className="ml-1 flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg"
              >
                <Edit size={18} />
                Modifier
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-lg shadow p-5 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                alt="avatar"
                className="w-16 h-16 rounded-full"
              />
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                    {client.name}
                  </h1>
                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-semibold bg-bg text-text-secondary">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        statusColor[client.status] || "bg-gray-400"
                      }`}
                    ></span>
                    {client.status}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  {client.company || "Entreprise non renseignée"}
                  {client.assignedUserName ? (
                    <span className="ml-3 inline-flex items-center gap-2">
                      <span>• Responsable :</span>
                      <span className="font-medium text-text-primary">
                        {client.assignedUserName}
                      </span>
                    </span>
                  ) : (
                    <span className="ml-3">• Responsable : Non assigné</span>
                  )}
                </div>
              </div>
            </div>
            <Link
              to="/pipeline"
              className="hidden md:inline-flex items-center justify-center w-[2.2cm] h-[1cm] rounded-md bg-primary text-white"
              title="Nouvelle opportunité"
            >
              <Plus size={18} />
              <span className="sr-only">Nouvelle opportunité</span>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="rounded-md bg-bg px-3 py-2">
              <div className="text-text-secondary">Email</div>
              <a href={`mailto:${client.email}`} className="font-medium text-text-primary break-all">
                {client.email}
              </a>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <div className="text-text-secondary">Téléphone</div>
              <div className="font-medium text-text-primary">{client.phone || "—"}</div>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <div className="text-text-secondary">Dernière interaction</div>
              <div className="font-medium text-text-primary">
                {lastInteraction ? lastInteraction.toLocaleDateString("fr-FR") : "—"}
              </div>
            </div>
            <div className="rounded-md bg-bg px-3 py-2">
              <div className="text-text-secondary">Interactions</div>
              <div className="font-medium text-text-primary">{interactions.length}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Ajouter une note</h3>
              <form onSubmit={handleAddNote}>
                <div className="flex items-end gap-3">
                  <textarea
                    id="new-note-textarea"
                    placeholder="Saisir une note…"
                    className="w-full bg-bg border border-border rounded-md p-3 text-sm text-text-primary min-h-[80px]"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="w-[2cm] h-[1cm] bg-primary text-white rounded-md flex items-center justify-center"
                    title="Ajouter la note"
                  >
                    <Plus size={18} />
                    <span className="sr-only">Ajouter la note</span>
                  </button>
                </div>
              </form>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Historique des interactions</h3>
              <ul className="space-y-4">
                {interactions.length > 0 ? (
                  interactions.map((item) => (
                    <li key={item.id} className="flex gap-3">
                      <div className="bg-bg p-3 rounded-full h-fit">
                        <MessageSquare size={16} className="text-text-secondary" />
                      </div>
                      <div>
                        <div className="text-xs text-text-secondary">
                          {new Date(item.date).toLocaleDateString("fr-FR", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          — {item.userName || "Utilisateur inconnu"}
                        </div>
                        <p className="text-sm text-text-primary mt-1">{item.content}</p>
                      </div>
                    </li>
                  ))
                ) : (
                  <p className="text-sm text-text-secondary text-center py-4">Aucune interaction enregistrée.</p>
                )}
              </ul>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Coordonnées</h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-text-secondary" />
                  <a href={`mailto:${client.email}`} className="text-primary underline-offset-2 hover:underline">
                    {client.email}
                  </a>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-text-secondary" />
                  <span>{client.phone || "Non renseigné"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Building size={16} className="text-text-secondary" />
                  <span>{client.company || "Non renseigné"}</span>
                </li>
              </ul>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-3">Actions rapides</h3>
              <div className="grid grid-cols-3 gap-3">
                <a
                  href={`tel:${client.phone ?? ""}`}
                  className="h-10 rounded-md flex items-center justify-center bg-bg text-text-primary"
                  title="Appeler"
                >
                  <Phone size={18} />
                </a>
                <a
                  href={`mailto:${client.email}`}
                  className="h-10 rounded-md flex items-center justify-center bg-bg text-text-primary"
                  title="Email"
                >
                  <Mail size={18} />
                </a>
                <Link
                  to="/rappels"
                  className="h-10 rounded-md flex items-center justify-center bg-bg text-text-primary"
                  title="Créer un rappel"
                >
                  <CalendarPlus size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;
