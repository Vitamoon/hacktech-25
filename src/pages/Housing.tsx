import React, { useState, useEffect } from 'react';
import { parse } from 'papaparse';
import { Line } from 'react-chartjs-2';
import { SearchIcon, DropletIcon, TrendingUpIcon, MapPinIcon } from 'lucide-react';
import type { HousingData, AreaAnalysis } from '../types';
import { mockLakes } from '../data/mockData';

const Housing: React.FC = () => {
  const [housingData, setHousingData] = useState<HousingData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<HousingData | null>(null);
  const [areaAnalysis, setAreaAnalysis] = useState<AreaAnalysis | null>(null);
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
        
        // Enhance data with flood risk analysis
        const enhancedData = (result.data as HousingData[]).map(region => {
          const nearestLake = findNearestLake(region);
          return {
            ...region,
            FloodRiskScore: calculateFloodRisk(region, nearestLake),
            NearestLakeDistance: nearestLake ? calculateDistance(region, nearestLake) : undefined
          };
        });
        
        setHousingData(enhancedData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading housing data:', error);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (selectedRegion) {
      const analysis = analyzeArea(selectedRegion, housingData);
      setAreaAnalysis(analysis);
    } else {
      setAreaAnalysis(null);
    }
  }, [selectedRegion, housingData]);

  const findNearestLake = (region: HousingData) => {
    return mockLakes.reduce((nearest, lake) => {
      const distance = calculateDistance(region, lake);
      if (!nearest || distance < calculateDistance(region, nearest)) {
        return lake;
      }
      return nearest;
    }, null);
  };

  const calculateDistance = (region: HousingData, lake: any) => {
    // Simple distance calculation (this would be replaced with actual geocoding in production)
    return Math.random() * 100; // Mock distance in miles
  };

  const calculateFloodRisk = (region: HousingData, nearestLake: any) => {
    if (!nearestLake) return 0;
    
    // Mock flood risk calculation based on:
    // - Distance to nearest lake
    // - Lake water level status
    // - Historical flood data (simulated)
    const distance = calculateDistance(region, nearestLake);
    const baseRisk = Math.max(0, 1 - (distance / 100));
    const lakeRiskFactor = nearestLake.status === 'danger' ? 2 :
                          nearestLake.status === 'warning' ? 1.5 :
                          nearestLake.status === 'high' ? 1.2 : 1;
    
    return baseRisk * lakeRiskFactor;
  };

  const analyzeArea = (region: HousingData, allData: HousingData[]): AreaAnalysis => {
    const prices = Object.entries(region)
      .filter(([key]) => key.match(/^\d{4}-\d{2}-\d{2}$/))
      .map(([, value]) => Number(value))
      .filter(value => !isNaN(value));

    const currentPrice = prices[prices.length - 1];
    const lastYearPrice = prices[prices.length - 13] || prices[0];
    const priceChange = currentPrice - lastYearPrice;
    const priceChangePercent = (priceChange / lastYearPrice) * 100;

    const nearbyWaterBodies = mockLakes.filter(lake => 
      calculateDistance(region, lake) < 50
    ).length;

    const floodRisk = region.FloodRiskScore || 0;
    const floodRiskLevel = floodRisk > 0.7 ? 'High' :
                          floodRisk > 0.3 ? 'Moderate' : 'Low';

    return {
      medianPrice: currentPrice,
      priceChange,
      priceChangePercent,
      floodRiskLevel,
      nearbyWaterBodies,
      averageWaterDistance: region.NearestLakeDistance || 0
    };
  };

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
                    {region.FloodRiskScore !== undefined && (
                      <div className="mt-1 flex items-center">
                        <DropletIcon className="w-4 h-4 text-blue-500 mr-1" />
                        <span className={`text-xs font-medium ${
                          region.FloodRiskScore > 0.7 ? 'text-red-600' :
                          region.FloodRiskScore > 0.3 ? 'text-yellow-600' :
                          'text-green-600'
                        }`}>
                          Flood Risk: {
                            region.FloodRiskScore > 0.7 ? 'High' :
                            region.FloodRiskScore > 0.3 ? 'Moderate' :
                            'Low'
                          }
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          {selectedRegion && areaAnalysis && (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Area Analysis</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <TrendingUpIcon className="w-5 h-5 text-blue-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Price Trends</h3>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      ${areaAnalysis.medianPrice.toLocaleString()}
                    </p>
                    <p className={`text-sm ${areaAnalysis.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {areaAnalysis.priceChange >= 0 ? '+' : ''}{areaAnalysis.priceChangePercent.toFixed(1)}% past year
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <DropletIcon className="w-5 h-5 text-blue-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Flood Risk</h3>
                    </div>
                    <p className={`mt-2 text-2xl font-semibold ${
                      areaAnalysis.floodRiskLevel === 'High' ? 'text-red-600' :
                      areaAnalysis.floodRiskLevel === 'Moderate' ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {areaAnalysis.floodRiskLevel}
                    </p>
                    <p className="text-sm text-gray-600">
                      {areaAnalysis.nearbyWaterBodies} nearby water bodies
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center">
                      <MapPinIcon className="w-5 h-5 text-blue-500 mr-2" />
                      <h3 className="text-sm font-medium text-gray-900">Water Proximity</h3>
                    </div>
                    <p className="mt-2 text-2xl font-semibold text-gray-900">
                      {areaAnalysis.averageWaterDistance.toFixed(1)} mi
                    </p>
                    <p className="text-sm text-gray-600">
                      to nearest water body
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Price History</h2>
            </div>
            <div className="p-4">
              {selectedRegion ? (
                <div className="h-[400px]">
                  <Line data={chartData!} options={chartOptions} />
                </div>
              ) : (
                <div className="flex items-center justify-center h-[400px] text-gray-500">
                  Select a region to view price history
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Housing;