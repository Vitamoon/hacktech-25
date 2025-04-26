import React from 'react';
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
import { WaterLevelReading, LakeForecast } from '../../types';
import { format, parseISO, subDays } from 'date-fns';

// Register Chart.js components
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

interface LakeLevelChartProps {
  name: string;
  readings: WaterLevelReading[];
  forecasts?: LakeForecast[];
  normalLevel?: number;
  criticalHighLevel?: number;
  criticalLowLevel?: number;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}

const LakeLevelChart: React.FC<LakeLevelChartProps> = ({
  name,
  readings,
  forecasts = [],
  normalLevel,
  criticalHighLevel,
  criticalLowLevel,
  timeRange = '30d',
}) => {
  // Filter readings based on time range
  const filteredReadings = (() => {
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        return readings.filter(r => 
          parseISO(r.timestamp) > subDays(now, 7)
        );
      case '30d':
        return readings.filter(r => 
          parseISO(r.timestamp) > subDays(now, 30)
        );
      case '90d':
        return readings.filter(r => 
          parseISO(r.timestamp) > subDays(now, 90)
        );
      case '1y':
        return readings.filter(r => 
          parseISO(r.timestamp) > subDays(now, 365)
        );
      case 'all':
      default:
        return readings;
    }
  })();
  
  // Format dates for display
  const labels = [...filteredReadings, ...forecasts].map(reading => 
    format(parseISO(reading.timestamp), 'MMM d')
  );
  
  // Historical data
  const historicalData = filteredReadings.map(reading => reading.level);
  
  // Forecast data if available
  const forecastData = forecasts.map(forecast => forecast.predicted);
  const upperBoundData = forecasts.map(forecast => forecast.upperBound);
  const lowerBoundData = forecasts.map(forecast => forecast.lowerBound);
  
  // Fill arrays with null to align dates
  const readingsLength = filteredReadings.length;
  const nullArray = Array(readingsLength).fill(null);
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Historical',
        data: [...historicalData, ...Array(forecasts.length).fill(null)],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2,
      },
      {
        label: 'Forecast',
        data: [...nullArray, ...forecastData],
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
        borderDash: [5, 5],
        tension: 0.2,
      },
      {
        label: 'Upper Bound',
        data: [...nullArray, ...upperBoundData],
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'transparent',
        borderDash: [2, 2],
        pointRadius: 0,
        tension: 0.2,
      },
      {
        label: 'Lower Bound',
        data: [...nullArray, ...lowerBoundData],
        borderColor: 'rgba(255, 99, 132, 0.3)',
        backgroundColor: 'transparent',
        borderDash: [2, 2],
        pointRadius: 0,
        tension: 0.2,
        fill: {
          target: '+1',
          above: 'rgba(255, 99, 132, 0.1)',
        },
      },
    ],
  };
  
  // Add reference lines for normal and critical levels if provided
  if (normalLevel !== undefined) {
    data.datasets.push({
      label: 'Normal Level',
      data: Array(labels.length).fill(normalLevel),
      borderColor: 'rgba(75, 192, 192, 0.7)',
      borderWidth: 2,
      borderDash: [10, 5],
      pointRadius: 0,
      tension: 0,
    });
  }
  
  if (criticalHighLevel !== undefined) {
    data.datasets.push({
      label: 'Critical High',
      data: Array(labels.length).fill(criticalHighLevel),
      borderColor: 'rgba(255, 99, 71, 0.7)',
      borderWidth: 2,
      borderDash: [10, 5],
      pointRadius: 0,
      tension: 0,
    });
  }
  
  if (criticalLowLevel !== undefined) {
    data.datasets.push({
      label: 'Critical Low',
      data: Array(labels.length).fill(criticalLowLevel),
      borderColor: 'rgba(255, 159, 64, 0.7)',
      borderWidth: 2,
      borderDash: [10, 5],
      pointRadius: 0,
      tension: 0,
    });
  }
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${name} Water Level`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value.toFixed(2)} ft`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Water Level (ft)',
        },
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
  };
  
  return (
    <div className="h-[400px] p-4 bg-white rounded-lg shadow-md">
      <Line data={data} options={options} />
    </div>
  );
};

export default LakeLevelChart;