import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const clientSchema = z.object({
  name: z.string().min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  company: z.string().optional(),
  email: z.string().email({ message: "Veuillez entrer une adresse email valide." }),
  phone: z.string().min(10, { message: "Le numéro de téléphone doit être valide." }).optional().or(z.literal('')),
  status: z.enum(['Prospect', 'Actif', 'Inactif']),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onClose: () => void;
  onSubmit: (data: ClientFormData) => void;
  initialData?: Partial<ClientFormData>;
}

const ClientForm = ({ onClose, onSubmit, initialData }: ClientFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || { status: 'Prospect' }
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-text-secondary">Nom complet</label>
          <input 
            id="name"
            {...register('name')} 
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="company" className="block text-sm font-medium text-text-secondary">Entreprise (Optionnel)</label>
          <input 
            id="company"
            {...register('company')}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-text-secondary">Email</label>
          <input 
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-text-secondary">Téléphone (Optionnel)</label>
          <input 
            id="phone"
            type="tel"
            {...register('phone')}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        <div className="md:col-span-2">
          <label htmlFor="status" className="block text-sm font-medium text-text-secondary">Statut</label>
          <select
            id="status"
            {...register('status')}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          >
            <option value="Prospect">Prospect</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
        <button type="button" onClick={onClose} className="py-2 px-4 rounded-md text-text-primary bg-bg border border-border hover:bg-opacity-80">
          Annuler
        </button>
        <button type="submit" className="py-2 px-4 rounded-md bg-primary text-white hover:opacity-90">
          {initialData ? 'Enregistrer les modifications' : 'Créer le client'}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;