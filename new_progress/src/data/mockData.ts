import { Lake, WaterLevelReading, Alert, DataSource, LakeForecast } from '../types';
import { subDays, format, addDays, getMonth, differenceInDays } from 'date-fns';

// Generate forecast data with more sophisticated modeling
const generateForecast = (lakeId: string, currentLevel: number, days: number, historicalReadings: WaterLevelReading[]): LakeForecast[] => {
  const forecasts: LakeForecast[] = [];
  const now = new Date();

  // Get lake-specific parameters
  const { seasonalPattern, weatherInfluence, trendStrength, volatility } = getLakeParameters(lakeId);

  // Calculate recent trend from historical data (last 7 days)
  const recentTrend = calculateRecentTrend(historicalReadings);

  // Calculate long-term seasonal pattern
  const seasonalAmplitude = calculateSeasonalAmplitude(lakeId);

  for (let i = 1; i <= days; i++) {
    const date = addDays(now, i);
    const currentMonth = getMonth(date);

    // 1. Apply seasonal component
    const seasonalComponent = seasonalPattern[currentMonth] * seasonalAmplitude;

    // 2. Apply recent trend, but diminish its effect over time
    const trendEffect = recentTrend * Math.pow(0.9, i) * trendStrength;

    // 3. Add simulated weather effects (more volatile in short term)
    const weatherEffect = simulateWeatherEffect(i, weatherInfluence);

    // 4. Apply autocorrelation with previous forecasted values
    const autocorrelationEffect = i > 1 
      ? (forecasts[i-2].predicted - currentLevel) * 0.3 
      : 0;

    // Combine all components
    const predicted = currentLevel + 
                     seasonalComponent + 
                     trendEffect + 
                     weatherEffect + 
                     autocorrelationEffect;

    // Uncertainty increases with time, but in a realistic way
    // Use a logarithmic growth pattern for uncertainty
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
  // Weather effect diminishes with time
  const weatherScale = Math.exp(-0.3 * daysInFuture);

  // Short term weather patterns (2-3 day cycles)
  const shortTermPattern = Math.sin(daysInFuture * 1.2) * 0.6;

  // Medium term weather patterns (5-7 day cycles)
  const mediumTermPattern = Math.sin(daysInFuture * 0.7) * 0.3;

  // Random component
  const randomComponent = (Math.random() - 0.5) * 0.1;

  return (shortTermPattern + mediumTermPattern + randomComponent) * weatherScale * weatherInfluence;
};

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
  // Different lakes have different seasonal variations
  const amplitudes: Record<string, number> = {
    'lake-superior': 0.4,
    'lake-michigan': 0.6,
    'lake-huron': 0.6,
    'lake-erie': 0.8,
    'lake-ontario': 0.7,
    'lake-champlain': 1.0,
    'great-salt-lake': 0.5,
    'lake-okeechobee': 1.2, // Florida lake with high seasonal variation
    'lake-powell': 0.9,
    'lake-mead': 0.8
  };

  return amplitudes[lakeId] || 0.5; // Default if not specified
};

// Enhance historical data generation with more realistic patterns
const generateReadings = (lakeId: string, baseLevel: number, days: number): WaterLevelReading[] => {
  const readings: WaterLevelReading[] = [];
  const now = new Date();
  const { seasonalPattern, weatherInfluence, volatility } = getLakeParameters(lakeId);
  const seasonalAmplitude = calculateSeasonalAmplitude(lakeId);

  // Generate a semi-realistic time series with:
  // 1. Seasonal components
  // 2. Trend components
  // 3. Cyclic weather patterns
  // 4. Random noise

  // Generate a slow-moving trend component
  let trendComponent = 0;
  const trendDirection = Math.random() > 0.5 ? 1 : -1;
  const trendStrength = 0.002 + Math.random() * 0.005;

  // Generate a medium-term weather cycle (10-15 days)
  const weatherCycleLength = 10 + Math.floor(Math.random() * 5);

  for (let i = days; i >= 0; i--) {
    const date = subDays(now, i);
    const currentMonth = getMonth(date);

    // Update trend component
    if (i % 10 === 0) {
      // Chance to change trend direction
      if (Math.random() < 0.3) {
        trendComponent = 0; // Reset occasionally
      }
    }
    trendComponent += trendDirection * trendStrength * (Math.random() + 0.5);

    // Cap the trend to prevent unrealistic drift
    trendComponent = Math.max(Math.min(trendComponent, 1.5), -1.5);

    // Calculate seasonal component
    const seasonalComponent = seasonalPattern[currentMonth] * seasonalAmplitude;

    // Calculate weather component
    const weatherCycle = Math.sin((i % weatherCycleLength) / weatherCycleLength * 2 * Math.PI);
    const weatherComponent = weatherCycle * weatherInfluence;

    // Add some random noise
    const noise = (Math.random() - 0.5) * volatility;

    // Combine all components
    const level = baseLevel + seasonalComponent + trendComponent + weatherComponent + noise;

    readings.push({
      timestamp: format(date, "yyyy-MM-dd'T'HH:mm:ss"),
      level
    });
  }

  return readings;
};

