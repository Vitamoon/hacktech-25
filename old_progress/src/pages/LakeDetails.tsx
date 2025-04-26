import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  DropletIcon, 
  ArrowLeftIcon, 
  CalendarIcon,
  TrendingUpIcon, 
  TrendingDownIcon,
  AlertCircleIcon,
  MapIcon
} from 'lucide-react';
import WaterLevelChart from '../components/WaterLevelChart';
import LakeMap from '../components/LakeMap';
import { mockLakes, mockReadings, mockForecasts } from '../data/mockData';

type TimeRange = '7d' | '30d' | '90d' | 'all';

const LakeDetails: React.FC = () => {
  const { lakeId } = useParams<{ lakeId: string }>();
  const navigate = useNavigate();
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>('30d');
  const [showMap, setShowMap] = useState(false);

  const lake = mockLakes.find((l) => l.id === lakeId);
  const readings = lakeId ? mockReadings[lakeId] : [];
  const forecasts = lakeId ? mockForecasts[lakeId] : [];

  if (!lake) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <AlertCircleIcon className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lake Not Found</h2>
        <p className="text-gray-600 mb-4">The lake you're looking for doesn't exist or isn't being monitored.</p>
        <button
          onClick={() => navigate('/')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Return to Dashboard
        </button>
      </div>
    );
  }

  const timeRanges: { label: string; value: TimeRange }[] = [
    { label: '7 Days', value: '7d' },
    { label: '30 Days', value: '30d' },
    { label: '90 Days', value: '90d' },
    { label: 'All Time', value: 'all' },
  ];

  const getStatusColor = () => {
    switch (lake.status) {
      case 'normal':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'danger':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getLevelTrend = () => {
    if (readings.length < 2) return null;
    
    const lastIndex = readings.length - 1;
    const currentLevel = readings[lastIndex].level;
    const previousLevel = readings[lastIndex - 1].level;
    
    const difference = currentLevel - previousLevel;
    const trend = difference >= 0 ? 'rising' : 'falling';
    
    return {
      trend,
      difference: Math.abs(difference).toFixed(2),
      icon: trend === 'rising' 
        ? <TrendingUpIcon className="w-5 h-5 text-red-500" /> 
        : <TrendingDownIcon className="w-5 h-5 text-blue-500" />
    };
  };

  const trend = getLevelTrend();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-white hover:bg-gray-100 transition-colors"
        >
          <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900">{lake.name}</h1>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${getStatusColor()}`}
        >
          {lake.status}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Current Level</h3>
            <DropletIcon className="h-5 w-5 text-blue-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{lake.currentLevel}m</p>
          {trend && (
            <div className="mt-2 flex items-center text-sm">
              {trend.icon}
              <span className="ml-1">
                {trend.difference}m {trend.trend}
              </span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Normal Level</h3>
            <DropletIcon className="h-5 w-5 text-green-500" />
          </div>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{lake.normalLevel}m</p>
          <p className="mt-2 text-sm text-gray-500">Historical average</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
            <CalendarIcon className="h-5 w-5 text-gray-500" />
          </div>
          <p className="mt-2 text-xl font-semibold text-gray-900">
            {new Date(lake.lastUpdated).toLocaleDateString()}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            {new Date(lake.lastUpdated).toLocaleTimeString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-500">Location</h3>
            <MapIcon className="h-5 w-5 text-gray-500" />
          </div>
          <p className="mt-2 text-xl font-semibold text-gray-900">
            {lake.location.lat.toFixed(3)}, {lake.location.lng.toFixed(3)}
          </p>
          <button
            onClick={() => setShowMap(!showMap)}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            {showMap ? 'Hide map' : 'Show on map'}
          </button>
        </div>
      </div>

      {showMap && (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Lake Location</h2>
          </div>
          <div className="h-[300px]">
            <LakeMap 
              lakes={[lake]} 
              selectedLake={lake.id}
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">Water Level History</h2>
          <div className="flex space-x-2">
            {timeRanges.map((range) => (
              <button
                key={range.value}
                onClick={() => setSelectedTimeRange(range.value)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedTimeRange === range.value
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <WaterLevelChart
            data={readings}
            normalLevel={lake.normalLevel}
            forecast={forecasts}
            timeRange={selectedTimeRange}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Environmental Impact</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Shoreline Exposure</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      lake.status === 'low' || lake.status === 'danger'
                        ? 'bg-red-600'
                        : lake.status === 'warning'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.abs((lake.currentLevel / lake.normalLevel - 1) * 200))}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {lake.currentLevel < lake.normalLevel
                    ? 'Exposed shoreline may impact local ecosystems and habitats.'
                    : 'Shoreline conditions are within normal parameters.'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Wetland Health Index</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="h-2.5 rounded-full bg-green-500"
                    style={{ width: `${90 - Math.abs((lake.currentLevel / lake.normalLevel - 1) * 50)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Based on water level and seasonal patterns, wetland health is currently stable.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Downstream Flow Impact</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full ${
                      lake.status === 'danger'
                        ? 'bg-red-600'
                        : lake.status === 'warning' || lake.status === 'low'
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${70 + (lake.currentLevel / lake.normalLevel) * 20}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Current water levels are affecting downstream flow patterns.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Forecasting Insights</h2>
          </div>
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">7-Day Prediction</h3>
              <p className="text-sm text-gray-600">
                {forecasts && forecasts.length > 0 && (
                  <>
                    Water levels are predicted to 
                    {forecasts[forecasts.length - 1].predicted > lake.currentLevel
                      ? ' rise by approximately ' + (forecasts[forecasts.length - 1].predicted - lake.currentLevel).toFixed(2) + 'm'
                      : ' fall by approximately ' + (lake.currentLevel - forecasts[forecasts.length - 1].predicted).toFixed(2) + 'm'
                    } 
                    over the next 7 days.
                  </>
                )}
              </p>
            </div>

            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Risk Assessment</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Flood Risk</span>
                    <span className="text-xs font-medium text-gray-500">
                      {lake.currentLevel > lake.normalLevel ? 'Moderate' : 'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full" 
                      style={{ width: `${lake.currentLevel > lake.normalLevel ? 50 : 20}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium text-gray-500">Drought Risk</span>
                    <span className="text-xs font-medium text-gray-500">
                      {lake.currentLevel < lake.normalLevel * 0.9 ? 'High' : 'Low'}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-orange-500 h-1.5 rounded-full" 
                      style={{ width: `${lake.currentLevel < lake.normalLevel * 0.9 ? 80 : 30}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Recommendations</h3>
              <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                <li>Continue regular monitoring of water levels.</li>
                <li>
                  {lake.status === 'danger' || lake.status === 'warning'
                    ? 'Coordinate with local authorities for potential response actions.'
                    : 'No immediate action required.'}
                </li>
                <li>Assess impact on local ecosystems and habitats.</li>
                <li>
                  {lake.currentLevel < lake.normalLevel * 0.9
                    ? 'Consider water conservation measures in the region.'
                    : 'Standard water management protocols sufficient.'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LakeDetails;