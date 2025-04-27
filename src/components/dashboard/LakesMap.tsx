import React, { useEffect, useState } from 'react';
import { 
  MapContainer, 
  TileLayer, 
  Marker, 
  Popup, 
  Circle, 
  useMap, 
  Rectangle,
  GeoJSON 
} from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import 'leaflet/dist/leaflet.css';
import L, { LatLngBoundsExpression } from 'leaflet';
import Papa from 'papaparse';

// Fix Leaflet marker icon issue in React
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to recenter map when lakes change
const MapUpdater: React.FC<{ lakes: any[] }> = ({ lakes }) => {
  const map = useMap();
  
  useEffect(() => {
    if (lakes.length > 0) {
      // Calculate bounds based on all lake locations
      const bounds = L.latLngBounds(
        lakes.map(lake => [lake.location.lat, lake.location.lng])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [lakes, map]);
  
  return null;
};

// Component to fetch and display USGS lake data on the map
const USGSLakesOverlay: React.FC = () => {
  const [usgsLakes, setUsgsLakes] = useState<any[]>([]);
  const map = useMap();

  useEffect(() => {
    const fetchUSGSData = async () => {
      try {
        // Fetch data including Reservoir Storage (parameterCd=00054)
        const response = await fetch(
          'https://waterservices.usgs.gov/nwis/dv/?format=json&stateCd=ca&siteStatus=all&siteType=LK&parameterCd=00054'
        );
        const data = await response.json();

        if (data.value && data.value.timeSeries) {
          // Group time series by site code
          const sitesData: { [key: string]: any } = {};
          data.value.timeSeries.forEach((series: any) => {
            const siteCode = series.sourceInfo.siteCode[0].value;
            if (!sitesData[siteCode]) {
              sitesData[siteCode] = {
                id: siteCode,
                name: series.sourceInfo.siteName,
                location: {
                  lat: series.sourceInfo.geoLocation.geogLocation.latitude,
                  lng: series.sourceInfo.geoLocation.geogLocation.longitude
                },
                reservoirStorage: null, // Initialize storage
                storageUnit: null,
              };
            }

            // Check if this series is for Reservoir Storage (00054)
            const isStorageVariable = series.variable.variableCode.some((vc: any) => vc.value === '00054');
            if (isStorageVariable && series.values && series.values[0] && series.values[0].value && series.values[0].value.length > 0) {
              // Get the latest storage value
              const latestValueRecord = series.values[0].value[series.values[0].value.length - 1];
              sitesData[siteCode].reservoirStorage = parseFloat(latestValueRecord.value);
              sitesData[siteCode].storageUnit = series.variable.unit?.unitCode || 'N/A'; // Store the unit
            }
          });

          // Convert grouped data into an array, applying defaults
          const lakes = Object.values(sitesData).map(site => ({
            ...site,
            // Use reservoirStorage if available, otherwise default to 10000
            // Note: The 'size' property now represents storage, not area
            size: site.reservoirStorage !== null && !isNaN(site.reservoirStorage) ? site.reservoirStorage : 10000,
            isDefaultSize: site.reservoirStorage === null || isNaN(site.reservoirStorage) // Flag if default was used
          }));

          setUsgsLakes(lakes);
        }
      } catch (error) {
        console.error('Error fetching USGS data:', error);
      }
    };

    fetchUSGSData();
  }, [map]);

  // Define a scaling factor for the radius based on size (storage in ac-ft)
  const radiusScaleFactor = 20;
  const minRadius = 5000; // Minimum radius in meters

  return (
    <>
      {usgsLakes.map(lake => (
        <Circle
          key={lake.id}
          center={[lake.location.lat, lake.location.lng]}
          // Calculate radius based on the square root of storage size, with a minimum radius
          radius={Math.max(minRadius, Math.sqrt(lake.size) * radiusScaleFactor)} 
          pathOptions={{
            fillColor: '#3388ff', // Blue color for USGS lakes
            fillOpacity: 0.5,
            color: '#3388ff',
            weight: 1
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold text-blue-700">{lake.name}</h3>
              <p>Site ID: {lake.id}</p>
              <p>Location: {lake.location.lat.toFixed(4)}, {lake.location.lng.toFixed(4)}</p>
              {/* Display Reservoir Storage or default */}
              <p>
                Reservoir Storage: {
                  lake.isDefaultSize
                    ? `Not Available (Default: ${Number(lake.size).toLocaleString()})`
                    : `${Number(lake.size).toLocaleString()} ${lake.storageUnit || ''}`
                }
              </p>
              <a
                href={`https://waterdata.usgs.gov/nwis/inventory/?site_no=${lake.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                View USGS Data
              </a>
            </div>
          </Popup>
        </Circle>
      ))}
    </>
  );
};

// Placeholder colors for alerts
const highAlertColor = '#FFA500'; // Orange
const lowAlertColor = '#FFFFE0';  // Pale Yellow - Keep if still needed for low alerts
const customHighlightColor = '#FFFF00'; // Yellow for your specific list
const zipCodeBaseColor = '#22c55e'; // Green base color for zip code overlay

// --- UPDATED COMPONENT: ZipCodeAlertOverlay ---
const ZipCodeAlertOverlay: React.FC = () => {
  const { lakes, housingData } = useDataContext();
  const [alertOverlays, setAlertOverlays] = useState<AlertOverlayData[]>([]);
  const [geoJsonData, setGeoJsonData] = useState<any>(null);
  const map = useMap();

  // Define the list of zip codes to highlight in yellow
  const specificZipCodesToHighlight = new Set([
    '90039', '90201', '90265', '90740', '90802', '90803', '90804', '90805', '91932', '92108',
    '92123', '92154', '92627', '92646', '92648', '92660', '92663', '92683', '93001', '93015',
    '93030', '93033', '93101', '93103', '93108', '93117', '93620', '93622', '93635', '93706',
    '93905', '93906', '93940', '93953', '94002', '94025', '94063', '94303', '94401', '94403',
    '94404', '94509', '94533', '94558', '94559', '94561', '94565', '94571', '94574', '94585',
    '94901', '94941', '94965', '95010', '95060', '95076', '95202', '95203', '95204', '95205',
    '95206', '95329', '95330', '95336', '95337', '95340', '95341', '95348', '95376', '95423',
    '95443', '95446', '95462', '95469', '95470', '95482', '95608', '95616', '95618', '95624',
    '95630', '95641', '95691', '95695', '95735', '95758', '95776', '95814', '95815', '95822',
    '95831', '95833', '95834', '95835', '95901', '95916', '95917', '95922', '95925', '95926',
    '95928', '95948', '95953', '95959', '95965', '95966', '95991', '95993'
  ]);


  // Load GeoJSON data
  // Inside the ZipCodeAlertOverlay component
  useEffect(() => {
    const fetchGeoJson = async () => {
      try {
        console.log('Fetching GeoJSON data...');
        const response = await fetch('/data/ca-geo.json');
        if (!response.ok) {
          throw new Error(`Failed to load GeoJSON: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        console.log('GeoJSON data loaded successfully', data.features?.length || 'no features');
        setGeoJsonData(data);
      } catch (error) {
        console.error('Error loading GeoJSON data:', error);
        // Add visual feedback for debugging
        alert('Failed to load map data. Check console for details.');
      }
    };
  
    fetchGeoJson();
  }, []);
  
  // Add debugging for housing data
  useEffect(() => {
    console.log('Housing data available:', housingData?.length || 0);
    console.log('Lakes data available:', lakes?.length || 0);
  }, [housingData, lakes]);
  // Process high and low alert overlays
  useEffect(() => {
    if (!geoJsonData) return;

    const overlays: AlertOverlayData[] = [];

    // First, handle lake-based alerts
    lakes.forEach(lake => {
      const isHighAlert = lake.currentLevel > lake.criticalHighLevel;
      const isLowAlert = lake.currentLevel < lake.criticalLowLevel;

      if (isHighAlert || isLowAlert) {
        const alertType = isHighAlert ? 'high' : 'low';
        const color = isHighAlert ? highAlertColor : lowAlertColor;

        // Find zip codes near the lake (simplified approach)
        const nearbyZips = findZipCodesNear(lake.location, alertType === 'high' ? 0.05 : 0.1);
        
        nearbyZips.forEach(zipCode => {
          // Find the GeoJSON feature for this zip code
          const feature = geoJsonData.features.find((f: any) => 
            f.properties.ZCTA5CE10 === zipCode || f.properties.ZIP === zipCode
          );
          
          if (feature) {
            // Convert GeoJSON coordinates to Leaflet bounds
            const bounds = getBoundsFromGeoJSON(feature);
            overlays.push({ bounds, color, zipCode });
          }
        });
      }
    });

    setAlertOverlays(overlays);
  }, [lakes, geoJsonData, map]);

  // Helper function to find zip codes near a location (mock implementation)
  const findZipCodesNear = (location: { lat: number, lng: number }, radius: number): string[] => {
    // This is a simplified mock implementation
    // In a real app, you would use actual proximity data
    const baseZip = Math.floor(Math.abs(location.lat * location.lng * 100)) % 90000 + 10000;
    const count = Math.floor(radius * 100);
    
    const mockZipCodes = new Set<string>();
    for (let i = 0; i < count; i++) {
      mockZipCodes.add((baseZip + i).toString());
    }
    
    return Array.from(mockZipCodes);
  };

  // Helper function to convert GeoJSON to Leaflet bounds
  const getBoundsFromGeoJSON = (feature: any): LatLngBoundsExpression => {
    // For simplicity, we'll just use the first polygon's bounding box
    if (feature.geometry.type === 'Polygon') {
      const coordinates = feature.geometry.coordinates[0];
      const lats = coordinates.map((coord: number[]) => coord[1]);
      const lngs = coordinates.map((coord: number[]) => coord[0]);
      
      return [
        [Math.min(...lats), Math.min(...lngs)],
        [Math.max(...lats), Math.max(...lngs)]
      ];
    }
    
    // Fallback for other geometry types
    return [
      [feature.bbox?.[1] || 0, feature.bbox?.[0] || 0],
      [feature.bbox?.[3] || 0, feature.bbox?.[2] || 0]
    ];
  };

  // Render GeoJSON overlay with price-based intensity
  if (geoJsonData) {
    return (
      <GeoJSON
        data={geoJsonData}
        style={(feature) => {
          // Get the zip code from the feature
          const zipCode = feature?.properties?.ZCTA5CE10 || feature?.properties?.ZIP;

          // *** ADDED CHECK: Highlight specific zip codes first ***
          if (zipCode && specificZipCodesToHighlight.has(zipCode)) {
            return {
              fillColor: customHighlightColor, // Use the new yellow color
              weight: 1,
              opacity: 0.7,
              color: 'white', // Border color
              fillOpacity: 0.6 // Adjust opacity as needed
            };
          }

          // Find housing data for this zip code
          const housingInfo = housingData?.find(h => h.regionName === zipCode || h.zip === zipCode); // Assuming housingData might have zip property

          // Calculate color intensity based on price data
          let opacity = 0.3; // Default opacity
          let intensity = 0.5; // Default intensity

          if (housingInfo) {
            // Get the latest price
            const price = housingInfo.prices?.[housingInfo.prices.length - 1]?.value ||
                         housingInfo.price || 0; // Assuming housingInfo might have price property

            // Normalize price to get intensity (0-1 range)
            intensity = Math.min(Math.max(price / 1000000, 0.2), 1);
            opacity = Math.min(Math.max(price / 2000000, 0.2), 0.7);
          }

          // Check if this zip code is in a high or low alert area (Keep existing alert logic if needed)
          const alertOverlay = alertOverlays.find(o => o.zipCode === zipCode);
          if (alertOverlay) {
            return {
              fillColor: alertOverlay.color, // Use alert color (highAlertColor or lowAlertColor)
              weight: 1,
              opacity: 0.7,
              color: 'white',
              fillOpacity: 0.6
            };
          }

          // Otherwise, use price-based coloring (existing logic)
          return {
            fillColor: zipCodeBaseColor,
            weight: 1,
            opacity: 0.7,
            color: 'white',
            fillOpacity: opacity * intensity
          };
        }}
        onEachFeature={(feature, layer) => {
          const zipCode = feature?.properties?.ZCTA5CE10 || feature?.properties?.ZIP;
          const housingInfo = housingData?.find(h => h.regionName === zipCode || h.zip === zipCode);
          
          let popupContent = `<div><strong>Zip Code: ${zipCode}</strong>`;
          
          if (housingInfo) {
            const price = housingInfo.prices?.[housingInfo.prices.length - 1]?.value ||
                         housingInfo.price || 0;
            popupContent += `<br/>Average Home Price: $${price.toLocaleString()}`;
          } else {
            popupContent += `<br/>No housing data available`;
          }
          
          popupContent += `</div>`;
          layer.bindPopup(popupContent);
        }}
      />
    );
  }

  // Fallback to rectangle-based overlays if GeoJSON isn't loaded
  return (
    <>
      {alertOverlays.map((overlay, index) => (
        <Rectangle
          key={`alert-${overlay.zipCode}-${index}`}
          bounds={overlay.bounds}
          pathOptions={{
            fillColor: overlay.color,
            color: overlay.color,
            weight: 1,
            fillOpacity: 0.4,
          }}
        >
          <Popup>Zip Code: {overlay.zipCode} ({overlay.color === highAlertColor ? 'High' : 'Low'} Alert)</Popup>
        </Rectangle>
      ))}
    </>
  );
};


// Housing data overlay component
const HousingDataOverlay: React.FC = () => {
  const [housingData, setHousingData] = useState<any[]>([]);
  const map = useMap();
  
  useEffect(() => {
    const fetchHousingData = async () => {
      try {
        const response = await fetch('/housing_data.csv');
        const csvText = await response.text();
        
        Papa.parse(csvText, {
          header: true,
          complete: (results) => {
            const data = results.data.map((row: any) => {
              // Get all column keys
              const keys = Object.keys(row);
              // Get the rightmost column (price column)
              const priceColumn = keys[keys.length - 1];
              
              return {
                zip: row.zip || row.zipcode || row.postal_code,
                lat: parseFloat(row.latitude || row.lat),
                lng: parseFloat(row.longitude || row.lng),
                price: parseFloat(row[priceColumn]) // Get rightmost column
              };
            }).filter((row: any) => 
              !isNaN(row.lat) && !isNaN(row.lng) && !isNaN(row.price)
            );
            
            setHousingData(data);
          },
          error: (error) => {
            console.error('Error parsing CSV:', error);
          }
        });
      } catch (error) {
        console.error('Error fetching housing data:', error);
      }
    };
    
    fetchHousingData();
  }, [map]);
  
  // Find max price to normalize color intensity
  const maxPrice = Math.max(...housingData.map(d => d.price), 0);
  
  return (
    <>
      {housingData.map((data, index) => {
        // Calculate color intensity (0-255) based on relative price
        const intensity = Math.floor(255 * (data.price / maxPrice));
        const fillColor = `rgb(0, ${255 - intensity}, 0)`;
        
        return (
          <Circle
            key={`housing-${index}`}
            center={[data.lat, data.lng]}
            radius={10000} // Adjust radius as needed
            pathOptions={{
              fillColor,
              fillOpacity: 0.6,
              color: '#333',
              weight: 1
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold">Zip: {data.zip}</h3>
                <p>Price: ${data.price.toLocaleString()}</p>
              </div>
            </Popup>
          </Circle>
        );
      })}
    </>
  );
};

// Main map component
const LakesMap: React.FC = () => {
  const { lakes } = useDataContext();
  const navigate = useNavigate();
  
  const handleMarkerClick = (lakeId: string) => {
    // Corrected path to navigate to lake details
    navigate(`/lakes/${lakeId}`);
  };

  // Calculate center of the map based on all lakes
  const defaultCenter = [39.8, -98.6]; // Center of US

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden shadow-md">
      <MapContainer
        center={defaultCenter as [number, number]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Display our known lakes */}
        {lakes.map(lake => (
          <Marker
            key={lake.id}
            position={[lake.location.lat, lake.location.lng]}
            eventHandlers={{
              click: () => handleMarkerClick(lake.id)
            }}
          >
            <Popup>
              <div className="text-sm">
                <h3 className="font-bold text-blue-700">{lake.name}</h3>
                {/* Updated Popup Content */}
                <p>Current Level: {lake.currentLevel.toFixed(2)} ft</p>
                <p>Normal Level: {lake.normalLevel.toFixed(2)} ft</p>
                <p className={`${
                  lake.currentLevel > lake.criticalHighLevel
                    ? 'text-red-600'
                    : lake.currentLevel < lake.criticalLowLevel
                    ? 'text-orange-600'
                    : 'text-green-600'
                }`}>
                  Status: {
                    lake.currentLevel > lake.criticalHighLevel
                      ? 'High'
                      : lake.currentLevel < lake.criticalLowLevel
                      ? 'Low'
                      : 'Normal'
                  }
                </p>
                <button
                  onClick={() => handleMarkerClick(lake.id)}
                  className="mt-2 text-blue-600 hover:text-blue-800 underline"
                >
                  View Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Circle overlay representing lake sizes (optional, can be removed if redundant) */}
        {/*
        {lakes.map(lake => (
          <Circle
            key={`circle-${lake.id}`}
            center={[lake.location.lat, lake.location.lng]}
            radius={Math.sqrt(lake.surfaceArea) * 500} // Scale circle based on surface area
            pathOptions={{
              fillColor: lake.currentLevel > lake.criticalHighLevel
                ? '#ef4444' // red
                : lake.currentLevel < lake.criticalLowLevel
                ? '#f97316' // orange
                : '#22c55e', // green
              fillOpacity: 0.4,
              color: '#3388ff',
              weight: 1
            }}
          />
        ))}
        */}

        {/* Housing Data Overlay */}
        <HousingDataOverlay />

        {/* USGS Lakes Overlay */}
        <USGSLakesOverlay />

        {/* --- ADDED Zip Code Alert Overlay --- */}
        <ZipCodeAlertOverlay />

        {/* Map updater to fit bounds */}
        <MapUpdater lakes={lakes} />
      </MapContainer>
    </div>
  );
};

export default LakesMap;