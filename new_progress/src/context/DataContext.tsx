import React, { createContext, useContext, useState, useEffect } from 'react';
import { Lake, WaterLevelReading, LakeForecast, DataSource, HousingData } from '../types';
import { mockLakes, mockReadings, mockForecasts, mockDataSources } from '../data/mockData';
import { fetchUSGSLakeData } from '../services/usgsService';
import { parseHousingData } from '../services/housingService';

interface DataContextProps {
  lakes: Lake[];
  readings: Record<string, WaterLevelReading[]>;
  forecasts: Record<string, LakeForecast[]>;
  dataSources: DataSource[];
  housingData: HousingData[];
  loading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
  searchHousingData: (query: string) => HousingData[];
}

const DataContext = createContext<DataContextProps>({
  lakes: [],
  readings: {},
  forecasts: {},
  dataSources: [],
  housingData: [],
  loading: false,
  error: null,
  refreshData: async () => {},
  searchHousingData: () => [],
});

export const useDataContext = () => useContext(DataContext);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lakes, setLakes] = useState<Lake[]>(mockLakes);
  const [readings, setReadings] = useState<Record<string, WaterLevelReading[]>>(mockReadings);
  const [forecasts, setForecasts] = useState<Record<string, LakeForecast[]>>(mockForecasts);
  const [dataSources, setDataSources] = useState<DataSource[]>(mockDataSources);
  const [housingData, setHousingData] = useState<HousingData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    try {
      // In a real app, these would be real API calls
      // For now, we're using mock data and adding USGS data
      const usgsData = await fetchUSGSLakeData();
      
      // Merge mock data with real USGS data
      const updatedLakes = [...lakes, ...usgsData];
      setLakes(updatedLakes);
      
      // Load housing data from CSV
      // In a real app, this would parse an actual CSV file
      await loadHousingData();
      
      setLoading(false);
    } catch (err) {
      setError('Failed to refresh data');
      setLoading(false);
      console.error(err);
    }
  };

  const loadHousingData = async () => {
    try {
      // This would be replaced with actual CSV parsing in a real app
      // For now, we'll use a mock implementation
      const data = await parseHousingData();
      setHousingData(data);
    } catch (err) {
      console.error('Failed to load housing data', err);
    }
  };

  const searchHousingData = (query: string): HousingData[] => {
    if (!query) return housingData;
    
    const lowerQuery = query.toLowerCase();
    return housingData.filter(
      (data) =>
        data.regionName.toLowerCase().includes(lowerQuery) ||
        data.city.toLowerCase().includes(lowerQuery) ||
        data.state.toLowerCase().includes(lowerQuery) ||
        data.countyName.toLowerCase().includes(lowerQuery)
    );
  };

  // Initial data load
  useEffect(() => {
    refreshData();
  }, []);

  return (
    <DataContext.Provider
      value={{
        lakes,
        readings,
        forecasts,
        dataSources,
        housingData,
        loading,
        error,
        refreshData,
        searchHousingData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};