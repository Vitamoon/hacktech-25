import React, { useState } from 'react';
import { Search, X } from 'lucide-react';

interface HousingSearchFormProps {
  onSearch: (query: string) => void;
}

const HousingSearchForm: React.FC<HousingSearchFormProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };
  
  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">Search Housing Data</h2>
        <p className="text-sm text-gray-600">
          Search by ZIP code, city, state, or county
        </p>
      </div>
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="block w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter ZIP code, city, state, or county..."
            />
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                <X className="w-5 h-5 text-gray-400 hover:text-gray-500" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setQuery('CA')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              California
            </button>
            <button
              type="button"
              onClick={() => setQuery('90210')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              Beverly Hills
            </button>
            <button
              type="button"
              onClick={() => setQuery('94102')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              San Francisco
            </button>
            <button
              type="button"
              onClick={() => setQuery('95630')}
              className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              Folsom
            </button>
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HousingSearchForm;