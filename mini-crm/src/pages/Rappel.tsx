import { useEffect, useState, type FormEvent } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Bell,
  PlusCircle,
  Tag,
  CheckCircle,
  Circle,
  Trash2,
  Search,
} from "lucide-react";
import Swal from "../utils/swal";
import axios from "axios";

// Types

type Rappel = {
  id: number;
  title: string;
  dueDate: Date;
  clientName?: string | null;
  isCompleted: boolean;
};

type Client = {
  id: number;
  name: string;
};

const formatDateGroup = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date();
  today.setHours(0, 0, 0, 0);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const given = new Date(date);
  given.setHours(0, 0, 0, 0);

  if (given.getTime() === today.getTime()) return "Aujourd'hui";
  if (given.getTime() === tomorrow.getTime()) return "Demain";
  return given.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const Rappels = () => {
  const [rappels, setRappels] = useState<Rappel[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [newRappelTitle, setNewRappelTitle] = useState("");
  const [selectedClientId, setSelectedClientId] = useState("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [hideCompleted, setHideCompleted] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [rappelsRes, clientsRes] = await Promise.all([
          axios.get("http://localhost:3001/api/rappels", config),
          axios.get("http://localhost:3001/api/clients", config),
        ]);
        setRappels(
          rappelsRes.data.map((r: any) => ({
            id: r.id,
            title: r.title,
            dueDate: new Date(r.due_date),
            clientName: r.clientName,
            isCompleted: !!r.is_completed,
          }))
        );
        setClients(clientsRes.data);
      } catch (err) {
        console.error("Erreur lors du chargement des données", err);
      }
    };
    fetchData();
  }, []);

  const handleAddRappel = async (e: FormEvent) => {
    e.preventDefault();
    if (newRappelTitle.trim() === "") return;

    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const dataToSubmit = {
        title: newRappelTitle,
        dueDate: selectedDate || new Date().toISOString().split("T")[0],
        clientId: selectedClientId ? Number(selectedClientId) : null,
      };
      const response = await axios.post(
        "http://localhost:3001/api/rappels",
        dataToSubmit,
        config
      );
      const newRappelData = response.data;
      const newRappel: Rappel = {
        id: newRappelData.id,
        title: newRappelData.title,
        dueDate: new Date(newRappelData.due_date),
        clientName:
          clients.find((c) => c.id === Number(selectedClientId))?.name || null,
        isCompleted: false,
      };
      setRappels((prev) => [newRappel, ...prev]);
      setNewRappelTitle("");
      setSelectedClientId("");
      setSelectedDate("");
    } catch (err) {
      Swal.fire("Erreur", "Le rappel n'a pas pu être ajouté.", "error");
    }
  };

  const toggleRappel = async (id: number) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.put(
        `http://localhost:3001/api/rappels/${id}/toggle`,
        {},
        config
      );
      setRappels((prev) =>
        prev.map((r) =>
          r.id === id ? { ...r, isCompleted: !r.isCompleted } : r
        )
      );
    } catch (err) {
      Swal.fire(
        "Erreur",
        "Le statut du rappel n'a pas pu être mis à jour.",
        "error"
      );
    }
  };

  const handleDeleteRappel = async (id: number) => {
    const result = await Swal.fire({
      title: "Êtes-vous sûr ?",
      text: "Ce rappel sera supprimé définitivement.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui, supprimer !",
      cancelButtonText: "Annuler",
    });
    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem("authToken");
        await axios.delete(`http://localhost:3001/api/rappels/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRappels((prev) => prev.filter((r) => r.id !== id));
        Swal.fire("Supprimé !", "Le rappel a été supprimé.", "success");
      } catch (err) {
        Swal.fire("Erreur", "Le rappel n'a pas pu être supprimé.", "error");
      }
    }
  };

  const filteredRappels = rappels.filter((r) => {
    const matchTitle = r.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchClient =
      r.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
    const visible = searchTerm === "" || matchTitle || matchClient;
    const show = hideCompleted ? !r.isCompleted : true;
    return visible && show;
  });

  const groupedRappels = filteredRappels.reduce((acc, rappel) => {
    const dateKey = formatDateGroup(rappel.dueDate);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(rappel);
    return acc;
  }, {} as Record<string, Rappel[]>);

  const sortedGroupKeys = Object.keys(groupedRappels).sort((a, b) => {
    const dateA = groupedRappels[a][0].dueDate;
    const dateB = groupedRappels[b][0].dueDate;
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8">
          <Bell size={32} className="text-primary" />
          <h1 className="text-3xl font-bold text-text-primary">Rappels</h1>
        </div>

        {/* Barre de recherche et filtre */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2 w-full sm:w-1/2">
            <Search size={18} className="text-text-secondary" />
            <input
              type="text"
              placeholder="Rechercher par titre ou client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-transparent border-b border-border focus:outline-none py-2 text-text-primary"
            />
          </div>
          <label className="flex items-center gap-2 text-sm text-text-secondary">
            <input
              type="checkbox"
              checked={hideCompleted}
              onChange={() => setHideCompleted((prev) => !prev)}
              className="accent-primary"
            />
            Masquer les rappels terminés
          </label>
        </div>

        <form
          onSubmit={handleAddRappel}
          className="mb-8 p-4 bg-card rounded-lg shadow space-y-4"
        >
          <div className="flex items-center gap-2">
            <PlusCircle size={24} className="text-text-secondary" />
            <input
              type="text"
              value={newRappelTitle}
              onChange={(e) => setNewRappelTitle(e.target.value)}
              placeholder="Ajouter un nouveau rappel..."
              className="w-full bg-transparent focus:outline-none py-2 text-lg text-text-primary"
            />
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="bg-bg border border-border text-sm rounded-md px-3 py-1 outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">— Associer à un client —</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 border border-border rounded text-sm bg-bg text-text-primary dark:bg-muted dark:text-white"
            />
            <button
              type="submit"
              className="bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 flex items-center justify-center"
              title="Ajouter un rappel"
            >
              <PlusCircle size={20} />
              <span className="sr-only">Ajouter</span>
            </button>
          </div>
        </form>

        <div className="space-y-6">
          {sortedGroupKeys.length > 0 ? (
            sortedGroupKeys.map((dateKey) => (
              <div key={dateKey}>
                <h2 className="text-lg font-bold text-text-secondary mb-3 border-b border-border pb-2">
                  {dateKey}
                </h2>
                <ul className="space-y-2">
                  {groupedRappels[dateKey].map((rappel) => (
                    <li
                      key={rappel.id}
                      className="group flex items-center justify-between bg-card p-4 rounded-lg shadow"
                    >
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => toggleRappel(rappel.id)}
                          className="flex-shrink-0"
                        >
                          {rappel.isCompleted ? (
                            <CheckCircle size={24} className="text-green-500" />
                          ) : (
                            <Circle
                              size={24}
                              className="text-text-secondary hover:text-primary"
                            />
                          )}
                        </button>
                        <div>
                          <p
                            className={`text-text-primary ${
                              rappel.isCompleted
                                ? "line-through text-text-secondary"
                                : ""
                            }`}
                          >
                            {rappel.title}
                          </p>
                          {rappel.clientName && (
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                              <Tag size={12} /> <span>{rappel.clientName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleDeleteRappel(rappel.id)}
                        className="text-text-secondary hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={18} />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
              <p>Aucun rappel pour le moment.</p>
              <p className="text-sm">
                Utilisez le formulaire ci-dessus pour en ajouter un !
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Rappels;
