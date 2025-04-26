import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, Share2, AlertTriangle, Download, Map } from 'lucide-react';
import { useDataContext } from '../context/DataContext';
import LakeLevelChart from '../components/dashboard/LakeLevelChart';
import LakesMap from '../components/dashboard/LakesMap';

const LakeDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { lakes, readings, forecasts } = useDataContext();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [lake, setLake] = useState<any>(null);
  
  useEffect(() => {
    if (id && lakes.length > 0) {
      const foundLake = lakes.find(lake => lake.id === id);
      if (foundLake) {
        setLake(foundLake);
      }
    }
  }, [id, lakes]);
  
  if (!lake) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Determine water level status
  const isHigh = lake.currentLevel > lake.criticalHighLevel;
  const isLow = lake.currentLevel < lake.criticalLowLevel;
  const statusText = isHigh ? 'High' : isLow ? 'Low' : 'Normal';
  const statusColor = isHigh 
    ? 'bg-red-100 text-red-800' 
    : isLow 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-green-100 text-green-800';
  
  // Calculate difference from normal level
  const diffFromNormal = lake.currentLevel - lake.normalLevel;
  const diffPercent = (diffFromNormal / lake.normalLevel) * 100;
  
  return (
    <div className="space-y-6">
      {/* Header with back button */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-2xl font-bold text-gray-800">{lake.name}</h1>
        <span className={`ml-2 px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
          {statusText}
        </span>
      </div>
      
      {/* Lake Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Current Water Level</p>
          <p className="text-2xl font-bold text-gray-900">{lake.currentLevel.toFixed(2)} ft</p>
          <div className={`mt-1 inline-flex items-center text-sm ${
            diffFromNormal >= 0 ? 'text-blue-600' : 'text-red-600'
          }`}>
            {diffFromNormal >= 0 ? '+' : ''}{diffFromNormal.toFixed(2)} ft ({diffPercent.toFixed(1)}%)
          </div>
          <p className="mt-2 text-sm text-gray-600">from normal level</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Surface Area</p>
          <p className="text-2xl font-bold text-gray-900">
            {lake.surfaceArea >= 1000 
              ? `${(lake.surfaceArea / 1000).toFixed(1)} thousand` 
              : lake.surfaceArea} km²
          </p>
          <p className="mt-1 text-sm text-gray-600">Data Source: {lake.dataSource}</p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-md">
          <p className="text-sm text-gray-500">Critical Thresholds</p>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
              <p className="text-sm">High: {lake.criticalHighLevel.toFixed(2)} ft</p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
              <p className="text-sm">Normal: {lake.normalLevel.toFixed(2)} ft</p>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-orange-500 mr-2"></div>
              <p className="text-sm">Low: {lake.criticalLowLevel.toFixed(2)} ft</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Warning Alert if water level is critical */}
      {(isHigh || isLow) && (
        <div className={`p-4 rounded-lg ${isHigh ? 'bg-red-50' : 'bg-orange-50'} flex items-start`}>
          <AlertTriangle className={`w-5 h-5 mr-3 ${isHigh ? 'text-red-600' : 'text-orange-600'}`} />
          <div>
            <h3 className={`font-medium ${isHigh ? 'text-red-800' : 'text-orange-800'}`}>
              {isHigh ? 'Critical High Water Level' : 'Critical Low Water Level'}
            </h3>
            <p className="text-sm mt-1">
              {isHigh 
                ? 'Water level is above the critical high threshold. Potential flooding risk.' 
                : 'Water level is below the critical low threshold. Potential drought impacts.'}
            </p>
          </div>
        </div>
      )}
      
      {/* Water Level Chart */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-800">Historical Water Levels</h2>
          </div>
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
          name={lake.name}
          readings={readings[lake.id] || []}
          forecasts={forecasts[lake.id] || []}
          normalLevel={lake.normalLevel}
          criticalHighLevel={lake.criticalHighLevel}
          criticalLowLevel={lake.criticalLowLevel}
          timeRange={selectedTimeRange}
        />
      </div>
      
      {/* Map location */}
      <div>
        <div className="flex items-center mb-4">
          <Map className="w-5 h-5 mr-2 text-gray-500" />
          <h2 className="text-xl font-semibold text-gray-800">Location</h2>
        </div>
        <div className="h-[300px]">
          <LakesMap />
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Download Data
        </button>
        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors">
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </button>
      </div>
    </div>
  );
};

export default LakeDetails;