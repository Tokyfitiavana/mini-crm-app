import Chart from "react-apexcharts";

const RevenueChart = () => {
  const options = {
    chart: {
      id: "revenue-chart",
      toolbar: {
        show: false,
      },
      sparkline: {
        enabled: false,
      },
    },
    xaxis: {
      categories: ["Jan", "Fev", "Mar", "Avr", "Mai", "Juin", "Juil"],
      labels: {
        style: {
          colors: "#a0aec0",
        },
      },
    },
    yaxis: {
      labels: {
        style: {
          colors: "#a0aec0",
        },
      },
    },
    stroke: {
      curve: "smooth",
      width: 2,
    },
    fill: {
      type: "gradient",
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        gradientToColors: ["#9b59b6"],
        inverseColors: true,
        opacityFrom: 0.5,
        opacityTo: 0.1,
        stops: [0, 100],
      },
    },
    grid: {
      borderColor: "#4a5568",
      strokeDashArray: 4,
    },
    tooltip: {
      theme: "dark",
    },
    colors: ["#9b59b6"],
  };

  const series = [
    {
      name: "Revenus",
      data: [30, 40, 45, 50, 49, 60, 70],
    },
  ];

  return <Chart options={options} series={series} type="area" height="100%" />;
};

export default RevenueChart;
