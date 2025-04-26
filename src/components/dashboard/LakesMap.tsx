import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
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
    navigate(`/lake/${lakeId}`);
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
                <p>Current Level / Reservoir Size: {lake.currentLevel.toFixed(2)} ft</p>
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
        
        {/* Circle overlay representing lake sizes */}
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
        
        {/* Housing Data Overlay */}
        <HousingDataOverlay />
        
        {/* USGS Lakes Overlay */}
        <USGSLakesOverlay />
        
        {/* Map updater to fit bounds */}
        <MapUpdater lakes={lakes} />
      </MapContainer>
    </div>
  );
};

export default LakesMap;