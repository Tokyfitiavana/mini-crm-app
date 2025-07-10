import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import {
  Users,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Calendar,
  MessageSquare,
  Briefcase,
} from "lucide-react";
import RevenueChart from "../components/charts/RevenueChart";

const Dashboard = () => {
  const kpiData = [
    {
      icon: <DollarSign size={24} className="text-sky-500" />,
      title: "Revenu Total",
      value: "88 000 $",
      growth: 23,
      trend: "up",
    },
    {
      icon: <ShoppingBag size={24} className="text-orange-500" />,
      title: "Ventes Total",
      value: "245 000",
      growth: 48.5,
      trend: "up",
    },
    {
      icon: <Users size={24} className="text-purple-500" />,
      title: "Clients Actifs",
      value: "12 500",
      growth: 6,
      trend: "up",
    },
    {
      icon: <TrendingUp size={24} className="text-rose-500" />,
      title: "Taux de Conversion",
      value: "5.8%",
      growth: 1.2,
      trend: "down",
    },
  ];

  const recentActivities = [
    {
      icon: <Calendar size={16} className="text-blue-500" />,
      text: "Nouvel événement ajouté : Réunion client",
      time: "Il y a 10 min",
    },
    {
      icon: <MessageSquare size={16} className="text-green-500" />,
      text: "Nouveau message de support",
      time: "Il y a 25 min",
    },
    {
      icon: <Briefcase size={16} className="text-purple-500" />,
      text: "Prospect converti en client",
      time: "Il y a 1h",
    },
    {
      icon: <DollarSign size={16} className="text-yellow-500" />,
      text: "Facture #12345 réglée",
      time: "Hier",
    },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Tableau de bord
          </h1>
          <div className="mt-2 sm:mt-0 text-sm text-text-secondary">
            Mis à jour:{" "}
            {new Date().toLocaleDateString("fr-FR", {
              weekday: "long",
              day: "numeric",
              month: "long",
            })}
          </div>
        </div>

        <div className="space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <StatCard
                key={index}
                icon={kpi.icon}
                title={kpi.title}
                value={kpi.value}
                growth={kpi.growth}
                trend={kpi.trend}
              />
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-text-primary">
                  Aperçu des Ventes
                </h2>
                <select
                  className="bg-bg text-text-primary text-sm rounded-md px-3 py-1 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  aria-label="Période"
                >
                  <option>Ce mois-ci</option>
                  <option>7 derniers jours</option>
                  <option>30 derniers jours</option>
                </select>
              </div>
              <div className="w-full h-64">
                <RevenueChart />
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-text-primary">
                Activité Récente
              </h2>
              <ul className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mt-0.5 mr-3">{activity.icon}</span>
                    <div>
                      <p className="text-sm text-text-primary">
                        {activity.text}
                      </p>
                      <p className="text-xs text-text-secondary">
                        {activity.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full text-center text-sm text-primary hover:opacity-80">
                Voir toute l'activité →
              </button>
            </div>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
