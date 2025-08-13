import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { User, Shield, Palette, Users } from "lucide-react";

import ProfilTab from "../components/settings/ProfilTab";
import SecuriteTab from "../components/settings/SecuriteTab";
import ApparenceTab from "../components/settings/ApparenceTab";
import EquipeTab from "../components/settings/EquipeTab";

const currentUserRole: "admin" | "user" = "admin";

type Tab = "profil" | "securite" | "apparence" | "equipe";

type TabItem = {
  id: Tab;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  forAdmin?: boolean;
};

const Parametres = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const tabs: TabItem[] = useMemo(
    () => [
      { id: "profil", label: "Profil", icon: User },
      { id: "securite", label: "Sécurité", icon: Shield },
      { id: "apparence", label: "Apparence", icon: Palette },
      { id: "equipe", label: "Équipe", icon: Users, forAdmin: true },
    ],
    []
  );

  const allowedTabs = tabs
    .filter((t) => !t.forAdmin || currentUserRole === "admin")
    .map((t) => t.id);

  const initialTab = ((): Tab => {
    const fromUrl = searchParams.get("tab") as Tab | null;
    return fromUrl && allowedTabs.includes(fromUrl) ? fromUrl : "profil";
  })();

  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    if (searchParams.get("tab") !== activeTab) {
      const params = new URLSearchParams(searchParams);
      params.set("tab", activeTab);
      setSearchParams(params, { replace: true });
    }
  }, [activeTab, searchParams, setSearchParams]);

  useEffect(() => {
    const urlTab = searchParams.get("tab") as Tab | null;
    if (urlTab && urlTab !== activeTab && allowedTabs.includes(urlTab)) {
      setActiveTab(urlTab);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

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
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary">Paramètres</h1>
          <p className="text-text-secondary mt-1">
            Gérez votre compte et vos préférences d’application.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          <aside className="w-full md:w-64 md:flex-shrink-0">
            <div className="md:sticky md:top-6 bg-card rounded-xl border border-border shadow-sm p-3">
              <nav
                role="tablist"
                aria-label="Navigation des paramètres"
                className="flex md:flex-col gap-2"
              >
                {tabs.map((tab) => {
                  if (tab.forAdmin && currentUserRole !== "admin") return null;
                  const Icon = tab.icon;
                  const selected = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      aria-selected={selected}
                      aria-controls={`panel-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative w-full text-left rounded-lg px-3 py-2.5 flex items-center gap-3 transition-all outline-none
                      ${
                        selected
                          ? "bg-primary text-white shadow-sm"
                          : "text-text-secondary hover:bg-bg"
                      }`}
                    >
                      <span
                        className={`inline-flex w-2 h-2 rounded-full absolute left-0 translate-x-[-8px] ${
                          selected ? "bg-primary" : "bg-transparent"
                        }`}
                      />
                      <Icon
                        size={18}
                        className={selected ? "opacity-100" : "opacity-80"}
                      />
                      <span className={selected ? "font-semibold" : ""}>
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </aside>

          <main
            id={`panel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={activeTab}
            className="w-full bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm"
          >
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Parametres;
