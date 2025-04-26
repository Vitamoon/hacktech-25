import React from 'react';
import { HousingData } from '../../types';
import { Home, MapPin, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

interface HousingResultCardProps {
  data: HousingData;
  onSelect: (data: HousingData) => void;
}

const HousingResultCard: React.FC<HousingResultCardProps> = ({ data, onSelect }) => {
  // Calculate the latest price and year-over-year change
  const latestPrice = data.prices[data.prices.length - 1]?.value || 0;
  
  // Calculate YoY change if we have enough data
  let yoyChange = 0;
  const latestIndex = data.prices.length - 1;
  if (latestIndex >= 12) {
    const yearAgoPrice = data.prices[latestIndex - 12]?.value || data.prices[0]?.value;
    yoyChange = ((latestPrice - yearAgoPrice) / yearAgoPrice) * 100;
  }
  
  // Calculate 3-month trend
  let shortTermTrend = 0;
  if (latestIndex >= 3) {
    const threeMonthsAgoPrice = data.prices[latestIndex - 3]?.value || data.prices[0]?.value;
    shortTermTrend = ((latestPrice - threeMonthsAgoPrice) / threeMonthsAgoPrice) * 100;
  }
  
  return (
    <div 
      className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
      onClick={() => onSelect(data)}
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="p-2 bg-blue-50 rounded-md">
              <Home className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-semibold text-gray-900">{data.regionName}</h3>
              <div className="flex items-center text-sm text-gray-600">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{data.city}, {data.state}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">${latestPrice.toLocaleString()}</p>
            <div className={`flex items-center text-sm ${
              yoyChange >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {yoyChange >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{yoyChange >= 0 ? '+' : ''}{yoyChange.toFixed(1)}% YoY</span>
            </div>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="text-xs text-gray-500">County</p>
            <p className="text-sm font-medium text-gray-800">{data.countyName}</p>
          </div>
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="text-xs text-gray-500">Metro Area</p>
            <p className="text-sm font-medium text-gray-800 truncate">{data.metro}</p>
          </div>
          <div className={`${
            shortTermTrend >= 0 ? 'bg-green-50' : 'bg-red-50'
          } p-2 rounded-md`}>
            <p className="text-xs text-gray-500">3-Month Trend</p>
            <p className={`text-sm font-medium ${
              shortTermTrend >= 0 ? 'text-green-700' : 'text-red-700'
            }`}>
              {shortTermTrend >= 0 ? '+' : ''}{shortTermTrend.toFixed(1)}%
            </p>
          </div>
          <div className="bg-blue-50 p-2 rounded-md">
            <p className="text-xs text-gray-500">Region Type</p>
            <p className="text-sm font-medium text-blue-700 capitalize">{data.regionType}</p>
          </div>
        </div>
        
        <button 
          className="mt-3 w-full flex items-center justify-center text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          onClick={() => onSelect(data)}
        >
          View Price History
          <ArrowRight className="ml-1 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default HousingResultCard;