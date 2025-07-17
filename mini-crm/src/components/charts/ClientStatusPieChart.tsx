// src/components/charts/ClientStatusPieChart.tsx
import Chart from 'react-apexcharts';

interface PieChartProps {
  data: { status: string; count: number }[];
}

const ClientStatusPieChart = ({ data }: PieChartProps) => {
  const options = {
    chart: { type: 'donut' },
    labels: data.map(d => d.status),
    colors: ['#f1c40f', '#2ecc71', '#e74c3c'], // Jaune, Vert, Rouge
    legend: { position: 'bottom', labels: { colors: document.documentElement.classList.contains('dark') ? '#f9fafb' : '#111827' } },
    dataLabels: { enabled: true, formatter: (val: number) => `${val.toFixed(1)}%` },
    plotOptions: { pie: { donut: { labels: { show: true, total: { show: true, label: 'Total Clients' } } } } },
    tooltip: { y: { formatter: (val: number) => `${val} client(s)` } }
  };

  const series = data.map(d => d.count);

  return <Chart options={options} series={series} type="donut" height="100%" />;
};

export default ClientStatusPieChart;