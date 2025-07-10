import { useState, type FormEvent } from "react";
import DashboardLayout from "../components/DashboardLayout";
import {
  Bell,
  PlusCircle,
  Calendar,
  Tag,
  CheckCircle,
  Circle,
} from "lucide-react";

type Rappel = {
  id: number;
  title: string;
  dueDate: Date;
  clientName?: string;
  isCompleted: boolean;
};

const mockRappels: Rappel[] = [
  {
    id: 1,
    title: "Appeler Jean Dupont pour le devis",
    dueDate: new Date(),
    clientName: "Jean Dupont",
    isCompleted: false,
  },
  {
    id: 2,
    title: "Envoyer le contrat à Marie Curie",
    dueDate: new Date(),
    clientName: "Marie Curie",
    isCompleted: true,
  },
  {
    id: 3,
    title: "Suivi prospect Louis Pasteur",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    clientName: "Louis Pasteur",
    isCompleted: false,
  },
  {
    id: 4,
    title: "Préparer la présentation pour Tech Corp",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 5)),
    clientName: "Tech Corp",
    isCompleted: false,
  },
  {
    id: 5,
    title: "Relancer le paiement de la facture #123",
    dueDate: new Date(new Date().setDate(new Date().getDate() + 1)),
    isCompleted: false,
  },
];

const formatDateGroup = (date: Date): string => {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);

  today.setHours(0, 0, 0, 0);
  tomorrow.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);

  if (date.getTime() === today.getTime()) return "Aujourd'hui";
  if (date.getTime() === tomorrow.getTime()) return "Demain";
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
};

const Rappels = () => {
  const [rappels, setRappels] = useState<Rappel[]>(mockRappels);
  const [newRappelTitle, setNewRappelTitle] = useState("");

  const handleAddRappel = (e: FormEvent) => {
    e.preventDefault();
    if (newRappelTitle.trim() === "") return;
    const newRappel: Rappel = {
      id: Date.now(),
      title: newRappelTitle,
      dueDate: new Date(),
      isCompleted: false,
    };
    setRappels((prev) => [newRappel, ...prev]);
    setNewRappelTitle("");
  };
  const toggleRappel = (id: number) => {
    setRappels((prev) =>
      prev.map((rappel) =>
        rappel.id === id
          ? { ...rappel, isCompleted: !rappel.isCompleted }
          : rappel
      )
    );
  };

  const groupedRappels = rappels.reduce((acc, rappel) => {
    const dateKey = formatDateGroup(rappel.dueDate);
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
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

        <form
          onSubmit={handleAddRappel}
          className="mb-8 flex items-center gap-2"
        >
          <PlusCircle size={24} className="text-text-secondary" />
          <input
            type="text"
            value={newRappelTitle}
            onChange={(e) => setNewRappelTitle(e.target.value)}
            placeholder="Ajouter un nouveau rappel..."
            className="w-full bg-transparent border-b-2 border-border focus:border-primary focus:outline-none py-2 text-lg text-text-primary transition-colors"
          />
          <button
            type="submit"
            className="bg-primary text-white py-2 px-4 rounded-lg hover:opacity-90 flex-shrink-0"
          >
            Ajouter
          </button>
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
                      className="flex items-center justify-between bg-card p-4 rounded-lg shadow transition-opacity"
                      style={{ opacity: rappel.isCompleted ? 0.5 : 1 }}
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
                              rappel.isCompleted ? "line-through" : ""
                            }`}
                          >
                            {rappel.title}
                          </p>
                          {rappel.clientName && (
                            <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-1">
                              <Tag size={12} />
                              <span>{rappel.clientName}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-text-secondary">
              <p>Aucun rappel pour le moment.</p>
              <p className="text-sm">
                Utilisez le champ ci-dessus pour en ajouter un !
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Rappels;
