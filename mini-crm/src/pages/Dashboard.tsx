import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import {
  Users,
  ShoppingCart,
  MessageSquare,
  Trophy,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import Swal from "../utils/swal";
import ChartSerie from "../components/charts/ChartSerie";
import RadarChart from "../components/charts/RadarChart";

type Kpi = {
  icon: React.ReactElement;
  title: string;
  value: string;
  growth: number;
  trend: "up" | "down";
  subtitle?: string;
};

type SalesDataPoint = { month: string; total: number };
type Activity = { content: string; date: string; userName: string };
type ClientStatus = { status: string; count: number };

const Dashboard = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const [clientStatusData, setClientStatusData] = useState<ClientStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllDashboardData = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const [statsRes, salesRes, activityRes, clientStatusRes] =
          await Promise.all([
            axios.get("http://localhost:3001/api/dashboard-stats", config),
            axios.get(
              "http://localhost:3001/api/dashboard-stats/sales-overview",
              config
            ),
            axios.get(
              "http://localhost:3001/api/dashboard-stats/recent-activity",
              config
            ),
            axios.get(
              "http://localhost:3001/api/dashboard-stats/client-status-distribution",
              config
            ),
          ]);
        setStats(statsRes.data);
        setSalesData(salesRes.data);
        setRecentActivity(activityRes.data);
        setClientStatusData(clientStatusRes.data);
      } catch (error: any) {
        const message =
          error.response?.data?.message ||
          "Erreur lors du chargement du tableau de bord.";
        Swal.fire("Erreur", message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAllDashboardData();
  }, []);

  useEffect(() => {
    if (clientStatusData.length > 0) {
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 100);
    }
  }, [clientStatusData]);

  const kpiData: Kpi[] = stats
    ? [
        {
          icon: <Users size={24} className="text-purple-500" />,
          title: "Clients Actifs",
          value: `${stats.clients || 0}`,
          growth: 0,
          trend: "up",
        },
        {
          icon: <ShoppingCart size={24} className="text-green-600" />,
          title: "Montant total des ventes",
          value: (stats.salesTotal || 0).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          }),
          growth: 0,
          trend: "up",
        },
        {
          icon: <ShoppingCart size={24} className="text-green-400" />,
          title: "Nombre de ventes enregistrées",
          value: `${stats.salesCount || 0}`,
          growth: 0,
          trend: "up",
        },
        ...(stats?.wonDeals
          ? [
              {
                icon: <Trophy size={24} className="text-yellow-500" />,
                title: "Affaires Gagnées (mois)",
                value: `${stats.wonDeals.revenue.toLocaleString("fr-FR")} €`,
                growth: stats.wonDeals.growth,
                trend: stats.wonDeals.growth >= 0 ? "up" : "down",
                subtitle: `${stats.wonDeals.count} affaires`,
              } as Kpi,
            ]
          : []),
      ]
    : [];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 bg-card rounded animate-pulse" />
            <div className="h-4 w-40 bg-card rounded animate-pulse" />
          </div>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-card rounded-lg shadow p-5 animate-pulse"
              >
                <div className="h-5 w-24 bg-bg rounded mb-3" />
                <div className="h-8 w-32 bg-bg rounded mb-2" />
                <div className="h-4 w-20 bg-bg rounded" />
              </div>
            ))}
          </section>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow animate-pulse h-80" />
            <div className="bg-card p-6 rounded-lg shadow animate-pulse h-80" />
          </section>
          <section className="bg-card p-6 rounded-lg shadow animate-pulse h-64" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-3">
          <h1 className="text-3xl font-bold text-text-primary">
            Tableau de bord
          </h1>
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <span>
              Mis à jour :{" "}
              {new Date().toLocaleDateString("fr-FR", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>
            <button
              onClick={() => window.location.reload()}
              className="w-9 h-9 rounded-md bg-card text-text-primary flex items-center justify-center"
              title="Rafraîchir"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-8">
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            {kpiData.map((kpi, index) => (
              <StatCard key={index} {...kpi} />
            ))}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Évolution des ventes
              </h2>
              <ChartSerie salesData={salesData} />
            </div>
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Répartition des statuts clients
              </h2>
              <RadarChart data={clientStatusData} />
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
              Activité récente
            </h2>
            <ul className="space-y-3 max-h-96 overflow-auto pr-1">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <li key={index} className="flex items-start">
                    <span className="mt-0.5 mr-3">
                      <MessageSquare size={16} className="text-blue-500" />
                    </span>
                    <div>
                      <p className="text-sm text-text-primary">
                        {activity.content}
                      </p>
                      <p className="text-xs text-text-secondary">
                        Par {activity.userName} –{" "}
                        {new Date(activity.date).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </li>
                ))
              ) : (
                <p className="text-sm text-text-secondary text-center py-4">
                  Aucune activité récente.
                </p>
              )}
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
