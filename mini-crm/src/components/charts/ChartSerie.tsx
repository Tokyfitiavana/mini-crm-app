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
  const categories = salesData.map((d) =>
    new Date(d.month + "-01").toLocaleString("fr-FR", { month: "short" })
  );

  // Pour l'exemple : on génère des "objectifs" ou "coûts" fictifs
  const objectifData = salesData.map((d) => Math.round(d.total * 0.75)); // 75% de l’objectif
  const tauxData = salesData.map((d, i) =>
    objectifData[i] ? Number(((d.total / objectifData[i]) * 100).toFixed(2)) : 0
  );

  const series = [
    {
      name: "Coûts",
      type: "column",
      data: objectifData,
    },
    {
      name: "Ventes",
      type: "column",
      data: salesData.map((d) => d.total),
    },
    {
      name: "Taux (%)",
      type: "line",
      data: tauxData,
    },
  ];

  const options = {
    chart: {
      type: "line",
      stacked: false,
      toolbar: { show: false },
      background: "transparent",
    },
    stroke: {
      width: [0, 0, 3],
      curve: "smooth",
    },
    plotOptions: {
      bar: {
        columnWidth: "40%",
        borderRadius: 6,
      },
    },
    fill: {
      opacity: [1, 1, 0.3],
    },
    xaxis: {
      categories,
      labels: { style: { colors: "#9ca3af" } },
    },
    yaxis: [
      {
        title: { text: "Montants (€)", style: { color: "#9ca3af" } },
        labels: { style: { colors: "#9ca3af" } },
      },
      {
        opposite: true,
        title: { text: "Taux (%)", style: { color: "#9ca3af" } },
        labels: { style: { colors: "#9ca3af" } },
      },
    ],
    tooltip: {
      shared: true,
      intersect: false,
      y: [
        { formatter: (val: number) => `${val} €` },
        { formatter: (val: number) => `${val} €` },
        { formatter: (val: number) => `${val.toFixed(2)} %` },
      ],
    },
    legend: {
      position: "top",
      horizontalAlign: "left",
      labels: { colors: "#111827" },
    },
    colors: ["#ddd6fe", "#8b5cf6", "#111827"],
  };

  return (
    <div className="w-full h-72">
      {salesData.length > 0 ? (
        <Chart options={options} series={series} type="line" height="100%" />
      ) : (
        <div className="text-sm text-text-secondary text-center">
          Aucune donnée de ventes disponible.
        </div>
      )}
    </div>
  );
};

export default ChartSerie;
