import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import DashboardLayout from "../components/DashboardLayout";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import type { DropResult } from "@hello-pangea/dnd";
import { Plus, Trash } from "lucide-react";
import Swal from "../utils/swal";
import OpportunityForm from "../components/ui/OpportunityForm";

interface Client {
  id: number;
  name: string;
}
interface ApiOpportunity {
  id: number;
  title: string;
  clientName: string | null;
  value: number;
  status: string;
}
interface Opportunity {
  id: string;
  title: string;
  clientName: string;
  value: number;
}
interface Column {
  id: string;
  title: string;
  opportunities: Opportunity[];
}
type Columns = Record<string, Column>;

const PIPELINE_STAGES: Array<{ id: string; title: string }> = [
  { id: "Nouveau", title: "Nouveau" },
  { id: "Proposition Envoyée", title: "Proposition Envoyée" },
  { id: "Négociation", title: "Négociation" },
  { id: "Gagné", title: "Gagné" },
  { id: "Perdu", title: "Perdu" },
];

const PipelinePage = () => {
  const [columns, setColumns] = useState<Columns>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const buildEmptyColumns = useCallback((): Columns => {
    const base: Columns = {};
    PIPELINE_STAGES.forEach(({ id, title }) => {
      base[id] = { id, title, opportunities: [] };
    });
    return base;
  }, []);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("authToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const [oppsResponse, clientsResponse] = await Promise.all([
        axios.get("http://localhost:3001/api/opportunities", config),
        axios.get("http://localhost:3001/api/clients", config),
      ]);

      const newColumns = buildEmptyColumns();
      (oppsResponse.data as ApiOpportunity[]).forEach((opp) => {
        if (newColumns[opp.status]) {
          newColumns[opp.status].opportunities.push({
            id: String(opp.id),
            title: opp.title,
            clientName: opp.clientName || "N/A",
            value: opp.value,
          });
        }
      });

      Object.values(newColumns).forEach((col) =>
        col.opportunities.sort((a, b) => b.value - a.value)
      );

      setColumns(newColumns);
      setClients(clientsResponse.data);
    } catch (error: any) {
      Swal.fire({ icon: "error", title: "Erreur", text: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [buildEmptyColumns]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredColumns = useMemo(() => {
    if (!searchTerm.trim()) return columns;
    const q = searchTerm.toLowerCase();
    const next: Columns = {};
    Object.values(columns).forEach((col) => {
      next[col.id] = {
        ...col,
        opportunities: col.opportunities.filter(
          (o) =>
            o.title.toLowerCase().includes(q) ||
            o.clientName.toLowerCase().includes(q)
        ),
      };
    });
    return next;
  }, [columns, searchTerm]);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const prevState = structuredClone(columns);

    const newState = structuredClone(columns);
    const startCol = newState[source.droppableId];
    const endCol = newState[destination.droppableId];

    const [moved] = startCol.opportunities.splice(source.index, 1);
    endCol.opportunities.splice(destination.index, 0, moved);
    setColumns(newState);

    try {
      const token = localStorage.getItem("authToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      await axios.put(
        `http://localhost:3001/api/opportunities/${draggableId}/move`,
        { status: destination.droppableId, order: destination.index },
        config
      );
    } catch {
      setColumns(prevState);
      Swal.fire("Erreur", "Le déplacement a échoué.", "error");
    }
  };

  const formatEUR = (n: number) =>
    n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });

  const handleAddSubmit = async (formData: {
    title: string;
    value: number;
    client_id?: string;
  }) => {
    try {
      const token = localStorage.getItem("authToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      const dataToSubmit = {
        ...formData,
        status: "Nouveau",
        client_id: formData.client_id ? Number(formData.client_id) : null,
      };
      const res = await axios.post<ApiOpportunity>(
        "http://localhost:3001/api/opportunities",
        dataToSubmit,
        config
      );
      const newOpp = res.data;

      const newCard: Opportunity = {
        id: String(newOpp.id),
        title: newOpp.title,
        clientName: newOpp.clientName || "N/A",
        value: newOpp.value,
      };

      setColumns((prev) => ({
        ...prev,
        Nouveau: {
          ...prev["Nouveau"],
          opportunities: [newCard, ...prev["Nouveau"].opportunities],
        },
      }));
      setIsFormOpen(false);
      Swal.fire("Succès", "Opportunité ajoutée", "success");
    } catch (err: any) {
      Swal.fire("Erreur", err.message, "error");
    }
  };

  const deleteOpportunity = async (columnId: string, id: string) => {
    const confirm = await Swal.fire({
      title: "Supprimer ?",
      text: "Cette opportunité sera supprimée.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Oui",
      cancelButtonText: "Annuler",
    });
    if (!confirm.isConfirmed) return;

    const prev = structuredClone(columns);
    setColumns((p) => {
      const updated = p[columnId].opportunities.filter((o) => o.id !== id);
      return { ...p, [columnId]: { ...p[columnId], opportunities: updated } };
    });

    try {
      const token = localStorage.getItem("authToken");
      const config = token
        ? { headers: { Authorization: `Bearer ${token}` } }
        : undefined;

      await axios.delete(
        `http://localhost:3001/api/opportunities/${id}`,
        config
      );
      Swal.fire("Supprimé", "", "success");
    } catch {
      setColumns(prev);
      Swal.fire("Erreur", "Suppression échouée.", "error");
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 text-black dark:text-white bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher une opportunité ou un client…"
                className="pl-3 pr-8 py-2 w-[320px] max-w-full border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 dark:text-white"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  title="Effacer"
                >
                  ×
                </button>
              )}
            </div>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary text-white w-[2cm] h-[1cm] rounded flex items-center justify-center"
              title="Nouvelle opportunité"
            >
              <Plus size={18} />
              <span className="sr-only">Nouvelle opportunité</span>
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto">
            {PIPELINE_STAGES.map((s) => (
              <div
                key={s.id}
                className="w-72 bg-white dark:bg-gray-800 rounded shadow p-3 flex-shrink-0"
              >
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-700 rounded mb-3 animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-20 bg-gray-100 dark:bg-gray-700 rounded mb-2 animate-pulse"
                  />
                ))}
              </div>
            ))}
          </div>
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-2">
              {PIPELINE_STAGES.map(({ id, title }) => {
                const col = filteredColumns[id] || {
                  id,
                  title,
                  opportunities: [],
                };
                return (
                  <Droppable droppableId={id} key={id}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`w-72 rounded shadow p-3 flex-shrink-0 transition-colors ${
                          snapshot.isDraggingOver
                            ? "bg-blue-50 dark:bg-blue-900/30"
                            : "bg-white dark:bg-gray-800"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h2 className="font-semibold text-lg">
                            {title} ({columns[id]?.opportunities.length ?? 0})
                          </h2>
                        </div>

                        {col.opportunities.length === 0 ? (
                          <div className="text-gray-400 text-sm italic p-2">
                            Aucune opportunité
                          </div>
                        ) : (
                          col.opportunities.map((opp, i) => (
                            <Draggable
                              key={opp.id}
                              draggableId={opp.id}
                              index={i}
                            >
                              {(prov, snap) => (
                                <div
                                  ref={prov.innerRef}
                                  {...prov.draggableProps}
                                  {...prov.dragHandleProps}
                                  className={`border dark:border-gray-600 p-3 rounded mb-2 bg-white dark:bg-gray-700 shadow-sm transition ${
                                    snap.isDragging
                                      ? "ring-2 ring-primary/60"
                                      : ""
                                  }`}
                                >
                                  <div className="flex justify-between items-start gap-3">
                                    <div className="min-w-0">
                                      <p className="font-semibold truncate">
                                        {opp.title}
                                      </p>
                                      <p className="text-sm text-gray-500 dark:text-gray-300 truncate">
                                        {opp.clientName}
                                      </p>
                                      <p className="text-green-600 font-bold">
                                        {formatEUR(opp.value)}
                                      </p>
                                    </div>
                                    <button
                                      onClick={() =>
                                        deleteOpportunity(id, opp.id)
                                      }
                                      className="text-red-600 hover:text-red-700"
                                      title="Supprimer"
                                    >
                                      <Trash size={18} />
                                    </button>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          ))
                        )}

                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                );
              })}
            </div>
          </DragDropContext>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
              <h3 className="text-xl font-bold">Nouvelle Opportunité</h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-gray-500 dark:text-gray-300 text-xl"
                title="Fermer"
              >
                &times;
              </button>
            </div>
            <div className="p-4">
              <OpportunityForm
                clients={clients}
                onSubmit={handleAddSubmit}
                onClose={() => setIsFormOpen(false)}
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PipelinePage;
