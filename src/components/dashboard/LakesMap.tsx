import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { useDataContext } from '../../context/DataContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

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
        const response = await fetch(
          'https://waterservices.usgs.gov/nwis/dv/?format=json&stateCd=ca&siteStatus=all&siteType=LK'
        );
        const data = await response.json();
        
        if (data.value && data.value.timeSeries) {
          const lakes = data.value.timeSeries.map((series: any) => {
            return {
              id: series.sourceInfo.siteCode[0].value,
              name: series.sourceInfo.siteName,
              location: {
                lat: series.sourceInfo.geoLocation.geogLocation.latitude,
                lng: series.sourceInfo.geoLocation.geogLocation.longitude
              },
              // Calculate size based on available data or use a default
              size: series.sourceInfo.siteProperty ? 
                    series.sourceInfo.siteProperty.find((p: any) => p.name === 'lakeArea')?.value || 5000 : 
                    5000
            };
          });
          
          // Filter out duplicates
          const uniqueLakes = lakes.filter((lake: any, index: number, self: any[]) => 
            index === self.findIndex((l) => l.name === lake.name)
          );
          
          setUsgsLakes(uniqueLakes);
        }
      } catch (error) {
        console.error('Error fetching USGS data:', error);
      }
    };
    
    fetchUSGSData();
  }, [map]);
  
  return (
    <>
      {usgsLakes.map(lake => (
        <Circle
          key={lake.id}
          center={[lake.location.lat, lake.location.lng]}
          radius={Math.sqrt(lake.size) * 100} // Scale circle based on lake size
          pathOptions={{
            fillColor: '#3388ff',
            fillOpacity: 0.6,
            color: '#3388ff',
            weight: 1
          }}
        >
          <Popup>
            <div className="text-sm">
              <h3 className="font-bold text-blue-700">{lake.name}</h3>
              <p>Site ID: {lake.id}</p>
              <p>Location: {lake.location.lat.toFixed(4)}, {lake.location.lng.toFixed(4)}</p>
              {lake.size && <p>Area: {Number(lake.size).toLocaleString()} sq meters</p>}
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

// Main map component
const LakesMap: React.FC = () => {
  const { lakes, housingData } = useDataContext();
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
                <p>Current Level: {lake.currentLevel.toFixed(2)} ft</p>
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
        
        {/* Housing data overlay - simple circles for now */}
        {housingData.map(data => {
          // Find max price to normalize color scale
          const maxPrice = Math.max(...housingData.map(d => 
            Math.max(...d.prices.map(p => p.value))
          ));
          
          // Get latest price
          const latestPrice = data.prices.slice(-1)[0].value;
          
          // Calculate color intensity (0-255) based on relative price
          const intensity = Math.floor(255 * (latestPrice / maxPrice));
          const fillColor = `rgb(0, ${255 - intensity}, 0)`;
          
          // We need coordinates for zip codes - in a real app, you'd have geocoding
          // For this demo, we'll use synthetic coordinates based on the zip code
          const zipNum = parseInt(data.regionName, 10);
          const lat = 25 + (zipNum % 100000) / 2500; // Generate locations in the US
          const lng = -65 - (zipNum % 100000) / 2500;
          
          return (
            <Circle
              key={`housing-${data.regionId}`}
              center={[lat, lng]}
              radius={20000} // Fixed size for demo
              pathOptions={{
                fillColor,
                fillOpacity: 0.6,
                color: '#333',
                weight: 1
              }}
            >
              <Popup>
                <div className="text-sm">
                  <h3 className="font-bold">Zip: {data.regionName}</h3>
                  <p>{data.city}, {data.state}</p>
                  <p>Latest Price: ${latestPrice.toLocaleString()}</p>
                </div>
              </Popup>
            </Circle>
          );
        })}
        
        {/* USGS Lakes Overlay */}
        <USGSLakesOverlay />
        
        {/* Map updater to fit bounds */}
        <MapUpdater lakes={lakes} />
      </MapContainer>
    </div>
  );
};

export default LakesMap;