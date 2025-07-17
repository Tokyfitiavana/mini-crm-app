import { useState, useEffect } from 'react';
import axios from 'axios';
import DashboardLayout from '../components/DashboardLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import Swal from '../utils/swal';
import OpportunityForm from '../components/ui/OpportunityForm';

type Client = { id: number; name: string; };
type ApiOpportunity = { id: number; title: string; clientName: string | null; value: number; status: string; };
type Opportunity = { id: string; title: string; clientName: string; value: number; };
type Column = { id: string; title: string; opportunities: Opportunity[]; };
type Columns = Record<string, Column>;

const PipelinePage = () => {
  const [columns, setColumns] = useState<Columns>({});
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) throw new Error("Token d'authentification non trouvé.");

        const [oppsResponse, clientsResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/opportunities', { headers: { 'Authorization': `Bearer ${token}` } }),
          axios.get('http://localhost:3001/api/clients', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const opportunitiesData: ApiOpportunity[] = oppsResponse.data;
        const newColumns: Columns = {
          'Nouveau': { id: 'Nouveau', title: 'Nouveau', opportunities: [] },
          'Proposition Envoyée': { id: 'Proposition Envoyée', title: 'Proposition Envoyée', opportunities: [] },
          'Négociation': { id: 'Négociation', title: 'Négociation', opportunities: [] },
          'Gagné': { id: 'Gagné', title: 'Gagné', opportunities: [] },
          'Perdu': { id: 'Perdu', title: 'Perdu', opportunities: [] },
        };

        if (Array.isArray(opportunitiesData)) {
          opportunitiesData.forEach(opp => {
            if (newColumns[opp.status]) {
              newColumns[opp.status].opportunities.push({
                id: opp.id.toString(),
                title: opp.title,
                clientName: opp.clientName || 'N/A',
                value: opp.value,
              });
            }
          });
        }
        setColumns(newColumns);
        setClients(clientsResponse.data);

      } catch (error: any) {
        const message = error.response?.data?.message || error.message || 'Impossible de charger les données.';
        Swal.fire({ icon: 'error', title: 'Erreur', text: message });
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    const newColumns = { ...columns };
    const startCol = newColumns[source.droppableId];
    const endCol = newColumns[destination.droppableId];
    
    const [movedOpp] = startCol.opportunities.splice(source.index, 1);
    endCol.opportunities.splice(destination.index, 0, movedOpp);

    setColumns(newColumns);
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Authentification requise.' });
      return;
    }

    axios.put(
      `http://localhost:3001/api/opportunities/${draggableId}/move`, 
      { status: destination.droppableId, order: destination.index },
      { headers: { 'Authorization': `Bearer ${token}` } }
    ).catch(err => {
      console.error("Erreur lors de la mise à jour", err);
      Swal.fire({ icon: 'error', title: 'Oops...', text: 'La modification n\'a pas pu être sauvegardée.' });
    });
  };

  const handleAddSubmit = async (formData: { title: string; value: number; client_id?: string; }) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) throw new Error("Non authentifié");

      const dataToSubmit = { ...formData, status: 'Nouveau', client_id: formData.client_id ? Number(formData.client_id) : null };

      const response = await axios.post<ApiOpportunity>('http://localhost:3001/api/opportunities', dataToSubmit, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const newOpp = response.data;
      const newCard: Opportunity = {
        id: newOpp.id.toString(),
        title: newOpp.title,
        clientName: clients.find(c => c.id === newOpp.id)?.name || 'N/A',
        value: newOpp.value,
      };

      setColumns(prev => {
        const updatedNouveauOpps = [...prev['Nouveau'].opportunities, newCard];
        return { ...prev, 'Nouveau': { ...prev['Nouveau'], opportunities: updatedNouveauOpps }};
      });

      setIsFormOpen(false);
      Swal.fire({ icon: 'success', title: 'Succès', text: 'Opportunité ajoutée !' });

    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: "L'opportunité n'a pas pu être ajoutée." });
    }
  };

  if (isLoading) {
    return <DashboardLayout><div className="p-8 text-center text-text-secondary">Chargement du pipeline...</div></DashboardLayout>;
  }

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Pipeline des Opportunités</h1>
          <button onClick={() => setIsFormOpen(true)} className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90"><Plus size={18}/> Nouvelle Opportunité</button>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto flex-grow pb-4">
            {Object.values(columns).map(column => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps} className="w-72 bg-card rounded-lg shadow flex-shrink-0 flex flex-col">
                    <h3 className="p-4 text-lg font-semibold border-b border-border">{column.title} <span className="text-sm text-text-secondary">{column.opportunities.length}</span></h3>
                    <div className="p-2 overflow-y-auto flex-grow">
                      {column.opportunities.map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id} index={index}>
                          {(provided) => (
                            <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className="bg-bg p-3 mb-2 rounded-md border border-border shadow-sm cursor-grab active:cursor-grabbing">
                              <p className="font-semibold text-text-primary">{opp.title}</p>
                              <p className="text-sm text-text-secondary">{opp.clientName}</p>
                              <p className="text-sm font-bold text-green-500 mt-2">{opp.value.toLocaleString('fr-FR')} €</p>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex justify-between items-center p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-text-primary">Nouvelle Opportunité</h2>
              <button onClick={() => setIsFormOpen(false)} className="text-text-secondary text-3xl hover:text-text-primary">&times;</button>
            </div>
            <div className="p-6">
              <OpportunityForm onClose={() => setIsFormOpen(false)} onSubmit={handleAddSubmit} clients={clients} />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default PipelinePage;