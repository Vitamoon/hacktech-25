import React, { useState } from 'react';
import { useDataContext } from '../context/DataContext';
import HousingSearchForm from '../components/housing/HousingSearchForm';
import HousingResultCard from '../components/housing/HousingResultCard';
import HousingPriceChart from '../components/housing/HousingPriceChart';
import ApiKeyInput from '../components/common/ApiKeyInput';
import { HousingData } from '../types';
import { Info, BrainCircuit, AlertTriangle } from 'lucide-react';
import { useApiKeyContext } from '../context/ApiKeyContext';
import { generateFloodingAnalysis } from '../services/openaiService';

const Housing: React.FC = () => {
  const { housingData, searchHousingData } = useDataContext();
  const { openaiApiKey } = useApiKeyContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HousingData[]>([]);
  const [selectedHousing, setSelectedHousing] = useState<HousingData | null>(null);
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '3y' | '5y' | 'all'>('1y');
  
  // Add state for AI summary
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = searchHousingData(query);
    setSearchResults(results);
    
    // Clear selected housing when performing a new search
    setSelectedHousing(null);
    // Clear summary when performing a new search
    setSummary(null);
    setSummaryError(null);
  };
  
  const handleSelectHousing = (housing: HousingData) => {
    setSelectedHousing(housing);
    // Clear previous summary when selecting new housing
    setSummary(null);
    setSummaryError(null);
    // Scroll to the chart area
    document.getElementById('chart-area')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Add function to generate summary
  const generateSummary = async (data: HousingData) => {
    if (!data) return;
    
    setSummary(null);
    setSummaryError(null);
    setIsLoadingSummary(true);
    
    try {
      if (!openaiApiKey) {
        throw new Error("Please enter your OpenAI API key in the settings panel");
      }
      
      // Calculate flood risk for the selected housing
      const calculateFloodRisk = (): { risk: number; level: 'High' | 'Low' | 'Normal' } => {
        const zipNum = parseInt(data.regionName, 10);
        if (isNaN(zipNum)) return { risk: 5, level: 'Normal' };
        
        const hash = (zipNum % 997) / 997;
        const risk = Math.round(hash * 100);
        
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
      
      const analysis = await generateFloodingAnalysis(
        openaiApiKey,
        floodRisk,
        data
      );
      
      setSummary(analysis);
    } catch (error: any) {
      console.error("Error generating flooding analysis:", error);
      setSummaryError(error.message || "Failed to generate analysis. Please try again.");
    } finally {
      setIsLoadingSummary(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Housing Price Data</h1>
        <p className="text-gray-600">Search and analyze housing prices by ZIP code, city, or state</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <HousingSearchForm onSearch={handleSearch} />
          <ApiKeyInput />
        </div>
        
        <div className="lg:col-span-2">
          {searchQuery && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Search Results {searchResults.length > 0 && `(${searchResults.length})`}
              </h2>
              
              {searchResults.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-gray-500">No results found for "{searchQuery}"</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {searchResults.slice(0, 6).map((result) => (
                    <HousingResultCard
                      key={result.regionId}
                      data={result}
                      onSelect={handleSelectHousing}
                      timeRange={timeRange}
                      onGenerateSummary={generateSummary}
                    />
                  ))}
                </div>
              )}
              
              {searchResults.length > 6 && (
                <div className="mt-4 text-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    View More Results
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Featured Locations - REMOVED */}
          {/*
          {!searchQuery && housingData.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Featured Locations
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {housingData.slice(0, 4).map((data) => (
                  <HousingResultCard 
                    key={data.regionId} 
                    data={data} 
                    onSelect={handleSelectHousing} 
                  />
                ))}
              </div>
            </div>
          )}
          */}
        </div>
      </div>
      
      {/* Chart Area */}
      {selectedHousing && (
        <div id="chart-area" className="pt-4 space-y-4">
          <HousingPriceChart
            housingData={selectedHousing}
            timeRange={timeRange}
            setTimeRange={setTimeRange}
          />
          
          {/* AI Summary Section */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2 text-purple-600" /> 
                  AI Analysis
                </h2>
                {!summary && !isLoadingSummary && !summaryError && (
                  <button 
                    onClick={() => generateSummary(selectedHousing)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Generate Analysis
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-6">
              {isLoadingSummary && (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
                  <p className="ml-3 text-gray-600">Generating analysis...</p>
                </div>
              )}
              
              {summaryError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline ml-1">{summaryError}</span>
                  </div>
                </div>
              )}
              
              {summary && !isLoadingSummary && (
                <div className="text-gray-700 space-y-3 whitespace-pre-wrap">
                  <p>{summary}</p>
                </div>
              )}
              
              {!summary && !isLoadingSummary && !summaryError && (
                <div className="text-center py-8 text-gray-500">
                  <BrainCircuit className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                  <p>Generate an AI analysis to get insights about this location's housing market and flooding risk.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Housing;