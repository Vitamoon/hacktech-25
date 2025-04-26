import { Lake } from '../types';

// USGS API URL for lake and reservoir data
const USGS_API_URL = 'https://waterservices.usgs.gov/nwis/dv/';

interface USGSTimeSeriesResponse {
  value: {
    timeSeries: Array<{
      sourceInfo: {
        siteName: string;
        geoLocation: {
          geogLocation: {
            latitude: number;
            longitude: number;
          };
        };
        siteProperty?: Array<{
          value: string;
          name: string;
        }>;
      };
      variable: {
        variableName: string;
        unit: {
          unitCode: string;
        };
      };
      values: Array<{
        value: Array<{
          value: string;
          dateTime: string;
        }>;
      }>;
    }>;
  };
}

// Function to fetch lake data from USGS API
export const fetchUSGSLakeData = async (): Promise<Lake[]> => {
  try {
    const response = await fetch(
      `${USGS_API_URL}?format=json&stateCd=ca&siteStatus=all&siteType=LK`
    );
    
    if (!response.ok) {
      throw new Error(`USGS API returned status: ${response.status}`);
    }
    
    const data: USGSTimeSeriesResponse = await response.json();
    
    // Process and convert the USGS data to our app's Lake format
    return processUSGSData(data);
  } catch (error) {
    console.error('Error fetching USGS lake data:', error);
    return [];
  }
};

// Function to process USGS API response and convert to our Lake type
const processUSGSData = (data: USGSTimeSeriesResponse): Lake[] => {
  if (!data.value || !data.value.timeSeries) {
    return [];
  }
  
  const lakes: Lake[] = [];
  const seenSiteNames = new Set<string>();
  
  for (const series of data.value.timeSeries) {
    const siteName = series.sourceInfo.siteName;
    
    // Skip duplicates (USGS often has multiple measurements for the same site)
    if (seenSiteNames.has(siteName)) {
      continue;
    }
    
    seenSiteNames.add(siteName);
    
    // Get surface area if available
    let surfaceArea = 0;
    if (series.sourceInfo.siteProperty) {
      for (const prop of series.sourceInfo.siteProperty) {
        if (prop.name === 'lakeArea') {
          surfaceArea = parseFloat(prop.value) || 0;
          break;
        }
      }
    }
    
    // Get current level if available
    let currentLevel = 0;
    if (series.values && series.values[0] && series.values[0].value && series.values[0].value.length > 0) {
      currentLevel = parseFloat(series.values[0].value[0].value) || 0;
    }
    
    // Create a unique ID for the lake
    const id = `usgs-${siteName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    lakes.push({
      id,
      name: siteName,
      location: {
        lat: series.sourceInfo.geoLocation.geogLocation.latitude,
        lng: series.sourceInfo.geoLocation.geogLocation.longitude,
      },
      currentLevel,
      normalLevel: currentLevel, // We don't have historical data, so use current as normal
      criticalHighLevel: currentLevel * 1.2, // Estimate
      criticalLowLevel: currentLevel * 0.8, // Estimate
      surfaceArea,
      dataSource: 'USGS',
    });
  }
  
  return lakes;
};

// Function to fetch specific lake data by site code
export const fetchLakeDataBySiteCode = async (siteCode: string) => {
  try {
    const response = await fetch(
      `${USGS_API_URL}?format=json&sites=${siteCode}&siteStatus=all&siteType=LK`
    );
    
    if (!response.ok) {
      throw new Error(`USGS API returned status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching lake data for site ${siteCode}:`, error);
    return null;
  }
};