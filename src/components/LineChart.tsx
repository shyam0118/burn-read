'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface LineChartProps {
  labels: string[];
  values: number[];
  label: string;
  color?: string;
}

export default function LineChart({
  labels,
  values,
  label,
  color = '#38bdf8',
}: LineChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        borderColor: color,
        backgroundColor: color + '22',
        borderWidth: 2,
        pointRadius: 1,
        pointHoverRadius: 4,
        pointHoverBackgroundColor: color,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#334155',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: '#33415533' },
        ticks: { color: '#94a3b8', maxTicksLimit: 12 },
        border: { color: '#334155' },
      },
      y: {
        grid: { color: '#33415533' },
        ticks: { color: '#94a3b8' },
        border: { color: '#334155' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="chart-container bg-card rounded-xl p-4 border border-border">
      <h3 className="text-sm font-medium text-muted mb-3">{label}</h3>
      <div className="h-64 sm:h-80">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}
