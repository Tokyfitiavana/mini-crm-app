import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

interface User {
  id: number;
  name: string;
}

const clientSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Le nom doit contenir au moins 2 caractères." }),
  company: z.string().optional(),
  email: z
    .string()
    .email({ message: "Veuillez entrer une adresse email valide." }),
  phone: z
    .string()
    .min(10, { message: "Le numéro de téléphone doit être valide." })
    .optional()
    .or(z.literal("")),
  status: z.enum(["Prospect", "Actif", "Inactif"]),
  assigned_to_user_id: z.number().optional().nullable(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  onClose: () => void | Promise<void>;
  onSubmit: (data: ClientFormData) => Promise<void>;
  initialData?: Partial<ClientFormData>;
  users: User[]; 
}

const ClientForm = ({
  onClose,
  onSubmit,
  initialData,
  users,
}: ClientFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: initialData || {
      status: "Prospect",
      assigned_to_user_id: null,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-text-secondary"
          >
            Nom complet
          </label>
          <input
            id="name"
            {...register("name")}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="company"
            className="block text-sm font-medium text-text-secondary"
          >
            Entreprise (Optionnel)
          </label>
          <input
            id="company"
            {...register("company")}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
        </div>

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-text-secondary"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-text-secondary"
          >
            Téléphone (Optionnel)
          </label>
          <input
            id="phone"
            type="tel"
            {...register("phone")}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          />
          {errors.phone && (
            <p className="text-red-400 text-xs mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="assigned_to_user_id"
            className="block text-sm font-medium text-text-secondary"
          >
            Assigné à (Optionnel)
          </label>
          <select
            id="assigned_to_user_id"
            {...register("assigned_to_user_id", {
              setValueAs: (value) => (value === "" ? null : Number(value)),
            })}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          >
            <option value="">Aucun</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.assigned_to_user_id && (
            <p className="text-red-400 text-xs mt-1">
              {errors.assigned_to_user_id.message}
            </p>
          )}
        </div>

        <div className="md:col-span-2">
          <label
            htmlFor="status"
            className="block text-sm font-medium text-text-secondary"
          >
            Statut
          </label>
          <select
            id="status"
            {...register("status")}
            className="mt-1 w-full bg-bg border border-border rounded-md p-2 text-text-primary focus:ring-primary focus:border-primary"
          >
            <option value="Prospect">Prospect</option>
            <option value="Actif">Actif</option>
            <option value="Inactif">Inactif</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t border-border mt-6">
        <button
          type="button"
          onClick={onClose}
          className="py-2 px-4 rounded-md text-text-primary bg-bg border border-border hover:bg-opacity-80"
        >
          Annuler
        </button>
        <button
          type="submit"
          className="py-2 px-4 rounded-md bg-primary text-white hover:opacity-90"
        >
          {initialData ? "Enregistrer les modifications" : "Créer le client"}
        </button>
      </div>
    </form>
  );
};

export default ClientForm;
