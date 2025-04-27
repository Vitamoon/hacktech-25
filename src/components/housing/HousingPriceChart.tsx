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
import { HousingData } from '../../types';
import { format, parseISO } from 'date-fns';

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

type TimeRangeOption = '6m' | '1y' | '3y' | '5y' | 'all';

interface HousingPriceChartProps {
  housingData: HousingData;
  timeRange?: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void; // Add the setter prop
}

const HousingPriceChart: React.FC<HousingPriceChartProps> = ({
  housingData,
  timeRange = '1y',
  setTimeRange, // Destructure the new prop
}) => {
  // Filter price data based on time range
  const filteredPrices = (() => {
    const now = new Date();
    const monthsAgo = (months: number) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - months);
      return date;
    };
    
    switch (timeRange) {
      case '6m':
        return housingData.prices.filter(p => 
          parseISO(p.date) >= monthsAgo(6)
        );
      case '1y':
        return housingData.prices.filter(p => 
          parseISO(p.date) >= monthsAgo(12)
        );
      case '3y':
        return housingData.prices.filter(p => 
          parseISO(p.date) >= monthsAgo(36)
        );
      case '5y':
        return housingData.prices.filter(p => 
          parseISO(p.date) >= monthsAgo(60)
        );
      case 'all':
      default:
        return housingData.prices;
    }
  })();
  
  // Format data for the chart
  const labels = filteredPrices.map(p => format(parseISO(p.date), 'MMM yyyy'));
  const priceData = filteredPrices.map(p => p.value);
  
  // Calculate the trendline
  const calculateTrendLine = () => {
    const n = priceData.length;
    if (n <= 1) return Array(n).fill(priceData[0] || 0);
    
    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += priceData[i];
      sumXY += i * priceData[i];
      sumXX += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return Array.from({ length: n }, (_, i) => slope * i + intercept);
  };
  
  const trendlineData = calculateTrendLine();
  
  // Calculate average price and year-over-year change
  const avgPrice = priceData.reduce((sum, val) => sum + val, 0) / priceData.length;
  
  // Year-over-year change (if we have enough data)
  let yoyChange = 0;
  if (priceData.length >= 12) {
    const currentPrice = priceData[priceData.length - 1];
    const yearAgoPrice = priceData[priceData.length - 12] || priceData[0];
    yoyChange = ((currentPrice - yearAgoPrice) / yearAgoPrice) * 100;
  }
  
  const data = {
    labels,
    datasets: [
      {
        label: 'Housing Price',
        data: priceData,
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
        tension: 0.2,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
      {
        label: 'Trend',
        data: trendlineData,
        borderColor: 'rgba(255, 99, 132, 0.8)',
        borderWidth: 2,
        pointRadius: 0,
        borderDash: [5, 5],
        fill: false,
      },
    ],
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Housing Prices for ${housingData.regionName} (${housingData.city}, ${housingData.state})`,
        font: {
          size: 16,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: $${value.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxTicksLimit: 12,
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)',
        },
        ticks: {
          callback: function(value: any) {
            return '$' + value.toLocaleString();
          },
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
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {housingData.city}, {housingData.state} ({housingData.regionName})
            </h2>
            <p className="text-sm text-gray-600">{housingData.metro}</p>
          </div>
          <div className="mt-2 sm:mt-0">
            <div className="flex flex-col sm:flex-row sm:items-center">
              <div className="px-4 py-2 bg-blue-50 rounded-md">
                <p className="text-sm text-gray-600">Avg. Price</p>
                <p className="text-lg font-semibold text-blue-700">
                  ${Math.round(avgPrice).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <div className="flex space-x-2">
          {(['6m', '1y', '3y', '5y', 'all'] as TimeRangeOption[]).map((range) => (
            <button
              key={range}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
              onClick={() => setTimeRange(range)} // Update onClick handler
            >
              {range === 'all' ? 'All' : range}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[400px] p-4">
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default HousingPriceChart;