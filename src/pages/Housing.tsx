import React, { useState } from 'react';
import { useDataContext } from '../context/DataContext';
import HousingSearchForm from '../components/housing/HousingSearchForm';
import HousingResultCard from '../components/housing/HousingResultCard';
import HousingPriceChart from '../components/housing/HousingPriceChart';
import { HousingData } from '../types';
import { Info } from 'lucide-react';

const Housing: React.FC = () => {
  const { housingData, searchHousingData } = useDataContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<HousingData[]>([]);
  const [selectedHousing, setSelectedHousing] = useState<HousingData | null>(null);
  const [timeRange, setTimeRange] = useState<'6m' | '1y' | '3y' | '5y' | 'all'>('1y');
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    const results = searchHousingData(query);
    setSearchResults(results);
    
    // Clear selected housing when performing a new search
    setSelectedHousing(null);
  };
  
  const handleSelectHousing = (housing: HousingData) => {
    setSelectedHousing(housing);
    // Scroll to the chart area
    document.getElementById('chart-area')?.scrollIntoView({ behavior: 'smooth' });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Housing Price Data</h1>
        <p className="text-gray-600">Search and analyze housing prices by ZIP code, city, or state</p>
      </div>
      
      {/* CSV file location information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">Where to place your CSV file</h3>
            <p className="mt-1 text-sm text-blue-700">
              Place your Zillow housing data CSV file in the <code className="bg-blue-100 px-1 py-0.5 rounded">public/data/</code> directory as <code className="bg-blue-100 px-1 py-0.5 rounded">housing_data.csv</code>. 
              The application will automatically load this file when the Housing Data page is accessed.
            </p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <HousingSearchForm onSearch={handleSearch} />
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
        </div>
      </div>
      
      {/* Chart Area */}
      {selectedHousing && (
        <div id="chart-area" className="pt-4">
          <HousingPriceChart housingData={selectedHousing} timeRange={timeRange} />
        </div>
      )}
    </div>
  );
};

export default Housing;