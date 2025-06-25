import React from 'react';
import type { BusStop, BusPosition, UserLocation, BusLine } from '../types';
import { calculateDistance, formatDistance } from '../utils';

interface InfoPanelProps {
  userLocation: UserLocation | null;
  closestStop: BusStop | null;
  busPositions: BusPosition[];
  totalStops: number;
  loading: boolean;
  error: string | null;
  locationAccuracy?: number | null;
  onRefreshLocation?: () => void;
  selectedLine?: BusLine | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({
  userLocation,
  closestStop,
  busPositions,
  totalStops,
  loading,
  error,
  locationAccuracy,
  onRefreshLocation,
  selectedLine,
}) => {
  const latestBusPosition = busPositions.length > 0 ? busPositions[0] : null;
  
  return (
    <div className="bg-white shadow-lg rounded-lg p-4 m-4 max-w-md">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Bus Tracker</h2>
      
      {loading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading...</span>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* User Location Section */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-blue-800 flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Your Location
          </h3>
          {onRefreshLocation && (
            <button
              onClick={onRefreshLocation}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded border border-blue-300 hover:bg-blue-100 transition-colors"
              title="Refresh location"
            >
              🔄 Refresh
            </button>
          )}
        </div>
        {userLocation ? (
          <div className="text-sm text-gray-600 mt-1">
            <p>📍 {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</p>
            {locationAccuracy && (
              <p className="text-xs text-gray-500 mt-1">
                Accuracy: ±{Math.round(locationAccuracy)}m
                {locationAccuracy > 100 && (
                  <span className="text-orange-600"> (Low accuracy - try refreshing)</span>
                )}
              </p>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-500 mt-1">
            <p>Location not available</p>
            <p className="text-xs mt-1">Make sure to allow location access in your browser</p>
          </div>
        )}
      </div>
      
      {/* Closest Stop Section */}
      <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
        <h3 className="font-semibold text-yellow-800 flex items-center">
          <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
          Closest Stop
        </h3>
        {closestStop && userLocation ? (
          <div className="text-sm text-gray-600 mt-1">
            <p className="font-medium">{closestStop.name}</p>
            <p>📍 Distance: {formatDistance(
              calculateDistance(
                userLocation,
                { lat: closestStop.coordinates.latitude, lng: closestStop.coordinates.longitude }
              )
            )}</p>
            <p>🕒 ETA: {Math.round(closestStop.eta)} min</p>
            <p>🚌 Travel Time: {Math.round(closestStop.travelTimeTo)} min</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-1">
            {!userLocation ? 'Enable location to find closest stop' : 'No stops available'}
          </p>
        )}
      </div>
      
      {/* Bus Information Section */}
      <div className="mb-4 p-3 bg-red-50 rounded-lg">
        <h3 className="font-semibold text-red-800 flex items-center">
          <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
          Bus Status
        </h3>
        {latestBusPosition ? (
          <div className="text-sm text-gray-600 mt-1">
            <p>🚌 Bus #{latestBusPosition.number}</p>
            <p>⚡ Speed: {latestBusPosition.speed} km/h</p>
            <p>🧭 Direction: {latestBusPosition.direction}</p>
            <p>🕐 Last Update: {new Date(latestBusPosition.date).toLocaleTimeString()}</p>
            {userLocation && (
              <p>📍 Distance from you: {formatDistance(
                calculateDistance(
                  userLocation,
                  { lat: latestBusPosition.coordinates.latitude, lng: latestBusPosition.coordinates.longitude }
                )
              )}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-500 mt-1">No bus data available</p>
        )}
      </div>
      
      {/* Route Information */}
      <div className="p-3 bg-green-50 rounded-lg">
        <h3 className="font-semibold text-green-800 flex items-center">
          <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
          Route Info
        </h3>
        <div className="text-sm text-gray-600 mt-1">
          <p>🚏 Total Stops: {totalStops}</p>
          <p>🔄 Updates every 30 seconds</p>
          {selectedLine && (
            <>
              <p>📍 Route: {selectedLine.label}</p>
              <p>🚌 Line: {selectedLine.line}</p>
              <p>🧭 Direction: {selectedLine.direction}</p>
              <p>🏢 Company: {selectedLine.company}</p>
              {selectedLine.ticketPrice && (
                <p>💰 Price: {selectedLine.ticketPrice} MAD</p>
              )}
              {selectedLine.firstStop && selectedLine.lastStop && (
                <div className="mt-2 p-2 bg-white rounded text-xs">
                  <p className="font-medium">Route:</p>
                  <p>📍 From: {selectedLine.firstStop.name}</p>
                  <p>📍 To: {selectedLine.lastStop.name}</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-2">Map Legend</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center">
            <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
            Your Location
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-red-500 rounded-full mr-2"></span>
            Active Bus
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
            Closest Stop
          </div>
          <div className="flex items-center">
            <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
            Bus Stops
          </div>
          <div className="flex items-center">
            <span className="w-3 h-1 bg-blue-400 mr-2"></span>
            Bus Route
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
