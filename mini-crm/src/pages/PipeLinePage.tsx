import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';


type Opportunity = { id: string; title: string; clientName: string; value: number; };
type Column = { id: string; title: string; opportunities: Opportunity[]; };
type Columns = Record<string, Column>;


const initialColumns: Columns = {
  'col-1': { id: 'col-1', title: 'Nouveau', opportunities: [
    { id: 'opp-1', title: 'Refonte site e-commerce', clientName: 'Tech Corp', value: 15000 },
    { id: 'opp-2', title: 'Campagne marketing T3', clientName: 'Marketing Pro', value: 7500 },
  ]},
  'col-2': { id: 'col-2', title: 'Proposition Envoyée', opportunities: [
    { id: 'opp-3', title: 'Contrat de maintenance', clientName: 'Innovate Bio', value: 5000 },
  ]},
  'col-3': { id: 'col-3', title: 'Négociation', opportunities: [] },
  'col-4': { id: 'col-4', title: 'Gagné', opportunities: [
    { id: 'opp-4', title: 'Prestation de conseil', clientName: 'Science SARL', value: 2500 },
  ]},
};

const PipelinePage = () => {
  const [columns, setColumns] = useState<Columns>(initialColumns);

  const onDragEnd = (result: any) => {
    const { source, destination } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId) {
    
      const column = columns[source.droppableId];
      const newOpps = Array.from(column.opportunities);
      const [removed] = newOpps.splice(source.index, 1);
      newOpps.splice(destination.index, 0, removed);
      setColumns({ ...columns, [source.droppableId]: { ...column, opportunities: newOpps } });
    } else {
    
      const sourceColumn = columns[source.droppableId];
      const destColumn = columns[destination.droppableId];
      const sourceOpps = Array.from(sourceColumn.opportunities);
      const destOpps = Array.from(destColumn.opportunities);
      const [removed] = sourceOpps.splice(source.index, 1);
      destOpps.splice(destination.index, 0, removed);
      setColumns({
        ...columns,
        [source.droppableId]: { ...sourceColumn, opportunities: sourceOpps },
        [destination.droppableId]: { ...destColumn, opportunities: destOpps },
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8 h-full flex flex-col">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-text-primary">Pipeline des Opportunités</h1>
          <button className="flex items-center gap-2 bg-primary text-white py-2 px-4 rounded-lg"><Plus size={18}/> Nouvelle Opportunité</button>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 overflow-x-auto flex-grow pb-4">
            {Object.values(columns).map(column => (
              <Droppable key={column.id} droppableId={column.id}>
                {(provided) => (
                  <div 
                    ref={provided.innerRef} 
                    {...provided.droppableProps}
                    className="w-72 bg-card rounded-lg shadow flex-shrink-0 flex flex-col"
                  >
                    <h3 className="p-4 text-lg font-semibold border-b border-border">{column.title} <span className="text-sm text-text-secondary">{column.opportunities.length}</span></h3>
                    <div className="p-2 overflow-y-auto flex-grow">
                      {column.opportunities.map((opp, index) => (
                        <Draggable key={opp.id} draggableId={opp.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-bg p-3 mb-2 rounded-md border border-border shadow-sm"
                            >
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
    </DashboardLayout>
  );
};

export default PipelinePage;