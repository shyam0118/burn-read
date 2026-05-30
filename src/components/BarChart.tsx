'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface BarChartProps {
  labels: string[];
  values: number[];
  label: string;
  color?: string;
  horizontal?: boolean;
}

export default function BarChart({
  labels,
  values,
  label,
  color = '#38bdf8',
  horizontal = true,
}: BarChartProps) {
  const data = {
    labels,
    datasets: [
      {
        label,
        data: values,
        backgroundColor: color + '99',
        borderColor: color,
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
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
        ticks: { color: '#94a3b8' },
        border: { color: '#334155' },
      },
      y: {
        grid: { color: '#33415533' },
        ticks: { color: '#94a3b8' },
        border: { color: '#334155' },
      },
    },
  };

  return (
    <div className="chart-container bg-card rounded-xl p-4 border border-border">
      <h3 className="text-sm font-medium text-muted mb-3">{label}</h3>
      <div className="h-64 sm:h-80">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}
