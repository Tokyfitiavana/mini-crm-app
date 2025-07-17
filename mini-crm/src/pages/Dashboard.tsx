import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import StatCard from "../components/StatCard";
import {
  Users,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  MessageSquare,
  Trophy,
} from "lucide-react";
import Chart from "react-apexcharts";
import axios from "axios";
import Swal from "../utils/swal";
import ClientStatusPieChart from "../components/charts/ClientStatusPieChart";

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
        console.error(
          "Erreur lors du chargement des données du dashboard :",
          error
        );
        const message =
          error.response?.data?.message ||
          "Une erreur est survenue lors du chargement des données.";
        Swal.fire("Erreur", message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchAllDashboardData();
  }, []);

  const kpiData: Kpi[] = stats
    ? [
        {
          icon: <DollarSign size={24} className="text-sky-500" />,
          title: "Revenu Total",
          value: `${stats.revenue?.toLocaleString("fr-FR") || 0} €`,
          growth: 23,
          trend: "up",
        },
        {
          icon: <ShoppingBag size={24} className="text-orange-500" />,
          title: "Ventes Totales",
          value: `${stats.sales || 0}`,
          growth: 48.5,
          trend: "up",
        },
        {
          icon: <Users size={24} className="text-purple-500" />,
          title: "Clients Actifs",
          value: `${stats.clients || 0}`,
          growth: 6,
          trend: "up",
        },
      ]
    : [];

  const chartOptions = {
    chart: {
      id: "sales-overview-chart",
      toolbar: { show: false },
      background: "transparent",
    },
    xaxis: {
      categories: salesData.map((d) =>
        new Date(d.month).toLocaleString("fr-FR", { month: "short" })
      ),
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: { labels: { style: { colors: "#9ca3af" } } },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shade: "dark", opacityFrom: 0.5, opacityTo: 0.1 },
    },
    grid: { borderColor: "#374151" },
    tooltip: { theme: "dark" },
    colors: ["#8b5cf6"],
    dataLabels: { enabled: false },
  };

  const chartSeries = [{ name: "Ventes", data: salesData.map((d) => d.total) }];

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

        {loading ? (
          <div className="text-center py-10 text-text-secondary">
            Chargement...
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {kpiData.map((kpi, index) => (
                <StatCard key={index} {...kpi} />
              ))}
              {stats?.wonDeals && (
                <StatCard
                  icon={<Trophy size={24} className="text-yellow-500" />}
                  title="Affaires Gagnées (ce mois)"
                  value={`${stats.wonDeals.revenue.toLocaleString("fr-FR")} €`}
                  growth={stats.wonDeals.growth}
                  trend={stats.wonDeals.growth >= 0 ? "up" : "down"}
                  subtitle={`${stats.wonDeals.count} affaires`}
                />
              )}
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-card p-6 rounded-lg shadow">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold text-text-primary">
                    {salesData.length > 0
                      ? "Aperçu des Ventes"
                      : "Répartition des Clients"}
                  </h2>
                  <select
                    className="bg-bg text-text-primary text-sm rounded-md px-3 py-1 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Période"
                  >
                    <option>12 derniers mois</option>
                  </select>
                </div>
                <div className="w-full h-64">
                  {salesData.length > 0 ? (
                    <Chart
                      options={chartOptions}
                      series={chartSeries}
                      type="area"
                      height="100%"
                    />
                  ) : (
                    <ClientStatusPieChart data={clientStatusData} />
                  )}
                </div>
              </div>

              <div className="bg-card p-6 rounded-lg shadow">
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
                            Par {activity.userName} -{" "}
                            {new Date(activity.date).toLocaleDateString(
                              "fr-FR"
                            )}
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
                <button className="mt-4 w-full text-center text-sm text-primary hover:opacity-80">
                  Voir toute l'activité →
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
