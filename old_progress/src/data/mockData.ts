import { Lake, WaterLevelReading, Alert, DataSource, LakeForecast } from '../types';
import { subDays, format, addDays, getMonth } from 'date-fns';

// Get lake-specific parameters
const getLakeParameters = (lakeId: string): {
  seasonalPattern: number[],
  weatherInfluence: number,
  trendStrength: number,
  volatility: number
} => {
  // Default parameters
  const defaultParams = {
    seasonalPattern: [0.2, 0.4, 0.6, 0.8, 0.6, 0.3, 0, -0.3, -0.5, -0.3, -0.1, 0.1], // Monthly patterns
    weatherInfluence: 0.5,
    trendStrength: 1.0,
    volatility: 0.2
  };
  
  // Lake-specific overrides
  const lakeParams: Record<string, any> = {
    'lake-superior': {
      seasonalPattern: [0.1, 0.2, 0.4, 0.7, 0.9, 0.7, 0.4, 0.1, -0.2, -0.4, -0.3, -0.1],
      weatherInfluence: 0.3, // Less affected by weather
      trendStrength: 0.8,
      volatility: 0.15
    },
    'lake-erie': {
      weatherInfluence: 0.8, // More affected by weather
      volatility: 0.3
    },
    'lake-mead': {
      seasonalPattern: [-0.4, -0.2, 0, 0.2, 0.1, -0.1, -0.3, -0.5, -0.6, -0.5, -0.4, -0.4],
      trendStrength: 1.2, // Stronger trends
      volatility: 0.35
    },
    'lake-powell': {
      weatherInfluence: 0.6,
      trendStrength: 1.3
    }
  };
  
  return {
    ...defaultParams,
    ...(lakeParams[lakeId] || {})
  };
};

// Calculate seasonal amplitude based on lake characteristics
const calculateSeasonalAmplitude = (lakeId: string): number => {
  const amplitudes: Record<string, number> = {
    'lake-superior': 0.4,
    'lake-michigan': 0.6,
    'lake-huron': 0.6,
    'lake-erie': 0.8,
    'lake-ontario': 0.7,
    'lake-champlain': 1.0,
    'great-salt-lake': 0.5,
    'lake-okeechobee': 1.2,
    'lake-powell': 0.9,
    'lake-mead': 0.8
  };
  
  return amplitudes[lakeId] || 0.5;
};

// Calculate the recent trend from the last 7 days of readings
const calculateRecentTrend = (readings: WaterLevelReading[]): number => {
  if (readings.length < 7) return 0;
  
  const recent = readings.slice(-7);
  let totalChange = 0;
  
  for (let i = 1; i < recent.length; i++) {
    totalChange += recent[i].level - recent[i-1].level;
  }
  
  return totalChange / (recent.length - 1);
};

// Simulate weather effects, stronger in near term, weaker in long term
const simulateWeatherEffect = (daysInFuture: number, weatherInfluence: number): number => {
  const weatherScale = Math.exp(-0.3 * daysInFuture);
  const shortTermPattern = Math.sin(daysInFuture * 1.2) * 0.6;
  const mediumTermPattern = Math.sin(daysInFuture * 0.7) * 0.3;
  const randomComponent = (Math.random() - 0.5) * 0.1;
  
  return (shortTermPattern + mediumTermPattern + randomComponent) * weatherScale * weatherInfluence;
};

// Enhanced historical data generation
const generateReadings = (lakeId: string, baseLevel: number, days: number): WaterLevelReading[] => {
  const readings: WaterLevelReading[] = [];
  const now = new Date();
  const { seasonalPattern, weatherInfluence, volatility } = getLakeParameters(lakeId);
  const seasonalAmplitude = calculateSeasonalAmplitude(lakeId);
  
  let trendComponent = 0;
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = 0.002 + Math.random() * 0.005;
  const weatherCycleLength = 10 + Math.floor(Math.random() * 5);
  
  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const currentMonth = getMonth(date);
    
    if (i % 10 === 0 && Math.random() < 0.3) {
      trendComponent = 0;
    }
    trendComponent += trendDirection * trendStrength * (Math.random() + 0.5);
    trendComponent = Math.max(Math.min(trendComponent, 1.5), -1.5);
    
    const seasonalComponent = seasonalPattern[currentMonth] * seasonalAmplitude;
    const weatherCycle = Math.sin((i % weatherCycleLength) / weatherCycleLength * 2 * Math.PI);
    const weatherComponent = weatherCycle * weatherInfluence;
    const noise = (Math.random() - 0.5) * volatility;
    
    const level = baseLevel + seasonalComponent + trendComponent + weatherComponent + noise;
    
    readings.push({
      timestamp: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      level
    });
  }
  
  return readings;
};

// Generate sophisticated forecast data
const generateForecast = (lakeId: string, currentLevel: number, days: number, historicalReadings: WaterLevelReading[]): LakeForecast[] => {
  const forecasts: LakeForecast[] = [];
  const now = new Date();
  
  const { seasonalPattern, weatherInfluence, trendStrength, volatility } = getLakeParameters(lakeId);
  const recentTrend = calculateRecentTrend(historicalReadings);
  const seasonalAmplitude = calculateSeasonalAmplitude(lakeId);

  for (let i = 1; i <= days; i++) {
    const date = addDays(now, i);
    const currentMonth = getMonth(date);
    
    const seasonalComponent = seasonalPattern[currentMonth] * seasonalAmplitude;
    const trendEffect = recentTrend * Math.pow(0.9, i) * trendStrength;
    const weatherEffect = simulateWeatherEffect(i, weatherInfluence);
    const autocorrelationEffect = i > 1 ? (forecasts[i-2].predicted - currentLevel) * 0.3 : 0;
    
    const predicted = currentLevel + 
                     seasonalComponent + 
                     trendEffect + 
                     weatherEffect + 
                     autocorrelationEffect;
    
    const baseUncertainty = 0.05 + volatility;
    const timeUncertainty = Math.log(i + 1) * volatility;
    const uncertainty = baseUncertainty + timeUncertainty;
    
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

// Create a lookup for each lake's readings and forecasts
export const mockReadings: Record<string, WaterLevelReading[]> = {};
export const mockForecasts: Record<string, LakeForecast[]> = {};

// Generate historical readings first
mockLakes.forEach(lake => {
  mockReadings[lake.id] = generateReadings(lake.id, lake.currentLevel, 365);
});

// Then generate forecasts based on those readings
mockLakes.forEach(lake => {
  mockForecasts[lake.id] = generateForecast(lake.id, lake.currentLevel, 14, mockReadings[lake.id]);
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