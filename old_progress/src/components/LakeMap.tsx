import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { Lake } from '../types';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';

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

const LakeMap: React.FC<LakeMapProps> = ({ lakes, height = '100%', selectedLake }) => {
  const navigate = useNavigate();

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
      </MapContainer>
    </div>
  );
};

export default LakeMap;