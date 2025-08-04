// src/components/charts/StockStatusPolarChart.tsx
import React from "react";
import Chart from "react-apexcharts";

interface Props {
  data: { status: string; count: number }[];
}

const StockStatusPolarChart = ({ data }: Props) => {
  const options = {
    labels: data.map((d) => d.status),
    chart: {
      type: "polarArea",
      toolbar: { show: false },
    },
    fill: {
      opacity: 0.7,
    },
    stroke: {
      colors: ["#ffffff"],
    },
    legend: {
      position: "bottom",
      labels: {
        colors: document.documentElement.classList.contains("dark")
          ? "#f9fafb"
          : "#111827",
      },
    },
    colors: ["#22c55e", "#facc15", "#ef4444"], // vert, jaune, rouge
    tooltip: {
      y: {
        formatter: (val: number) => `${val} article(s)`,
      },
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: { height: 250 },
          legend: { position: "bottom" },
        },
      },
    ],
  };

  const series = data.map((d) => d.count);

  return (
    <Chart
      options={options}
      series={series}
      type="polarArea"
      height="300"
    />
  );
};

export default StockStatusPolarChart;
