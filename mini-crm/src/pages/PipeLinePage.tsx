import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2 } from 'lucide-react';
import Swal from '../utils/swal';
import OpportunityForm from '../components/ui/OpportunityForm';

interface Client { id: number; name: string; }
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
interface Column { id: string; title: string; opportunities: Opportunity[]; }
interface Columns { [key: string]: Column; }

const PipelinePage = () => {
  const [columns, setColumns] = useState<Columns>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const [oppsResponse, clientsResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/opportunities', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('http://localhost:3001/api/clients', { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        const newColumns: Columns = {
          'Nouveau': { id: 'Nouveau', title: 'Nouveau', opportunities: [] },
          'Proposition Envoyée': { id: 'Proposition Envoyée', title: 'Proposition Envoyée', opportunities: [] },
          'Négociation': { id: 'Négociation', title: 'Négociation', opportunities: [] },
          'Gagné': { id: 'Gagné', title: 'Gagné', opportunities: [] },
          'Perdu': { id: 'Perdu', title: 'Perdu', opportunities: [] },
        };

        oppsResponse.data.forEach((opp: ApiOpportunity) => {
          const col = newColumns[opp.status];
          if (col) {
            col.opportunities.push({
              id: opp.id.toString(),
              title: opp.title,
              clientName: opp.clientName || 'N/A',
              value: opp.value,
            });
          }
        });

        setColumns(newColumns);
        setClients(clientsResponse.data);
      } catch (error: any) {
        Swal.fire({ icon: 'error', title: 'Erreur', text: error.message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newColumns = { ...columns };
    const startCol = newColumns[source.droppableId];
    const endCol = newColumns[destination.droppableId];

    const [movedOpp] = startCol.opportunities.splice(source.index, 1);
    endCol.opportunities.splice(destination.index, 0, movedOpp);
    setColumns(newColumns);

    const token = localStorage.getItem('authToken');
    await axios.put(
      `http://localhost:3001/api/opportunities/${draggableId}/move`,
      {
        status: destination.droppableId,
        order: destination.index,
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );
  };

  const handleAddSubmit = async (formData: { title: string; value: number; client_id?: string }) => {
    try {
      const token = localStorage.getItem('authToken');
      const dataToSubmit = {
        ...formData,
        status: 'Nouveau',
        client_id: formData.client_id ? Number(formData.client_id) : null,
      };
      const res = await axios.post<ApiOpportunity>('http://localhost:3001/api/opportunities', dataToSubmit, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const newOpp = res.data;

      const newCard: Opportunity = {
        id: newOpp.id.toString(),
        title: newOpp.title,
        clientName: newOpp.clientName || 'N/A',
        value: newOpp.value,
      };

      setColumns(prev => ({
        ...prev,
        'Nouveau': {
          ...prev['Nouveau'],
          opportunities: [...prev['Nouveau'].opportunities, newCard],
        },
      }));
      setIsFormOpen(false);
      Swal.fire('Succès', 'Opportunité ajoutée', 'success');
    } catch (err: any) {
      Swal.fire('Erreur', err.message, 'error');
    }
  };

  const deleteOpportunity = async (columnId: string, id: string) => {
    const confirm = await Swal.fire({
      title: 'Supprimer ?',
      text: 'Cette opportunité sera supprimée.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Oui',
    });
    if (!confirm.isConfirmed) return;

    const token = localStorage.getItem('authToken');
    await axios.delete(`http://localhost:3001/api/opportunities/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setColumns(prev => {
      const updated = prev[columnId].opportunities.filter(o => o.id !== id);
      return { ...prev, [columnId]: { ...prev[columnId], opportunities: updated } };
    });
    Swal.fire('Supprimé', '', 'success');
  };

  const filtered = (ops: Opportunity[]) =>
    ops.filter(o =>
      o.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <DashboardLayout>
      <div className="p-6 text-black dark:text-white bg-gray-100 dark:bg-gray-900 min-h-screen">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <button onClick={() => setIsFormOpen(true)} className="bg-primary text-white px-4 py-2 rounded flex items-center gap-2">
            <Plus size={16} /> Nouvelle
          </button>
        </div>

        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher..."
          className="mb-4 px-4 py-2 w-full border border-gray-300 dark:border-gray-700 rounded bg-white dark:bg-gray-800 dark:text-white"
        />

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto">
            {Object.values(columns).map(col => (
              <Droppable droppableId={col.id} key={col.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="w-72 bg-white dark:bg-gray-800 rounded shadow p-3 flex-shrink-0"
                  >
                    <h2 className="font-semibold text-lg mb-2">
                      {col.title} ({col.opportunities.length})
                    </h2>
                    {filtered(col.opportunities).map((opp, i) => (
                      <Draggable key={opp.id} draggableId={opp.id} index={i}>
                        {(prov) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            className="border dark:border-gray-600 p-3 rounded mb-2 shadow-sm bg-white dark:bg-gray-700"
                          >
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="font-semibold">{opp.title}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-300">{opp.clientName}</p>
                                <p className="text-green-600 font-bold">{opp.value.toLocaleString()} €</p>
                              </div>
                              <button onClick={() => deleteOpportunity(col.id, opp.id)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-lg">
            <div className="flex justify-between items-center p-4 border-b dark:border-gray-600">
              <h3 className="text-xl font-bold">Nouvelle Opportunité</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-500 dark:text-gray-300 text-xl">&times;</button>
            </div>
            <div className="p-4">
              <OpportunityForm clients={clients} onSubmit={handleAddSubmit} onClose={() => setIsFormOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PipelinePage;
