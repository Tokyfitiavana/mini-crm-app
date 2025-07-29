import React from "react";
import Chart from "react-apexcharts";

type SalesDataPoint = {
  month: string; 
  total: number;
};

type Props = {
  salesData?: SalesDataPoint[];
};

const ChartSerie = ({ salesData = [] }: Props) => {
  console.log("✅ salesData reçu dans ChartSerie :", salesData);

  const categories = salesData.map((d) =>
    new Date(d.month + "-01").toLocaleString("fr-FR", { month: "short" })
  );

  const series = [
    {
      name: "Ventes",
      data: salesData.map((d) => d.total),
    },
  ];

  const options = {
    chart: {
      id: "sales-bar-chart",
      toolbar: { show: false },
      background: "transparent",
    },
    xaxis: {
      categories,
      labels: { style: { colors: "#9ca3af" } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { colors: "#9ca3af" } },
    },
    tooltip: { theme: "dark" },
    grid: { borderColor: "#374151" },
    colors: ["#10b981"], // vert
    dataLabels: { enabled: false },
  };

  return (
    <div className="w-full h-64">
      {salesData.length > 0 ? (
        <Chart options={options} series={series} type="bar" height="100%" />
      ) : (
        <div className="text-sm text-text-secondary text-center">
          Aucune donnée de ventes disponible.
        </div>
      )}
    </div>
  );
};

export default ChartSerie;
