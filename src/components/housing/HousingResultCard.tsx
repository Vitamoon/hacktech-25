import React, { useState } from 'react'; // Ensure useState is imported
import { HousingData } from '../../types';
import { Home, MapPin, ArrowRight, TrendingUp, TrendingDown, BrainCircuit, X, Droplet } from 'lucide-react';

// Define the TimeRangeOption type, matching the one in HousingPriceChart
type TimeRangeOption = '6m' | '1y' | '3y' | '5y' | 'all';

interface HousingResultCardProps {
  data: HousingData;
  onSelect: (data: HousingData) => void;
  timeRange?: TimeRangeOption; // Make timeRange optional
}

const HousingResultCard: React.FC<HousingResultCardProps> = ({ data, onSelect, timeRange = '1y' }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // --- Function to handle AI Summary button click ---
  const handleSummaryClick = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card's main onClick from firing
    setIsModalOpen(true);
    setSummary(null); // Clear previous summary
    setSummaryError(null); // Clear previous error
    setIsLoadingSummary(true);

    try {
      // --- IMPORTANT: Replace with your actual backend endpoint ---
      const response = await fetch('/api/summarize-housing', { // Placeholder URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Send relevant data for the summary
        body: JSON.stringify({
          regionName: data.regionName,
          city: data.city,
          state: data.state,
          countyName: data.countyName,
          metro: data.metro,
          latestPrice: latestPrice, // Assuming latestPrice is calculated above
          changePercentage: changePercentage, // Assuming changePercentage is calculated above
          changeLabel: changeLabel, // Assuming changeLabel is calculated above
          prices: data.prices.slice(-12) // Send last 12 months for context, adjust as needed
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setSummary(result.summary);

    } catch (error: any) {
      console.error("Error fetching AI summary:", error);
      setSummaryError(error.message || "Failed to generate summary. Please try again.");
    } finally {
      setIsLoadingSummary(false);
    }
  };

  // --- Function to close the modal ---
  const closeModal = () => {
    setIsModalOpen(false);
  };

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


  // Calculate flood risk based on zip code
  const calculateFloodRisk = (): { risk: number; level: 'High' | 'Low' | 'Normal' } => {
    // This is a simplified mock implementation
    // In a real app, you would use actual proximity data to USGS lakes
    
    // Use the zip code to generate a deterministic but seemingly random risk value
    const zipNum = parseInt(data.regionName, 10);
    if (isNaN(zipNum)) return { risk: 5, level: 'Normal' };
    
    // Generate a risk value between 0-100 based on the zip code
    // This is just for demonstration - in a real app you'd use actual geographic data
    const hash = (zipNum % 997) / 997; // Simple hash between 0-1
    const risk = Math.round(hash * 100);
    
    // Determine risk level based on the calculated risk value
    let level: 'High' | 'Low' | 'Normal';
    if (risk >= 40) {
      level = 'High';
    } else if (risk >= 10) {
      level = 'Low';
    } else {
      level = 'Normal';
    }
    
    return { risk, level };
  };
  
  const floodRisk = calculateFloodRisk();
  
  // Determine styling based on risk level
  const getRiskStyles = () => {
    switch (floodRisk.level) {
      case 'High':
        return {
          bg: 'bg-orange-50',
          text: 'text-orange-700',
          border: 'border-orange-200'
        };
      case 'Low':
        return {
          bg: 'bg-yellow-50',
          text: 'text-yellow-700',
          border: 'border-yellow-200'
        };
      default:
        return {
          bg: 'bg-blue-50',
          text: 'text-blue-700',
          border: 'border-blue-200'
        };
    }
  };
  
  const riskStyles = getRiskStyles();

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
            <div className={`flex items-center justify-end text-sm ${
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
          {/* Replace Region Type with Flood Risk */}
          <div className={`${riskStyles.bg} p-2 rounded-md border ${riskStyles.border}`}>
            <p className="text-xs text-gray-500">Risk of Flooding</p>
            <p className={`text-sm font-medium flex items-center ${riskStyles.text}`}>
              <Droplet className="h-3 w-3 mr-1" />
              {floodRisk.level} ({floodRisk.risk}%)
            </p>
          </div>
          {/* Size Rank Field */}
          <div className="bg-gray-50 p-2 rounded-md">
            <p className="text-xs text-gray-500">Size Rank</p>
            <p className="text-sm font-medium text-gray-800">{data.sizeRank ? data.sizeRank.toLocaleString() : 'N/A'}</p>
          </div>
          
          {/* AI Summary Button */}
          <div className="bg-purple-50 hover:bg-purple-100 p-2 rounded-md text-left transition-colors cursor-pointer"
               onClick={handleSummaryClick}>
            <p className="text-xs text-gray-500">Analysis</p>
            <p className="text-sm font-medium text-purple-700 capitalize flex items-center">
              <BrainCircuit className="h-4 w-4 mr-1 inline" /> AI Summary
            </p>
          </div>
        </div>

        {/* View Price History Button - Outside of grid */}
        <div className="mt-4">
          <button
            className="w-full flex items-center justify-center text-sm text-blue-600 font-medium hover:text-blue-800 transition-colors"
          >
            View Price History
            <ArrowRight className="ml-1 h-4 w-4" />
          </button>
        </div>

      </div>

      {/* AI Summary Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm"
          onClick={closeModal} // Close modal on background click
        >
          <div
            className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full relative"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal content
          >
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
              <BrainCircuit className="h-5 w-5 mr-2 text-purple-600" /> AI Summary for {data.regionName}
            </h2>
            {isLoadingSummary && (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                <p className="ml-3 text-gray-600">Generating summary...</p>
              </div>
            )}
            {summaryError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error:</strong>
                <span className="block sm:inline"> {summaryError}</span>
              </div>
            )}
            {summary && !isLoadingSummary && (
              <div className="text-gray-700 space-y-3 whitespace-pre-wrap max-h-[60vh] overflow-y-auto">
                {/* Display the summary */}
                <p>{summary}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default HousingResultCard;