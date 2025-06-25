import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import { DivIcon } from 'leaflet';
import type { UserLocation, BusStop, BusPosition, BusLine } from '../types';
import { calculateDistance, formatDistance, formatTime } from '../utils';

// Import Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface MapComponentProps {
  userLocation: UserLocation | null;
  busStops: BusStop[];
  busPositions: BusPosition[];
  routePath: Array<{ lat: number; lng: number }>;
  closestStop: BusStop | null;
  selectedLine?: BusLine | null;
}

// Custom modern marker icons with improved visual design
const createCustomIcon = (color: string, label?: string, pulse: boolean = false) => {
  return new DivIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-lg ${color} ${pulse ? 'animate-pulse-slow' : ''}">
          ${label ? `<span class="text-white text-xs font-bold">${label}</span>` : ''}
        </div>
        ${label ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-white px-2 py-0.5 rounded-full shadow-md border border-gray-100">${label}</div>` : ''}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
  });
};

// Updated icons with modern design
const userIcon = createCustomIcon('bg-primary-600', 'You', true);
const busIcon = createCustomIcon('bg-error-600', 'Bus');
const stopIcon = new DivIcon({
  className: 'custom-div-icon',
  html: `<div class="w-4 h-4 rounded-full bg-success-600 border-2 border-white shadow-sm"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});
const closestStopIcon = createCustomIcon('bg-warning-500', 'Closest');

const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  busStops,
  busPositions,
  routePath,
  closestStop,
  selectedLine,
}) => {
  // Default center (Kenitra, Morocco)
  const defaultCenter: [number, number] = [34.261, -6.582];
  const mapCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng] 
    : defaultCenter;

  return (
    <div className="h-full w-full">
      <MapContainer
        center={mapCenter}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Route path */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath.map(p => [p.lat, p.lng])}
            color="#2563EB"
            weight={6}
            opacity={0.9}
            smoothFactor={2}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* User location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-blue-600">Your Location</h3>
                <p className="text-sm text-gray-600">
                  Lat: {userLocation.lat.toFixed(6)}<br />
                  Lng: {userLocation.lng.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Bus stops */}
        {busStops.map((stop) => {
          const isClosest = closestStop?.id === stop.id;
          const icon = isClosest ? closestStopIcon : stopIcon;
          
          return (
            <Marker
              key={stop.id}
              position={[stop.coordinates.latitude, stop.coordinates.longitude]}
              icon={icon}
            >
              <Popup>
                <div className="p-2 max-w-xs">
                  <h3 className={`font-semibold ${isClosest ? 'text-yellow-600' : 'text-green-600'}`}>
                    {isClosest ? '🎯 Closest Stop' : 'Bus Stop'}
                  </h3>
                  <p className="text-sm font-medium text-gray-800">{stop.name}</p>
                  <div className="mt-2 text-xs text-gray-600">
                    <p>ETA: {formatTime(stop.eta)}</p>
                    <p>Travel Time: {formatTime(stop.travelTimeTo)}</p>
                    {userLocation && (
                      <p>
                        Distance: {formatDistance(
                          calculateDistance(
                            userLocation,
                            { lat: stop.coordinates.latitude, lng: stop.coordinates.longitude }
                          )
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Bus positions */}
        {busPositions.map((bus, index) => (
          <Marker
            key={`${bus.trackerId}-${index}`}
            position={[bus.coordinates.latitude, bus.coordinates.longitude]}
            icon={busIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-red-600">Bus #{bus.number}</h3>
                <div className="mt-2 text-xs text-gray-600">
                  <p>Speed: {bus.speed} km/h</p>
                  <p>Heading: {bus.bearing}°</p>
                  <p>Last Update: {new Date(bus.date).toLocaleTimeString()}</p>
                  <p>Tracker ID: {bus.trackerId}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
