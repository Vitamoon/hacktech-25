import React, { useState } from 'react';
import { Droplet, TrendingUp, Info, AlertTriangle } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import { useAlertContext } from '../context/AlertContext';
import LakesMap from '../components/dashboard/LakesMap';
import LakeSummaryCard from '../components/dashboard/LakeSummaryCard';
import StatsCard from '../components/dashboard/StatsCard';
import AlertsList from '../components/dashboard/AlertsList';
import LakeLevelChart from '../components/dashboard/LakeLevelChart';

const Dashboard: React.FC = () => {
  const { lakes, readings, forecasts, loading, error } = useDataContext();
  const { alerts } = useAlertContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  
  // Calculate overall statistics
  const calculateStats = () => {
    let totalLakes = lakes.length;
    let criticalHighCount = 0;
    let criticalLowCount = 0;
    let changingTrend = 0;
    
    lakes.forEach(lake => {
      if (lake.currentLevel > lake.criticalHighLevel) {
        criticalHighCount++;
      } else if (lake.currentLevel < lake.criticalLowLevel) {
        criticalLowCount++;
      }
      
      // Check if there's a significant trend in the last 7 days
      const lakeReadings = readings[lake.id];
      if (lakeReadings && lakeReadings.length >= 7) {
        const recentReadings = lakeReadings.slice(-7);
        let rising = true;
        let falling = true;
        
        for (let i = 1; i < recentReadings.length; i++) {
          if (recentReadings[i].level <= recentReadings[i-1].level) {
            rising = false;
          }
          if (recentReadings[i].level >= recentReadings[i-1].level) {
            falling = false;
          }
        }
        
        if (rising || falling) {
          changingTrend++;
        }
      }
    });
    
    return {
      totalLakes,
      criticalHighCount,
      criticalLowCount,
      changingTrend,
    };
  };
  
  const stats = calculateStats();
  
  // Find a featured lake (one with the most extreme level relative to normal)
  const getFeaturedLake = () => {
    if (lakes.length === 0) return null;
    
    let extremeLake = lakes[0];
    let maxDifference = Math.abs(lakes[0].currentLevel - lakes[0].normalLevel) / lakes[0].normalLevel;
    
    lakes.forEach(lake => {
      const difference = Math.abs(lake.currentLevel - lake.normalLevel) / lake.normalLevel;
      if (difference > maxDifference) {
        maxDifference = difference;
        extremeLake = lake;
      }
    });
    
    return extremeLake;
  };
  
  const featuredLake = getFeaturedLake();
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-700 p-4 rounded-md">
        <h2 className="text-lg font-semibold">Error</h2>
        <p>{error}</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Water Level Dashboard</h1>
          <p className="text-gray-600">Real-time monitoring of lake water levels</p>
        </div>
        <div className="mt-4 md:mt-0">
          <button
            onClick={() => {/* Refresh data */}}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Monitored Lakes"
          value={stats.totalLakes}
          icon={<Droplet className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="High Alert Lakes"
          value={stats.criticalHighCount}
          trend={stats.criticalHighCount > 0 ? 100 : 0}
          trendLabel="Requires attention"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="red"
        />
        <StatsCard
          title="Low Alert Lakes"
          value={stats.criticalLowCount}
          trend={stats.criticalLowCount > 0 ? 100 : 0}
          trendLabel="Requires attention"
          icon={<AlertTriangle className="w-6 h-6" />}
          color="orange"
        />
        <StatsCard
          title="Changing Trend"
          value={stats.changingTrend}
          icon={<TrendingUp className="w-6 h-6" />}
          color="green"
        />
      </div>
      
      {/* Map and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LakesMap />
        </div>
        <div className="lg:col-span-1">
          <AlertsList />
        </div>
      </div>
      
      {/* Featured Lake Chart */}
      {featuredLake && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Featured Lake</h2>
            <div className="flex space-x-2">
              {['7d', '30d', '90d', '1y', 'all'].map((range) => (
                <button
                  key={range}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedTimeRange === range
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedTimeRange(range as any)}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <LakeLevelChart
            name={featuredLake.name}
            readings={readings[featuredLake.id] || []}
            forecasts={forecasts[featuredLake.id] || []}
            normalLevel={featuredLake.normalLevel}
            criticalHighLevel={featuredLake.criticalHighLevel}
            criticalLowLevel={featuredLake.criticalLowLevel}
            timeRange={selectedTimeRange}
          />
        </div>
      )}
      
      {/* Lake Cards */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Monitored Lakes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {lakes.slice(0, 6).map(lake => (
            <LakeSummaryCard key={lake.id} lake={lake} />
          ))}
        </div>
        {lakes.length > 6 && (
          <div className="mt-4 text-center">
            <button className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
              View All Lakes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;