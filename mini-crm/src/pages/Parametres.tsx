import { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { User, Shield, Palette, Bell, Users } from "lucide-react";

import ProfilTab from "../components/settings/ProfilTab";
import SecuriteTab from "../components/settings/SecuriteTab";
import ApparenceTab from "../components/settings/ApparenceTab";
import EquipeTab from "../components/settings/EquipeTab";

const currentUserRole: "admin" | "user" = "admin";

type Tab =
  | "profil"
  | "securite"
  | "apparence"
  | "notifications"
  | "equipe";

const Parametres = () => {
  const [activeTab, setActiveTab] = useState<Tab>("profil");

  const tabs = [
    { id: "profil", label: "Profil", icon: User, forAdmin: false },
    { id: "securite", label: "Sécurité", icon: Shield, forAdmin: false },
    { id: "apparence", label: "Apparence", icon: Palette, forAdmin: false },
    { id: "equipe", label: "Équipe", icon: Users, forAdmin: true },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case "profil":
        return <ProfilTab />;
      case "securite":
        return <SecuriteTab />;
      case "apparence":
        return <ApparenceTab />;
      case "equipe":
        return currentUserRole === "admin" ? <EquipeTab /> : null;
      default:
        return <ProfilTab />;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-text-primary mb-8">
          Paramètres
        </h1>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-1/4">
            <nav className="flex flex-col space-y-2">
              {tabs.map((tab) => {
                if (tab.forAdmin && currentUserRole !== "admin") {
                  return null;
                }
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? "bg-primary text-white font-semibold"
                        : "text-text-secondary hover:bg-card"
                    }`}
                  >
                    <tab.icon size={20} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </aside>

          <main className="w-full md:w-3/4 bg-card p-8 rounded-lg shadow-lg">
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Parametres;