// Mock lake data
export const mockLakes: Lake[] = [
  {
    id: 'lake-superior',
    name: 'Lake Superior',
    location: { lat: 47.7, lng: -87.5 },
    currentLevel: 183.2,
    normalLevel: 183.4,
    criticalHighLevel: 184.0,
    criticalLowLevel: 183.0,
    surfaceArea: 82100,
    dataSource: 'USGS'
  },
  {
    id: 'lake-michigan',
    name: 'Lake Michigan',
    location: { lat: 44.0, lng: -87.0 },
    currentLevel: 176.8,
    normalLevel: 176.5,
    criticalHighLevel: 177.5,
    criticalLowLevel: 175.5,
    surfaceArea: 58000,
    dataSource: 'USGS'
  },
  {
    id: 'lake-huron',
    name: 'Lake Huron',
    location: { lat: 44.8, lng: -82.4 },
    currentLevel: 176.8,
    normalLevel: 176.5,
    criticalHighLevel: 177.5,
    criticalLowLevel: 175.5,
    surfaceArea: 59600,
    dataSource: 'USGS'
  },
  {
    id: 'lake-erie',
    name: 'Lake Erie',
    location: { lat: 42.2, lng: -81.2 },
    currentLevel: 174.0,
    normalLevel: 174.2,
    criticalHighLevel: 175.0,
    criticalLowLevel: 173.5,
    surfaceArea: 25700,
    dataSource: 'USGS'
  },
  {
    id: 'lake-ontario',
    name: 'Lake Ontario',
    location: { lat: 43.7, lng: -77.8 },
    currentLevel: 74.7,
    normalLevel: 74.8,
    criticalHighLevel: 75.5,
    criticalLowLevel: 74.2,
    surfaceArea: 19000,
    dataSource: 'USGS'
  },
  {
    id: 'lake-mead',
    name: 'Lake Mead',
    location: { lat: 36.1, lng: -114.4 },
    currentLevel: 1055.0,
    normalLevel: 1090.0,
    criticalHighLevel: 1220.0,
    criticalLowLevel: 1050.0,
    surfaceArea: 640,
    dataSource: 'USGS'
  },
  {
    id: 'lake-powell',
    name: 'Lake Powell',
    location: { lat: 37.1, lng: -111.2 },
    currentLevel: 3564.0,
    normalLevel: 3600.0,
    criticalHighLevel: 3700.0,
    criticalLowLevel: 3525.0,
    surfaceArea: 658,
    dataSource: 'USGS'
  },
  {
    id: 'lake-okeechobee',
    name: 'Lake Okeechobee',
    location: { lat: 26.9, lng: -80.8 },
    currentLevel: 12.5,
    normalLevel: 13.0,
    criticalHighLevel: 16.0,
    criticalLowLevel: 11.0,
    surfaceArea: 1900,
    dataSource: 'USGS'
  }
];

// Create a lookup for each lake's readings
export const mockReadings: Record<string, WaterLevelReading[]> = {};
export const mockForecasts: Record<string, LakeForecast[]> = {};

// Generate historical readings first
mockLakes.forEach(lake => {
  mockReadings[lake.id] = generateReadings(lake.id, lake.currentLevel, 365); // Generate a full year of historical data
});

// Then generate forecasts based on those readings
mockLakes.forEach(lake => {
  mockForecasts[lake.id] = generateForecast(lake.id, lake.currentLevel, 14, mockReadings[lake.id]); // Generate 14-day forecasts
});

export const mockAlerts: Alert[] = [
  {
    id: 'alert-1',
    lakeId: 'lake-mead',
    type: 'low',
    level: 1051.2,
    timestamp: format(subDays(new Date(), 2), "yyyy-MM-dd'T'HH:mm:ss"),
    message: 'Lake Mead water level approaching critical low threshold',
    isRead: false
  },
  {
    id: 'alert-2',
    lakeId: 'lake-superior',
    type: 'high',
    level: 183.9,
    timestamp: format(subDays(new Date(), 4), "yyyy-MM-dd'T'HH:mm:ss"),
    message: 'Lake Superior water level near historical high',
    isRead: true
  },
  {
    id: 'alert-3',
    lakeId: 'lake-okeechobee',
    type: 'high',
    level: 15.8,
    timestamp: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss"),
    message: 'Lake Okeechobee approaching flood action level',
    isRead: false
  }
];

export const mockDataSources: DataSource[] = [
  {
    id: 'usgs',
    name: 'USGS Water Data',
    description: 'Real-time water level data from the United States Geological Survey',
    url: 'https://waterdata.usgs.gov/',
    lastUpdated: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'nasa',
    name: 'NASA G-REALM',
    description: 'Global Reservoir and Lake Monitoring data from NASA satellite observations',
    url: 'https://ipad.fas.usda.gov/cropexplorer/global_reservoir/',
    lastUpdated: format(subDays(new Date(), 7), "yyyy-MM-dd'T'HH:mm:ss")
  },
  {
    id: 'noaa',
    name: 'NOAA Great Lakes Monitoring',
    description: 'National Oceanic and Atmospheric Administration data on Great Lakes water levels',
    url: 'https://www.glerl.noaa.gov/data/dashboard/data/',
    lastUpdated: format(subDays(new Date(), 1), "yyyy-MM-dd'T'HH:mm:ss")
  }
];