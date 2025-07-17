// src/components/OpportunityForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// Schéma de validation
const opportunitySchema = z.object({
  title: z.string().min(3, "Le titre est requis."),
  value: z.number({ invalid_type_error: "La valeur doit être un nombre." }).positive("La valeur doit être positive."),
  client_id: z.string().optional(), // On le traite comme une chaîne pour le <select>
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface OpportunityFormProps {
  onClose: () => void;
  onSubmit: (data: OpportunityFormData) => void;
  clients: { id: number; name: string }[]; // On passera la liste des clients pour le sélecteur
}

const OpportunityForm = ({ onClose, onSubmit, clients }: OpportunityFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-text-secondary">Titre de l'opportunité</label>
        <input {...register('title')} id="title" className="mt-1 w-full bg-bg border border-border rounded-md p-2"/>
        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
      </div>
      <div>
        <label htmlFor="value" className="block text-sm font-medium text-text-secondary">Valeur (€)</label>
        <input {...register('value', { valueAsNumber: true })} id="value" type="number" step="0.01" className="mt-1 w-full bg-bg border border-border rounded-md p-2"/>
        {errors.value && <p className="text-red-500 text-xs mt-1">{errors.value.message}</p>}
      </div>
      <div>
        <label htmlFor="client_id" className="block text-sm font-medium text-text-secondary">Client associé</label>
        <select {...register('client_id')} id="client_id" className="mt-1 w-full bg-bg border border-border rounded-md p-2">
          <option value="">Aucun client</option>
          {clients.map(client => (
            <option key={client.id} value={client.id}>{client.name}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-4 pt-4 border-t border-border mt-6">
        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md bg-gray-600 text-white">Annuler</button>
        <button type="submit" className="py-2 px-4 rounded-md bg-primary text-white">Créer l'opportunité</button>
      </div>
    </form>
  );
};

export default OpportunityForm;