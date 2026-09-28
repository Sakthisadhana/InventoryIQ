import React from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function StockChart({ summary }) {
  const data = {
    labels: summary.map((s) => s.category),
    datasets: [
      {
        label: "Total quantity in stock",
        data: summary.map((s) => Number(s.total_quantity)),
        backgroundColor: "#4e73df"
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: true, text: "Stock by Category" }
    },
    scales: { y: { beginAtZero: true } }
  };

  return (
    <div className="card shadow-sm p-3 mb-4">
      <Bar data={data} options={options} />
    </div>
  );
}
