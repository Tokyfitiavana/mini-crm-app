import Chart from "react-apexcharts";

const SalesDonutChart = () => {
  const options = {
    chart: {
      id: "sales-donut-chart",
      type: "donut",
    },
    labels: ["Vêtements", "Électronique", "Biens de conso.", "Autres"],
    colors: ["#8e44ad", "#3498db", "#2ecc71", "#f1c40f"],
    legend: {
      position: "bottom",
      labels: {
        colors: "#a0aec0",
      },
    },
    stroke: {
      show: false,
    },
    tooltip: {
      theme: "dark",
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: "Total Ventes",
              color: "#a0aec0",
              formatter: (w: any) => {
                const total = w.globals.seriesTotals.reduce(
                  (a: number, b: number) => {
                    return a + b;
                  },
                  0
                );
                return total.toLocaleString() + " $";
              },
            },
          },
        },
      },
    },
  };

  const series = [4400, 5500, 1300, 4300];

  return <Chart options={options} series={series} type="donut" height="100%" />;
};

export default SalesDonutChart;
