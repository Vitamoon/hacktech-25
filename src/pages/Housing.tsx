import React, { useState, useEffect } from 'react';
import { parse } from 'papaparse';
import { Line } from 'react-chartjs-2';
import { SearchIcon } from 'lucide-react';
import type { HousingData } from '../types';

const Housing: React.FC = () => {
  const [housingData, setHousingData] = useState<HousingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<HousingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/data/Zip_zhvi_uc_sfrcondo_tier_0.33_0.67_sm_sa_month.csv');
        const csvText = await response.text();
        const result = parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });
        setHousingData(result.data as HousingData[]);
        setLoading(false);
      } catch (error) {
        console.error('Error loading housing data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredData = housingData.filter(region =>
    (region.RegionName?.toString() || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (region.City || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (region.StateName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriceData = (region: HousingData) => {
    const dates: string[] = [];
    const prices: number[] = [];

    Object.entries(region).forEach(([key, value]) => {
      if (key.match(/^\d{4}-\d{2}-\d{2}$/)) {
        dates.push(key);
        prices.push(Number(value));
      }
    });

    return { dates, prices };
  };

  const chartData = selectedRegion ? {
    labels: getPriceData(selectedRegion).dates,
    datasets: [
      {
        label: `Home Values - ${selectedRegion.City}, ${selectedRegion.State}`,
        data: getPriceData(selectedRegion).prices,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  } : null;

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            return `$${context.raw.toLocaleString()}`;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (value: any) => `$${value.toLocaleString()}`,
        },
      },
    },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Housing Market Analysis</h1>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by ZIP, city, or state..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <SearchIcon className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Regions</h2>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: '600px' }}>
            {filteredData.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No regions found matching your search.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredData.map((region) => (
                  <button
                    key={region.RegionID}
                    onClick={() => setSelectedRegion(region)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedRegion?.RegionID === region.RegionID ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900">
                      {region.City}, {region.State}
                    </div>
                    <div className="text-sm text-gray-500">
                      ZIP: {region.RegionName} | {region.CountyName}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Price History</h2>
          </div>
          <div className="p-4">
            {selectedRegion ? (
              <div className="h-[500px]">
                <Line data={chartData!} options={chartOptions} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-[500px] text-gray-500">
                Select a region to view price history
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Housing;