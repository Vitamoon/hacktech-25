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
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { format } from 'date-fns';
import { WaterLevelReading, LakeForecast } from '../types';

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

interface WaterLevelChartProps {
  data: WaterLevelReading[];
  normalLevel: number;
  forecast?: LakeForecast[];
  timeRange?: '7d' | '30d' | '90d' | 'all';
}

const WaterLevelChart: React.FC<WaterLevelChartProps> = ({ 
  data, 
  normalLevel, 
  forecast, 
  timeRange = '30d' 
}) => {
  // Filter data based on timeRange
  const filteredData = React.useMemo(() => {
    const now = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    const cutoff = new Date(now.setDate(now.getDate() - days));
    
    return data.filter(reading => new Date(reading.timestamp) >= cutoff);
  }, [data, timeRange]);

  const labels = filteredData.map(reading => 
    format(new Date(reading.timestamp), 'MMM d')
  );
  
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Water Level',
        data: filteredData.map(reading => reading.level),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: false,
      },
      {
        label: 'Normal Level',
        data: Array(filteredData.length).fill(normalLevel),
        borderColor: 'rgba(75, 192, 192, 0.8)',
        borderDash: [5, 5],
        borderWidth: 2,
        pointRadius: 0,
        tension: 0,
        fill: false,
      }
    ],
  };

  // Add forecast data if available
  if (forecast && forecast.length > 0) {
    const allLabels = [...labels];
    const forecastLabels = forecast.map(f => format(new Date(f.timestamp), 'MMM d'));
    
    allLabels.push(...forecastLabels);
    
    chartData.labels = allLabels;
    
    // Extend the normal level line
    chartData.datasets[1].data = Array(allLabels.length).fill(normalLevel);
    
    // Add forecasted data
    chartData.datasets.push({
      label: 'Forecast',
      data: [...Array(filteredData.length).fill(null), ...forecast.map(f => f.predicted)],
      borderColor: 'rgba(153, 102, 255, 1)',
      backgroundColor: 'rgba(153, 102, 255, 0.1)',
      borderDash: [3, 3],
      tension: 0.3,
      fill: false,
    });
    
    // Add confidence interval
    chartData.datasets.push({
      label: 'Confidence Range',
      data: [...Array(filteredData.length).fill(null), ...forecast.map(f => f.upperBound)],
      borderColor: 'transparent',
      backgroundColor: 'rgba(153, 102, 255, 0.1)',
      pointRadius: 0,
      fill: '+1',
    });
    
    chartData.datasets.push({
      label: 'Lower Bound',
      data: [...Array(filteredData.length).fill(null), ...forecast.map(f => f.lowerBound)],
      borderColor: 'transparent',
      pointRadius: 0,
      fill: false,
    });
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index' as const,
      intersect: false,
    },
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          filter: (item: any) => {
            // Hide certain datasets from the legend
            return !['Lower Bound', 'Confidence Range'].includes(item.text);
          }
        }
      },
      tooltip: {
        callbacks: {
          title: (context: any) => {
            const index = context[0].dataIndex;
            const isHistorical = index < filteredData.length;
            
            if (isHistorical) {
              return format(new Date(filteredData[index].timestamp), 'MMM d, yyyy');
            } else if (forecast) {
              const forecastIndex = index - filteredData.length;
              return `Forecast: ${format(new Date(forecast[forecastIndex].timestamp), 'MMM d, yyyy')}`;
            }
            return '';
          }
        }
      }
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Water Level (meters)',
        },
        ticks: {
          callback: (value: any) => `${value}m`,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="h-[400px]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default WaterLevelChart;