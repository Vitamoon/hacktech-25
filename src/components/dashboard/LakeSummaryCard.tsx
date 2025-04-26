import React from 'react';
import { Lake } from '../../types';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Droplet, AlertTriangle } from 'lucide-react';

interface LakeSummaryCardProps {
  lake: Lake;
}

const LakeSummaryCard: React.FC<LakeSummaryCardProps> = ({ lake }) => {
  const navigate = useNavigate();
  
  // Determine status and styling based on water level
  const isHigh = lake.currentLevel > lake.criticalHighLevel;
  const isLow = lake.currentLevel < lake.criticalLowLevel;
  const statusText = isHigh ? 'High' : isLow ? 'Low' : 'Normal';
  const statusColor = isHigh 
    ? 'bg-red-100 text-red-800' 
    : isLow 
      ? 'bg-orange-100 text-orange-800' 
      : 'bg-green-100 text-green-800';
  
  // Calculate percentage relative to normal and critical levels
  const normalDiff = ((lake.currentLevel - lake.normalLevel) / lake.normalLevel) * 100;
  const diffText = normalDiff > 0 
    ? `+${normalDiff.toFixed(1)}%` 
    : `${normalDiff.toFixed(1)}%`;
  const diffColor = normalDiff > 0 ? 'text-red-600' : 'text-blue-600';
  
  // Convert surface area to appropriate units
  // Convert surface area from km² to ft²
  const areaText = (() => {
    const sqFeet = lake.surfaceArea * 10764; // 1 km² = 10,764 ft²
    if (sqFeet > 1000000) {
      return `${(sqFeet / 1000000).toFixed(1)} million ft²`;
    }
    return `${Math.round(sqFeet).toLocaleString()} ft²`;
  })();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg">
      <div className="p-5">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{lake.name}</h3>
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
            {statusText}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-3">
          <div className="flex items-center">
            <Droplet size={18} className="text-blue-500 mr-2" />
            <div>
              <p className="text-sm text-gray-500">Current Level</p>
              <p className="text-base font-medium">{lake.currentLevel.toFixed(1)} ft</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">vs Normal</p>
            <p className={`text-base font-medium ${diffColor}`}>
              {diffText}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Surface Area</p>
            <p className="text-base font-medium">{areaText}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-500">Data Source</p>
            <p className="text-base font-medium">{lake.dataSource}</p>
          </div>
        </div>
        
        {/* Alert indicator for critical levels */}
        {(isHigh || isLow) && (
          <div className="flex items-center mt-3 p-2 rounded-md bg-red-50 text-red-700 text-sm">
            <AlertTriangle size={16} className="mr-2" />
            <span>
              {isHigh 
                ? 'Water level exceeds critical high threshold' 
                : 'Water level below critical low threshold'}
            </span>
          </div>
        )}
        
        <button
          onClick={() => navigate(`/lake/${lake.id}`)}
          className="mt-4 w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300"
        >
          View Details
          <ArrowUpRight size={16} className="ml-1" />
        </button>
      </div>
    </div>
  );
};

export default LakeSummaryCard;