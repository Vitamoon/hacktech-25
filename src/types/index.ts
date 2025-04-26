export interface Lake {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  currentLevel: number;
  normalLevel: number;
  criticalHighLevel: number;
  criticalLowLevel: number;
  surfaceArea: number; // in sq km
  dataSource: string;
}

export interface WaterLevelReading {
  timestamp: string;
  level: number;
}

export interface LakeForecast {
  timestamp: string;
  predicted: number;
  lowerBound: number;
  upperBound: number;
}

export interface Alert {
  id: string;
  lakeId: string;
  type: 'high' | 'low';
  level: number;
  timestamp: string;
  message: string;
  isRead: boolean;
}

export interface DataSource {
  id: string;
  name: string;
  description: string;
  url: string;
  lastUpdated: string;
}

export interface HousingData {
  regionId: string;
  sizeRank: number;
  regionName: string;
  regionType: string;
  stateName: string;
  state: string;
  city: string;
  metro: string;
  countyName: string;
  prices: {
    date: string;
    value: number;
  }[];
}