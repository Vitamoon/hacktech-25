import React from 'react';
import { HousingData } from '../../types';
import { Home, MapPin, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react';

// Define the TimeRangeOption type, matching the one in HousingPriceChart
type TimeRangeOption = '6m' | '1y' | '3y' | '5y' | 'all';

interface HousingResultCardProps {
  data: HousingData;
  onSelect: (data: HousingData) => void;
  timeRange: TimeRangeOption; // Add timeRange prop
}

const HousingResultCard: React.FC<HousingResultCardProps> = ({ data, onSelect, timeRange }) => {
  // Calculate the latest price
  const latestPriceData = data.prices[data.prices.length - 1];
  const latestPrice = latestPriceData?.value || 0;
  const latestDate = latestPriceData ? new Date(latestPriceData.date) : new Date();

  // Calculate change based on timeRange
  let changePercentage = 0;
  let changeLabel = 'YoY'; // Default label
  let comparisonPrice = 0;
  const prices = data.prices;
  const latestIndex = prices.length - 1;

  const getMonthsForRange = (range: TimeRangeOption): number => {
    switch (range) {
      case '6m': return 6;
      case '1y': return 12;
      case '3y': return 36;
      case '5y': return 60;
      case 'all': return prices.length > 1 ? prices.length -1 : 12; // Use max available or default to 1 year
      default: return 12;
    }
  };

  const monthsToCompare = getMonthsForRange(timeRange);

  if (latestIndex >= monthsToCompare) {
    comparisonPrice = prices[latestIndex - monthsToCompare]?.value || prices[0]?.value;
    if (comparisonPrice !== 0) {
      changePercentage = ((latestPrice - comparisonPrice) / comparisonPrice) * 100;
    }
  } else if (prices.length > 1) {
    // Fallback if not enough data for the selected range, compare with the oldest data point
    comparisonPrice = prices[0].value;
     if (comparisonPrice !== 0) {
        changePercentage = ((latestPrice - comparisonPrice) / comparisonPrice) * 100;
     }
  }


  // Update label based on timeRange
  switch (timeRange) {
      case '6m': changeLabel = '6m Change'; break;
      case '1y': changeLabel = 'YoY'; break;
      case '3y': changeLabel = '3Y Change'; break;
      case '5y': changeLabel = '5Y Change'; break;
      case 'all': changeLabel = 'Total Change'; break; // Or adjust as needed for 'all'
  }


  // Calculate 3-month trend (remains the same)
  let shortTermTrend = 0;
  if (latestIndex >= 3) {
    const threeMonthsAgoPrice = data.prices[latestIndex - 3]?.value || data.prices[0]?.value;
     if (threeMonthsAgoPrice !== 0) {
        shortTermTrend = ((latestPrice - threeMonthsAgoPrice) / threeMonthsAgoPrice) * 100;
     }
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
            <div className={`flex items-center justify-end text-sm ${ // Added justify-end
              changePercentage >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {changePercentage >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              <span>{changePercentage >= 0 ? '+' : ''}{changePercentage.toFixed(1)}% {changeLabel}</span>
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
          {/* Add two new boxes */}
          <div className="bg-blue-50 p-2 rounded-md">
             <p className="text-xs text-gray-500">Region Type</p>
             <p className="text-sm font-medium text-blue-700 capitalize">{data.regionType}</p>
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