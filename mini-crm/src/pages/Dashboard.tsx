import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import {
  Users,
  ShoppingCart,
  MessageSquare,
  Trophy,
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

        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };

        const [statsRes, salesRes, activityRes, clientStatusRes] =
          await Promise.all([
            axios.get("http://localhost:3001/api/dashboard-stats", config),
            axios.get("http://localhost:3001/api/dashboard-stats/sales-overview"),
            axios.get("http://localhost:3001/api/dashboard-stats/recent-activity", config),
            axios.get("http://localhost:3001/api/dashboard-stats/client-status-distribution", config),
          ]);

        setStats(statsRes.data);
        setSalesData(salesRes.data);
        setRecentActivity(activityRes.data);
        setClientStatusData(clientStatusRes.data);
      } catch (error: any) {
        console.error("Erreur lors du chargement des données :", error);
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
          value: `${(stats.salesTotal || 0).toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
            minimumFractionDigits: 2,
          })} €`,
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
      ]
    : [];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <h1 className="text-3xl font-bold text-text-primary">
            Tableau de bord
          </h1>
          <div className="mt-2 sm:mt-0 text-sm text-text-secondary">
            Mis à jour :{" "}
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
              <StatCard key={index} {...kpi} />
            ))}
            {stats?.wonDeals && (
              <StatCard
                icon={<Trophy size={24} className="text-yellow-500" />}
                title="Affaires Gagnées (mois)"
                value={`${stats.wonDeals.revenue.toLocaleString("fr-FR")} €`}
                growth={stats.wonDeals.growth}
                trend={stats.wonDeals.growth >= 0 ? "up" : "down"}
                subtitle={`${stats.wonDeals.count} affaires`}
              />
            )}
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-card p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Statut des Clients
              </h2>
              <RadarChart data={clientStatusData} />
            </div>
            <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold text-text-primary mb-4">
                Série des Ventes
              </h2>
              <ChartSerie salesData={salesData} />
            </div>
          </section>

          <section className="bg-card p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
              Activité Récente
            </h2>
            <ul className="space-y-3">
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
