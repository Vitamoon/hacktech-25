import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Lake } from '../types';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import axios from 'axios';

// Fix for the default marker icon in Leaflet
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const defaultIcon = new Icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface LakeMapProps {
  lakes: Lake[];
  height?: string;
  selectedLake?: string;
}

// Interface for USGS data
interface USGSFeature {
  type: string;
  geometry: {
    type: string;
    coordinates: [number, number];
  };
  properties: {
    siteName: string;
    variable: string;
    unit: string;
    value: number;
    dateTime: string;
  };
}

const LakeMap: React.FC<LakeMapProps> = ({ lakes, height = '100%', selectedLake }) => {
  const navigate = useNavigate();
  const [usgsData, setUsgsData] = useState<USGSFeature[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUSGSData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          'https://waterservices.usgs.gov/nwis/dv/?format=json&stateCd=ca&siteStatus=all&siteType=GL,OC-CO,ES,LK'
        );
        
        // Transform the USGS data into GeoJSON features
        const features: USGSFeature[] = response.data.value.timeSeries.map((ts: any) => {
          const { latitude: lat, longitude: lon } = ts.sourceInfo.geoLocation.geogLocation;
          const latest = ts.values[0].value[0];
          
          return {
            type: 'Feature',
            geometry: {
              type: 'Point',
              coordinates: [lon, lat]
            },
            properties: {
              siteName: ts.sourceInfo.siteName,
              variable: ts.variable.variableName,
              unit: ts.variable.unit.unitCode,
              value: parseFloat(latest.value),
              dateTime: latest.dateTime
            }
          };
        });
        
        setUsgsData(features);
      } catch (err) {
        console.error('Error fetching USGS data:', err);
        setError('Failed to load USGS water data');
      } finally {
        setLoading(false);
      }
    };

    fetchUSGSData();
  }, []);

  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'bg-green-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'danger':
        return 'bg-red-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Calculate map center
  const calculateMapCenter = () => {
    if (selectedLake) {
      const lake = lakes.find(l => l.id === selectedLake);
      if (lake) {
        return [lake.location.lat, lake.location.lng];
      }
    }
    
    // Default to center of US if no lakes or no selected lake
    if (lakes.length === 0) {
      return [39.8283, -98.5795];
    }
    
    // Calculate center from all lakes
    return [39.8283, -98.5795]; // Center of US as default
  };

  const mapCenter = calculateMapCenter();
  const zoom = selectedLake ? 8 : 4;

  return (
    <div style={{ height, width: '100%' }}>
      {loading && (
        <div className="absolute top-2 right-2 z-10 bg-white px-3 py-1 rounded-md shadow-md text-sm">
          Loading USGS data...
        </div>
      )}
      {error && (
        <div className="absolute top-2 right-2 z-10 bg-red-100 text-red-800 px-3 py-1 rounded-md shadow-md text-sm">
          {error}
        </div>
      )}
      <MapContainer 
        center={[mapCenter[0], mapCenter[1]]} 
        zoom={zoom} 
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          // This is a workaround for the map not rendering correctly
          setTimeout(() => {
            map.invalidateSize();
          }, 0);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Mock lake data markers */}
        {lakes.map((lake) => (
          <Marker 
            key={lake.id}
            position={[lake.location.lat, lake.location.lng]}
            icon={defaultIcon}
            eventHandlers={{
              click: () => {
                navigate(`/lakes/${lake.id}`);
              },
            }}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{lake.name}</h3>
                <div className="flex items-center justify-center mt-1 space-x-2">
                  <div className={`h-3 w-3 rounded-full ${getMarkerColor(lake.status)}`}></div>
                  <p className="text-sm capitalize">{lake.status}</p>
                </div>
                <p className="text-sm mt-1">Current Level: {lake.currentLevel}m</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/lakes/${lake.id}`);
                  }}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                >
                  Details
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
        
        {/* USGS data circle markers */}
        {usgsData.map((feature, index) => (
          <CircleMarker
            key={`usgs-${index}`}
            center={[feature.geometry.coordinates[1], feature.geometry.coordinates[0]]}
            radius={Math.sqrt(feature.properties.value) / 100 || 5}
            fillColor="#0077be"
            color="#333"
            weight={1}
            fillOpacity={0.6}
          >
            <Popup>
              <div className="text-center">
                <h3 className="font-semibold">{feature.properties.siteName}</h3>
                <p className="text-sm mt-1">
                  {feature.properties.variable}: {feature.properties.value} {feature.properties.unit}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(feature.properties.dateTime).toLocaleDateString()}
                </p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LakeMap;

const calculateDistance = (region: HousingData, lake: Lake): number => {
  // Simple distance calculation (this would be replaced with actual geocoding in production)
  return Math.random() * 100; // Mock distance in miles
};