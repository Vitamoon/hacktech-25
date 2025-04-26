import { Lake, HousingData } from '../types';

export const fetchUSGSLakeData = async (): Promise<Lake[]> => {
  try {
    // Fetch data including Reservoir Storage (parameterCd=00054)
    const response = await fetch(
      'https://waterservices.usgs.gov/nwis/dv/?format=json&stateCd=ca&siteStatus=all&siteType=LK&parameterCd=00054'
    );
    const data = await response.json();

    if (data.value && data.value.timeSeries) {
      // Transform USGS data to Lake type
      return data.value.timeSeries.map((series: any) => ({
        id: series.sourceInfo.siteCode[0].value,
        name: series.sourceInfo.siteName,
        location: {
          lat: series.sourceInfo.geoLocation.geogLocation.latitude,
          lng: series.sourceInfo.geoLocation.geogLocation.longitude
        },
        currentLevel: parseFloat(series.values[0].value[0].value) || 0,
        normalLevel: 0, // Default value
        criticalHighLevel: 0, // Default value
        criticalLowLevel: 0, // Default value
        surfaceArea: 0, // Default value
        dataSource: 'USGS'
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching USGS data:', error);
    return [];
  }
};

export const parseHousingData = async (): Promise<HousingData[]> => {
  try {
    const response = await fetch('/housing_data.csv');
    const text = await response.text();
    
    // Simple CSV parsing (you might want to use a library like Papa Parse in production)
    const rows = text.split('\n').slice(1); // Skip header
    return rows.map(row => {
      const [regionId, sizeRank, regionName, regionType, stateName, state, city, metro, countyName, ...priceData] = row.split(',');
      
      return {
        regionId,
        sizeRank: parseInt(sizeRank),
        regionName,
        regionType,
        stateName,
        state,
        city,
        metro,
        countyName,
        prices: priceData.map((value, index) => ({
          date: new Date(2020 + Math.floor(index/12), index%12, 1).toISOString(),
          value: parseFloat(value)
        }))
      };
    });
  } catch (error) {
    console.error('Error parsing housing data:', error);
    return [];
  }
};