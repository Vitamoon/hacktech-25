import Papa from 'papaparse';
import { HousingData, Lake } from '../types'; // Assuming HousingData and Lake types are defined correctly

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

// Removed the findLatestPrice function as it's no longer needed

export const parseHousingData = async (): Promise<HousingData[]> => {
  try {
    const response = await fetch('/data/housing_data.csv'); // Ensure this path is correct
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    const csvText = await response.text();

    return new Promise((resolve, reject) => {
      Papa.parse<Record<string, string>>(csvText, { // Use Record<string, string> for row type
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false, // Keep values as strings initially for better control
        complete: (results) => {
          if (results.errors.length > 0) {
            console.error('CSV Parsing errors:', results.errors);
            // Consider rejecting or returning partial data based on error severity
          }

          const knownHeaders = new Set([
            'RegionID', 'SizeRank', 'RegionName', 'RegionType', 'StateName',
            'State', 'City', 'Metro', 'CountyName'
          ]);

          const data = results.data.map((row): HousingData | null => {
            const regionId = row['RegionID'] || '';
            const sizeRankStr = row['SizeRank'] || '';
            const regionName = row['RegionName'] || ''; // Zip Code
            const regionType = row['RegionType'] || '';
            const stateName = row['StateName'] || '';
            const state = row['State'] || '';
            const city = row['City'] || '';
            const metro = row['Metro'] || '';
            const countyName = row['CountyName'] || '';

            if (!regionName) {
              console.warn('Skipping row due to missing RegionName (Zip Code):', row);
              return null;
            }

            const prices: { date: string; value: number }[] = [];
            const dateKeys: string[] = [];

            // Iterate over all keys in the row to find date columns
            for (const key in row) {
              // Check if the key looks like a date (YYYY-MM or YYYY-MM-DD)
              // and is not one of the known non-date headers
              if (key.match(/^\d{4}-\d{2}(-\d{2})?$/) && !knownHeaders.has(key)) {
                 dateKeys.push(key);
              }
            }

            // Sort the date keys chronologically
            dateKeys.sort();

            // Process sorted date keys to extract prices
            dateKeys.forEach(dateKey => {
              const valueStr = row[dateKey]?.trim();
              if (valueStr) {
                const value = parseFloat(valueStr);
                if (!isNaN(value)) {
                  // Append '-01' if the date is just YYYY-MM to make it a valid ISO date part
                  const isoDate = dateKey.length === 7 ? `${dateKey}-01` : dateKey;
                  prices.push({ date: isoDate, value });
                } else {
                   console.warn(`Skipping invalid price value for ${dateKey} in row:`, valueStr, row);
                }
              }
            });


            // Ensure prices array is not empty before creating the object
            if (prices.length === 0) {
                console.warn('Skipping row with no valid price data:', row);
                return null;
            }


            return {
              regionId,
              sizeRank: parseInt(sizeRankStr, 10) || 0,
              regionName,
              regionType,
              stateName,
              state,
              city,
              metro,
              countyName,
              prices, // Store the full historical price data
            };
          }).filter((item): item is HousingData => item !== null);

          resolve(data);
        },
        error: (error: Error) => {
          console.error('Error parsing housing data with PapaParse:', error);
          reject(error);
        },
      });
    });
  } catch (error) {
    console.error('Error fetching or processing housing data:', error);
    return []; // Return empty array on error
  }
};