import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import {
  ChevronLeft,
  Edit,
  Mail,
  Phone,
  Building,
  Plus,
  MessageSquare,
} from "lucide-react";

type Client = {
  id: number;
  name: string;
  company?: string;
  email: string;
  phone?: string;
  status: "Actif" | "Inactif" | "Prospect";
  tags?: string[];
};

type Interaction = {
  id: number;
  type: "note" | "email" | "appel";
  content: string;
  date: string;
};

type Transaction = {
  id: number;
  description: string;
  amount: number;
  date: string;
};

const ClientDetailPage = () => {
  const { clientId } = useParams<{ clientId: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);

  // 👇 Pour l'instant on simule interactions/transactions si pas d’API
  const [interactions] = useState<Interaction[]>([
    {
      id: 1,
      type: "note",
      content: "Très intéressé par le produit X.",
      date: "05/07/2024",
    },
    {
      id: 2,
      type: "email",
      content: "Envoi du devis initial.",
      date: "02/07/2024",
    },
  ]);

  const [transactions] = useState<Transaction[]>([
    { id: 1, description: "Abonnement Pro", amount: 499, date: "01/06/2024" },
    { id: 2, description: "Conseil", amount: 1250, date: "15/05/2024" },
  ]);

  const totalSpent = transactions.reduce((sum, t) => sum + t.amount, 0);

  useEffect(() => {
    if (!clientId) return;

    fetch(`http://localhost:3001/api/clients/${clientId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Client introuvable");
        return res.json();
      })
      .then((data) => {
        setClient(data);
      })
      .catch((err) => {
        console.error(err);
        setClient(null);
      })
      .finally(() => setLoading(false));
  }, [clientId]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="text-center p-10">Chargement en cours...</div>
      </DashboardLayout>
    );
  }

  if (!client) {
    return (
      <DashboardLayout>
        <div className="text-center p-10">Client non trouvé.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Link
            to="/clients"
            className="flex items-center gap-2 text-text-secondary hover:text-text-primary mb-4"
          >
            <ChevronLeft size={20} />
            Retour à la liste des clients
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${client.name}`}
                alt="avatar"
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h1 className="text-3xl font-bold text-text-primary">
                  {client.name}
                </h1>
                <p className="text-text-secondary">{client.company}</p>
              </div>
            </div>
            <Link
              to={`/clients/modifier/${client.id}`}
              className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg"
            >
              <Edit size={18} />
              Modifier
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            {/* Infos contact */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">
                Informations de contact
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-text-secondary" />
                  <a
                    href={`mailto:${client.email}`}
                    className="text-primary hover:underline"
                  >
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

            {/* Statistiques */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">
                Statistiques Clés
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-text-secondary">Dépenses totales</span>
                  <span className="font-bold text-text-primary">
                    {totalSpent.toLocaleString("fr-FR")} €
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-secondary">Commandes</span>
                  <span className="font-bold text-text-primary">
                    {transactions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary border-b border-border pb-3 mb-4">
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {client.tags?.map((tag) => (
                  <span
                    key={tag}
                    className="bg-bg text-text-secondary text-xs font-semibold px-2.5 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                <button className="text-text-secondary hover:text-primary">
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Historique des interactions */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                Historique des interactions
              </h3>

              <div className="mb-4">
                <textarea
                  placeholder="Ajouter une nouvelle note..."
                  className="w-full bg-bg border-border rounded-md p-2 text-sm"
                  rows={2}
                ></textarea>
                <button className="bg-primary text-white py-1 px-3 rounded-md text-sm mt-2 float-right">
                  Ajouter la note
                </button>
              </div>

              <ul className="space-y-4 pt-4">
                {interactions.map((item) => (
                  <li key={item.id} className="flex gap-3">
                    <div className="bg-bg p-2 rounded-full h-fit">
                      <MessageSquare size={16} className="text-text-secondary" />
                    </div>
                    <div>
                      <p className="text-sm text-text-primary">{item.content}</p>
                      <p className="text-xs text-text-secondary mt-1">{item.date}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientDetailPage;
