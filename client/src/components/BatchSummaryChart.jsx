import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function BatchSummaryChart({ breakdown }) {
  if (!breakdown) return null;

  const data = {
    labels: [
      `Grade A (${breakdown.gradeA}%)`,
      `Rotten (${breakdown.rotten}%)`,
      `Sprouted (${breakdown.sprouted}%)`,
      `Undersized (${breakdown.undersized}%)`
    ],
    datasets: [
      {
        data: [
          breakdown.gradeA,
          breakdown.rotten,
          breakdown.sprouted,
          breakdown.undersized
        ],
        backgroundColor: [
          '#16a34a', // Emerald 600 - Grade A
          '#dc2626', // Red 600 - Rotten
          '#d97706', // Amber 600 - Sprouted
          '#4f46e5'  // Indigo 600 - Undersized
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          font: {
            family: "'Plus Jakarta Sans', sans-serif",
            size: 11,
            weight: '600'
          },
          padding: 14,
          color: '#374151'
        }
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            return ` ${context.label}: ${context.raw}%`;
          }
        }
      }
    },
    cutout: '62%'
  };

  return (
    <div className="relative w-full h-56 sm:h-64 flex items-center justify-center">
      <Doughnut data={data} options={options} />
      {/* Center Statistic */}
      <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
        <span className="block text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
          {breakdown.gradeA}%
        </span>
        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
          Grade A
        </span>
      </div>
    </div>
  );
}
