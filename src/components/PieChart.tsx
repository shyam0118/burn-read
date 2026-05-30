'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
  labels: string[];
  values: number[];
  label: string;
}

const COLORS = [
  '#38bdf8',
  '#818cf8',
  '#f472b6',
  '#34d399',
  '#fbbf24',
  '#f87171',
  '#a78bfa',
  '#2dd4bf',
  '#fb923c',
  '#e2e8f0',
];

export default function PieChart({ labels, values, label }: PieChartProps) {
  const data = {
    labels,
    datasets: [
      {
        data: values,
        backgroundColor: COLORS.slice(0, values.length),
        borderColor: '#0f172a',
        borderWidth: 2,
        hoverBorderColor: '#334155',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '55%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#94a3b8',
          padding: 12,
          font: { size: 11 },
          usePointStyle: true,
          pointStyleWidth: 8,
        },
      },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#f1f5f9',
        borderColor: '#334155',
        borderWidth: 1,
        callbacks: {
          label: (ctx: { label: string; parsed: number }) =>
            `${ctx.label}: ${Math.round((ctx.parsed / values.reduce((a, b) => a + b, 0)) * 100)}%`,
        },
      },
    },
  };

  return (
    <div className="chart-container bg-card rounded-xl p-4 border border-border">
      <h3 className="text-sm font-medium text-muted mb-3">{label}</h3>
      <div className="h-64 sm:h-80">
        <Doughnut data={data} options={options} />
      </div>
    </div>
  );
}
