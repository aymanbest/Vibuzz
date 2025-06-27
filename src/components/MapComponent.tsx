import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import { DivIcon } from 'leaflet';
// No need for Tabler icons here as we're using SVG strings directly
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
  selectedStop?: BusStop | null;
  highlightedBus?: string | null;
  onStopSelect?: (stop: BusStop) => void;
  onLocationSelect?: (location: UserLocation) => void;
  canSetManualLocation?: boolean;
}

// Custom modern marker icons with Tabler icons
const createTablerIconMarker = (icon: string, color: string, label?: string, pulse: boolean = false, size: number = 32) => {
  return new DivIcon({
    className: 'custom-div-icon',
    html: `
      <div class="relative">
        <div class="w-${size/4} h-${size/4} rounded-full flex items-center justify-center border-2 border-white shadow-lg ${color} ${pulse ? 'animate-pulse-slow' : ''}">
          ${icon}
        </div>
        ${label ? `<div class="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-semibold bg-white px-2 py-0.5 rounded-full shadow-md border border-gray-100">${label}</div>` : ''}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size/2, size/2],
    popupAnchor: [0, -size/2]
  });
};

// Icon HTML strings
const userIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-current-location" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="white" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
  <path d="M12 12m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0" />
  <path d="M12 2l0 2" />
  <path d="M12 20l0 2" />
  <path d="M20 12l2 0" />
  <path d="M2 12l2 0" />
</svg>`;

const busIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-bus" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="white" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M6 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  <path d="M18 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
  <path d="M4 17h-2v-11a1 1 0 0 1 1 -1h14a5 7 0 0 1 5 7v5h-2m-4 0h-8" />
  <path d="M16 5l0 12" />
  <path d="M8 5l0 12" />
  <path d="M4 9l16 0" />
  <path d="M4 13l16 0" />
</svg>`;

const stopIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-map-pin" width="20" height="20" viewBox="0 0 24 24" stroke-width="2.5" stroke="#10B981" fill="white" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M9 11a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" />
  <path d="M17.657 16.657l-4.243 4.243a2 2 0 0 1 -2.827 0l-4.244 -4.243a8 8 0 1 1 11.314 0z" />
</svg>`;

const selectedStopIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-map-pin-filled" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="#7C3AED" fill="#7C3AED" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M18.364 4.636a9 9 0 0 1 .203 12.519l-.203 .21l-6.364 6.364l-6.364 -6.364a9 9 0 0 1 12.728 -12.728zm-6.364 3.364a3 3 0 1 0 0 6a3 3 0 0 0 0 -6z" stroke-width="0" fill="currentColor" />
</svg>`;

const closestStopIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" class="icon icon-tabler icon-tabler-pin" width="22" height="22" viewBox="0 0 24 24" stroke-width="2.5" stroke="#EAB308" fill="#FEFCE8" stroke-linecap="round" stroke-linejoin="round">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M15 4.5l-4 4l-4 1.5l-1.5 1.5l7 7l1.5 -1.5l1.5 -4l4 -4" />
  <path d="M9 15l-4.5 4.5" />
  <path d="M14.5 4l5.5 5.5" />
</svg>`;

// Enhanced icons with Tabler Icons design - making them more visible
const userIcon = createTablerIconMarker(userIconSvg, 'bg-primary-600', 'You', true, 40);
const busIcon = createTablerIconMarker(busIconSvg, 'bg-error-600', '', false, 40);
const highlightedBusIcon = createTablerIconMarker(busIconSvg, 'bg-blue-600', 'Selected', true, 48);

// Enhanced stop icon with better visibility
const stopIcon = new DivIcon({
  className: 'custom-div-icon',
  html: `<div class="relative w-8 h-8 flex items-center justify-center">
    <div class="absolute w-8 h-8 bg-white rounded-full opacity-70"></div>
    ${stopIconSvg}
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

// Enhanced closest stop icon with better visibility
const closestStopIcon = new DivIcon({
  className: 'custom-div-icon',
  html: `<div class="relative w-10 h-10 flex items-center justify-center">
    <div class="absolute w-10 h-10 bg-yellow-100 rounded-full opacity-90"></div>
    ${closestStopIconSvg}
    <div class="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-yellow-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg shadow-sm">Closest</div>
  </div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40]
});

// Enhanced selected stop icon with better visibility and animation
const selectedStopIcon = new DivIcon({
  className: 'custom-div-icon',
  html: `<div class="relative w-12 h-12 flex items-center justify-center animate-pulse-slow">
    <div class="absolute w-12 h-12 bg-purple-100 rounded-full shadow-lg opacity-90"></div>
    <div class="absolute w-8 h-8 bg-purple-500 rounded-full opacity-70"></div>
    ${selectedStopIconSvg}
    <div class="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-purple-500 text-white text-xs font-bold px-2 py-1 rounded-md shadow-md">Selected</div>
  </div>`,
  iconSize: [48, 48],
  iconAnchor: [24, 48],
  popupAnchor: [0, -48]
});

const MapComponent: React.FC<MapComponentProps> = ({
  userLocation,
  busStops,
  busPositions,
  routePath,
  closestStop,
  selectedLine,
  selectedStop,
  highlightedBus,
  onStopSelect,
  onLocationSelect,
  canSetManualLocation
}) => {
  // Default center (Kenitra, Morocco)
  const defaultCenter: [number, number] = [34.261, -6.582];
  const mapCenter: [number, number] = selectedStop 
    ? [selectedStop.coordinates.latitude, selectedStop.coordinates.longitude]
    : userLocation 
      ? [userLocation.lat, userLocation.lng] 
      : defaultCenter;

  // Component to handle map clicks for manual location setting
  const LocationSelector = () => {
    useMapEvents({
      click: (e) => {
        if (canSetManualLocation && onLocationSelect) {
          const { lat, lng } = e.latlng;
          onLocationSelect({ lat, lng });
        }
      },
    });
    return null;
  };

  return (
    <div className="h-full w-full relative">
      {/* Manual location instruction overlay */}
      {canSetManualLocation && (
        <div className="absolute top-4 left-4 right-4 z-50 bg-blue-500 text-white p-3 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-center">
            📍 Click anywhere on the map to set your location
          </p>
        </div>
      )}
      
      <MapContainer
        center={mapCenter}
        zoom={14}
        className="h-full w-full"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Location selector for manual location setting */}
        {canSetManualLocation && <LocationSelector />}
        
        {/* Route path - more vibrant */}
        {routePath.length > 0 && (
          <Polyline
            positions={routePath.map(p => [p.lat, p.lng])}
            color="#2563EB" // Bright blue
            weight={6}
            opacity={0.85}
            smoothFactor={2}
            lineCap="round"
            lineJoin="round"
          />
        )}
        
        {/* User location */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
            <Popup>
              <div className="p-3 max-w-xs">
                <h3 className="font-semibold text-blue-600 text-base mb-2">Your Location</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-600 font-medium">Latitude</div>
                    <div className="text-sm font-bold text-gray-800">{userLocation.lat.toFixed(6)}</div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded">
                    <div className="text-xs text-gray-600 font-medium">Longitude</div>
                    <div className="text-sm font-bold text-gray-800">{userLocation.lng.toFixed(6)}</div>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Bus stops */}
        {busStops.map((stop) => {
          const isClosest = closestStop?.id === stop.id;
          const isSelected = selectedStop?.id === stop.id;
          
          // Choose the appropriate icon
          let icon;
          if (isSelected) {
            icon = selectedStopIcon;
          } else if (isClosest) {
            icon = closestStopIcon;
          } else {
            icon = stopIcon;
          }
          
          return (
            <Marker
              key={stop.id}
              position={[stop.coordinates.latitude, stop.coordinates.longitude]}
              icon={icon}
              eventHandlers={{
                click: () => onStopSelect?.(stop)
              }}
            >
              <Popup>
                <div className={`p-3 max-w-xs border-t-4 border-b-0 border-l-0 border-r-0 rounded-t-none rounded-b-lg shadow-lg
                  ${isSelected ? 'border-purple-500' : isClosest ? 'border-yellow-500' : 'border-green-500'}`}>
                  <h3 className={`font-semibold text-base mb-1 ${
                    isSelected ? 'text-purple-600' : 
                    isClosest ? 'text-yellow-600' : 
                    'text-green-600'
                  }`}>
                    {isSelected ? 'Selected Stop' :
                     isClosest ? 'Closest Stop' : 
                     'Bus Stop'}
                  </h3>
                  <p className="text-sm font-medium text-gray-800 mb-2">{stop.name}</p>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-xs text-blue-800 font-medium">ETA</div>
                      <div className="text-sm font-bold text-blue-600">{formatTime(stop.eta)}</div>
                    </div>
                    
                    <div className="bg-green-50 p-2 rounded">
                      <div className="text-xs text-green-800 font-medium">Travel Time</div>
                      <div className="text-sm font-bold text-green-600">{formatTime(stop.travelTimeTo)}</div>
                    </div>
                    
                    {userLocation && (
                      <div className="col-span-2 bg-gray-50 p-2 rounded">
                        <div className="text-xs text-gray-800 font-medium">Distance</div>
                        <div className="text-sm font-bold text-gray-600">
                          {formatDistance(
                            calculateDistance(
                              userLocation,
                              { lat: stop.coordinates.latitude, lng: stop.coordinates.longitude }
                            )
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        
        {/* Bus positions */}
        {busPositions.map((bus, index) => {
          const isHighlighted = highlightedBus === bus.trackerId;
          const currentBusIcon = isHighlighted ? highlightedBusIcon : busIcon;
          
          return (
            <Marker
              key={`${bus.trackerId}-${index}`}
              position={[bus.coordinates.latitude, bus.coordinates.longitude]}
              icon={currentBusIcon}
            >
              <Popup>
                <div className={`p-3 border-t-4 border-b-0 border-l-0 border-r-0 rounded-t-none rounded-b-lg shadow-lg ${
                  isHighlighted ? 'border-blue-500' : 'border-red-500'
                }`}>
                  <h3 className={`font-semibold text-base mb-2 ${
                    isHighlighted ? 'text-blue-600' : 'text-red-600'
                  }`}>
                    {isHighlighted ? 'Selected Bus' : 'Bus'} #{bus.number}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-600 font-medium">Speed</div>
                      <div className="text-sm font-bold text-gray-800">{bus.speed} km/h</div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-600 font-medium">Heading</div>
                      <div className="text-sm font-bold text-gray-800">{bus.bearing}°</div>
                    </div>
                    <div className="col-span-2 bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-600 font-medium">Last Update</div>
                      <div className="text-sm font-bold text-gray-800">
                        {new Date(bus.date).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-gray-500 mt-1">
                      Tracker ID: {bus.trackerId}
                    </div>
                    {selectedLine && (
                      <div className="col-span-2 bg-blue-50 p-2 rounded">
                        <div className="text-xs text-blue-800 font-medium">Route</div>
                        <div className="text-sm font-bold text-blue-600">{selectedLine.line}</div>
                      </div>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
