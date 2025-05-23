export interface Lake {
  id: string;
  name: string;
  location: {
    lat: number;
    lng: number;
  };
  currentLevel: number;
  normalLevel: number;
  status: 'normal' | 'warning' | 'danger' | 'low';
  lastUpdated: string;
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
  lakeName: string;
  type: 'rising' | 'falling' | 'critical' | 'recovery';
  message: string;
  timestamp: string;
  acknowledged: boolean;
  severity: 'info' | 'warning' | 'danger';
}

export interface DataSource {
  id: string;
  name: string;
  type: 'USGS' | 'NASA' | 'OGC' | 'Other';
  lastSynced: string;
  status: 'online' | 'offline' | 'syncing';
}

export interface HousingData {
  RegionID: string;
  SizeRank: number;
  RegionName: string;
  RegionType: string;
  StateName: string;
  State: string;
  City: string;
  Metro: string;
  CountyName: string;
  FloodRiskScore?: number;
  NearestLakeDistance?: number;
  [key: string]: string | number | undefined;
}

export interface AreaAnalysis {
  medianPrice: number;
  priceChange: number;
  priceChangePercent: number;
  floodRiskLevel: 'Low' | 'Moderate' | 'High';
  nearbyWaterBodies: number;
  averageWaterDistance: number;
}