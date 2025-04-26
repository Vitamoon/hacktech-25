import { Lake, WaterLevelReading, Alert, DataSource, LakeForecast } from '../types';
import { subDays, format, addDays } from 'date-fns';

// Generate historical water level readings
const generateReadings = (baseLevel: number, days: number, variance: number): WaterLevelReading[] => {
  const readings: WaterLevelReading[] = [];
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    // Create some randomness but with a pattern
    const noise = Math.sin(i * 0.5) * variance * 0.5 + (Math.random() - 0.5) * variance;
    readings.push({
      timestamp: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      level: baseLevel + noise
    });
  }
  
  return readings;
};

// Generate forecast data
const generateForecast = (currentLevel: number, days: number): LakeForecast[] => {
  const forecasts: LakeForecast[] = [];
  const now = new Date();
  
  for (let i = 1; i <= days; i++) {
    const date = addDays(now, i);
    const predicted = currentLevel + (Math.sin(i * 0.5) * 0.5) + (i * 0.05);
    const uncertainty = 0.1 + (i * 0.05); // Uncertainty increases with time
    
    forecasts.push({
      timestamp: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      predicted,
      lowerBound: predicted - uncertainty,
      upperBound: predicted + uncertainty
    });
  }
  
  return forecasts;
};

export const mockLakes: Lake[] = [
  {
    id: 'lake-superior',
    name: 'Lake Superior',
    location: { lat: 47.7, lng: -87.5 },
    currentLevel: 183.5,
    normalLevel: 183.4,
    status: 'normal',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-michigan',
    name: 'Lake Michigan',
    location: { lat: 44.0, lng: -87.0 },
    currentLevel: 176.8,
    normalLevel: 176.5,
    status: 'warning',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-huron',
    name: 'Lake Huron',
    location: { lat: 45.0, lng: -82.0 },
    currentLevel: 176.8,
    normalLevel: 176.5,
    status: 'warning',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-erie',
    name: 'Lake Erie',
    location: { lat: 42.2, lng: -81.2 },
    currentLevel: 173.5,
    normalLevel: 174.0,
    status: 'low',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-ontario',
    name: 'Lake Ontario',
    location: { lat: 43.6, lng: -77.8 },
    currentLevel: 75.2,
    normalLevel: 74.7,
    status: 'danger',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-champlain',
    name: 'Lake Champlain',
    location: { lat: 44.5, lng: -73.3 },
    currentLevel: 29.8,
    normalLevel: 29.5,
    status: 'warning',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'great-salt-lake',
    name: 'Great Salt Lake',
    location: { lat: 41.0, lng: -112.5 },
    currentLevel: 1279.2,
    normalLevel: 1280.0,
    status: 'low',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-okeechobee',
    name: 'Lake Okeechobee',
    location: { lat: 26.9, lng: -80.8 },
    currentLevel: 12.8,
    normalLevel: 12.5,
    status: 'warning',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-powell',
    name: 'Lake Powell',
    location: { lat: 37.1, lng: -111.3 },
    currentLevel: 3532.0,
    normalLevel: 3570.0,
    status: 'low',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'lake-mead',
    name: 'Lake Mead',
    location: { lat: 36.1, lng: -114.7 },
    currentLevel: 1068.0,
    normalLevel: 1090.0,
    status: 'danger',
    lastUpdated: new Date().toISOString()
  }
];

// Create a lookup for each lake's readings
export const mockReadings: Record<string, WaterLevelReading[]> = {};
export const mockForecasts: Record<string, LakeForecast[]> = {};

mockLakes.forEach(lake => {
  mockReadings[lake.id] = generateReadings(lake.currentLevel, 30, 0.5);
  mockForecasts[lake.id] = generateForecast(lake.currentLevel, 7);
});

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    lakeId: 'lake-ontario',
    lakeName: 'Lake Ontario',
    type: 'rising',
    message: 'Water level rising rapidly, 15% above seasonal average',
    timestamp: subDays(new Date(), 1).toISOString(),
    acknowledged: false,
    severity: 'danger'
  },
  {
    id: 'alert-2',
    lakeId: 'lake-mead',
    lakeName: 'Lake Mead',
    type: 'falling',
    message: 'Water level critically low, 20% below minimum operating level',
    timestamp: subDays(new Date(), 2).toISOString(),
    acknowledged: false,
    severity: 'danger'
  },
  {
    id: 'alert-3',
    lakeId: 'lake-erie',
    lakeName: 'Lake Erie',
    type: 'falling',
    message: 'Water level below seasonal average',
    timestamp: subDays(new Date(), 3).toISOString(),
    acknowledged: true,
    severity: 'warning'
  },
  {
    id: 'alert-4',
    lakeId: 'lake-michigan',
    lakeName: 'Lake Michigan',
    type: 'rising',
    message: 'Water level 5% above seasonal average',
    timestamp: subDays(new Date(), 4).toISOString(),
    acknowledged: false,
    severity: 'warning'
  }
];

export const mockDataSources: DataSource[] = [
  {
    id: 'source-1',
    name: 'USGS Water Services',
    type: 'USGS',
    lastSynced: subDays(new Date(), 0).toISOString(),
    status: 'online'
  },
  {
    id: 'source-2',
    name: 'NASA G-REALM',
    type: 'NASA',
    lastSynced: subDays(new Date(), 1).toISOString(),
    status: 'online'
  },
  {
    id: 'source-3',
    name: 'Global Water Monitor',
    type: 'NASA',
    lastSynced: subDays(new Date(), 2).toISOString(),
    status: 'syncing'
  },
  {
    id: 'source-4',
    name: 'OGC SensorThings API',
    type: 'OGC',
    lastSynced: subDays(new Date(), 0).toISOString(),
    status: 'offline'
  }
];