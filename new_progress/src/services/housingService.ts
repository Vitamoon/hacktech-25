import { HousingData } from '../types';

// Sample housing data based on the provided CSV format
const sampleHousingData: HousingData[] = [
  {
    regionId: '91982',
    sizeRank: 1,
    regionName: '77494',
    regionType: 'zip',
    stateName: 'TX',
    state: 'TX',
    city: 'Katy',
    metro: 'Houston-The Woodlands-Sugar Land, TX',
    countyName: 'Fort Bend County',
    prices: generateSamplePrices(350000)
  },
  {
    regionId: '90210',
    sizeRank: 2,
    regionName: '90210',
    regionType: 'zip',
    stateName: 'CA',
    state: 'CA',
    city: 'Beverly Hills',
    metro: 'Los Angeles-Long Beach-Anaheim, CA',
    countyName: 'Los Angeles County',
    prices: generateSamplePrices(2500000)
  },
  {
    regionId: '10001',
    sizeRank: 3,
    regionName: '10001',
    regionType: 'zip',
    stateName: 'NY',
    state: 'NY',
    city: 'New York',
    metro: 'New York-Newark-Jersey City, NY-NJ-PA',
    countyName: 'New York County',
    prices: generateSamplePrices(1200000)
  },
  {
    regionId: '60614',
    sizeRank: 4,
    regionName: '60614',
    regionType: 'zip',
    stateName: 'IL',
    state: 'IL',
    city: 'Chicago',
    metro: 'Chicago-Naperville-Elgin, IL-IN-WI',
    countyName: 'Cook County',
    prices: generateSamplePrices(550000)
  },
  {
    regionId: '94103',
    sizeRank: 5,
    regionName: '94103',
    regionType: 'zip',
    stateName: 'CA',
    state: 'CA',
    city: 'San Francisco',
    metro: 'San Francisco-Oakland-Berkeley, CA',
    countyName: 'San Francisco County',
    prices: generateSamplePrices(1100000)
  },
  {
    regionId: '77002',
    sizeRank: 6,
    regionName: '77002',
    regionType: 'zip',
    stateName: 'TX',
    state: 'TX',
    city: 'Houston',
    metro: 'Houston-The Woodlands-Sugar Land, TX',
    countyName: 'Harris County',
    prices: generateSamplePrices(280000)
  },
  {
    regionId: '33139',
    sizeRank: 7,
    regionName: '33139',
    regionType: 'zip',
    stateName: 'FL',
    state: 'FL',
    city: 'Miami Beach',
    metro: 'Miami-Fort Lauderdale-Pompano Beach, FL',
    countyName: 'Miami-Dade County',
    prices: generateSamplePrices(650000)
  },
  {
    regionId: '98101',
    sizeRank: 8,
    regionName: '98101',
    regionType: 'zip',
    stateName: 'WA',
    state: 'WA',
    city: 'Seattle',
    metro: 'Seattle-Tacoma-Bellevue, WA',
    countyName: 'King County',
    prices: generateSamplePrices(780000)
  }
];

// Function to generate sample price data
function generateSamplePrices(basePrice: number) {
  const prices = [];
  const months = 60; // 5 years of monthly data
  
  // Base price with trend and seasonality
  for (let i = 0; i < months; i++) {
    const date = new Date();
    date.setMonth(date.getMonth() - (months - i));
    
    // Add trend (generally upward)
    const trendFactor = 1 + (i / months) * 0.3; // 30% increase over 5 years
    
    // Add seasonality (higher in summer, lower in winter)
    const month = date.getMonth();
    const seasonalFactor = 1 + 0.05 * Math.sin((month / 12) * 2 * Math.PI);
    
    // Add some randomness
    const randomFactor = 0.98 + Math.random() * 0.04; // ±2%
    
    const price = Math.round(basePrice * trendFactor * seasonalFactor * randomFactor);
    
    prices.push({
      date: date.toISOString().slice(0, 10),
      value: price
    });
  }
  
  return prices;
}

// This function would parse real CSV data in a production environment
export const parseHousingData = async (): Promise<HousingData[]> => {
  // In a real-world implementation, this would fetch and parse a CSV file
  // For this demo, we'll return the sample data
  
  return new Promise((resolve) => {
    // Simulate async loading
    setTimeout(() => {
      resolve(sampleHousingData);
    }, 500);
  });
};

// Function to get housing data for a specific zip code
export const getHousingDataByZipCode = (zipCode: string): HousingData | undefined => {
  return sampleHousingData.find(data => data.regionName === zipCode);
};

// Where to put the CSV file:
// For a production app, you would typically place data files in the public directory
// and access them via fetch, or use an API to serve the data. The recommended location would be:
// /public/data/housing_data.csv
//
// You can then load it using:
// fetch('/data/housing_data.csv').then(response => response.text()).then(csvText => {
//   // Parse CSV data
// });