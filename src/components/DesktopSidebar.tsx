import React, { useState } from 'react';
import type { BusStop, BusPosition, UserLocation, BusLine } from '../types';
import { calculateDistance, formatDistance, formatTime } from '../utils';
import BusStopsList from './BusStopsList';

interface DesktopSidebarProps {
  userLocation: UserLocation | null;
  closestStop: BusStop | null;
  busPositions: BusPosition[];
  busStops: BusStop[];
  selectedLine: BusLine | null;
  loading: boolean;
  error: string | null;
  locationAccuracy?: number | null;
  onRefreshLocation?: () => void;
  onStopSelect?: (stop: BusStop) => void;
}

const DesktopSidebar: React.FC<DesktopSidebarProps> = ({
  userLocation,
  closestStop,
  busPositions,
  busStops,
  selectedLine,
  loading,
  error,
  locationAccuracy,
  onRefreshLocation,
  onStopSelect,
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'stops' | 'buses'>('overview');

  return (
    <div className="h-full bg-white dark:bg-gray-900 shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Vibuzz</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {selectedLine ? selectedLine.label : 'Real-time bus tracking'}
            </p>
          </div>
          
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-50 dark:bg-gray-800 rounded-lg p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'stops', label: 'Stops', icon: '🚏' },
            { id: 'buses', label: 'Buses', icon: '🚌' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as any)}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-md text-sm font-medium transition-all ${
                activeSection === tab.id
                  ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto">
        {error && (
          <div className="m-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
        )}

        {activeSection === 'overview' && (
          <div className="p-6 space-y-6">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400">Your Location</h3>
                    <p className="text-lg font-semibold text-blue-900 dark:text-blue-200">
                      {userLocation ? 'Active' : 'Not Found'}
                    </p>
                  </div>
                  <div className="text-3xl">📍</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400">Bus Stops</h3>
                    <p className="text-lg font-semibold text-green-900 dark:text-green-200">{busStops.length}</p>
                  </div>
                  <div className="text-3xl">🚏</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/30 dark:to-red-800/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Active Buses</h3>
                    <p className="text-lg font-semibold text-red-900 dark:text-red-200">{busPositions.length}</p>
                  </div>
                  <div className="text-3xl">🚌</div>
                </div>
              </div>
            </div>

            {/* User Location Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
                  <span className="text-xl mr-2">📍</span>
                  Your Location
                </h3>
                {onRefreshLocation && (
                  <button
                    onClick={onRefreshLocation}
                    className="px-3 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-medium border border-blue-200 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                )}
              </div>
              
              {userLocation ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-700 p-2 rounded">
                    {userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}
                  </div>
                  {locationAccuracy && (
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Accuracy: ±{Math.round(locationAccuracy)}m
                      {locationAccuracy > 100 && (
                        <span className="text-orange-600 dark:text-orange-400 ml-1">(Low accuracy - try refreshing)</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Location not available</p>
                  <p className="text-xs mt-1">Enable location access in your browser</p>
                </div>
              )}
            </div>

            {/* Closest Stop */}
            {closestStop && userLocation && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/30 dark:to-orange-900/30 rounded-lg p-4 border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">🎯</span>
                      <h3 className="font-semibold text-gray-900 dark:text-white">Closest Stop</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 mb-2">{closestStop.name}</p>
                    <div className="space-y-1 text-xs text-gray-600 dark:text-gray-300">
                      <div>📍 Distance: {formatDistance(calculateDistance(userLocation, {
                        lat: closestStop.coordinates.latitude,
                        lng: closestStop.coordinates.longitude
                      }))}</div>
                      <div>🕒 ETA: {formatTime(closestStop.eta)}</div>
                      <div>🚌 Travel Time: {Math.round(closestStop.travelTimeTo)} min</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onStopSelect?.(closestStop)}
                    className="ml-3 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-700 dark:text-yellow-300 rounded-lg text-xs font-medium border border-yellow-300 dark:border-yellow-600 hover:bg-yellow-200 dark:hover:bg-yellow-900/70 transition-colors"
                  >
                    View on Map
                  </button>
                </div>
              </div>
            )}

            {/* Route Information */}
            {selectedLine && (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                  <span className="text-xl mr-2">🚌</span>
                  Route Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Line:</span>
                    <span className="font-medium dark:text-gray-200">{selectedLine.line}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Direction:</span>
                    <span className="font-medium">{selectedLine.direction}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Company:</span>
                    <span className="font-medium">{selectedLine.company}</span>
                  </div>
                  {selectedLine.ticketPrice && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Price:</span>
                      <span className="font-medium">{selectedLine.ticketPrice} MAD</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'stops' && (
          <BusStopsList
            stops={busStops}
            userLocation={userLocation}
            closestStop={closestStop}
            onStopSelect={onStopSelect}
          />
        )}

        {activeSection === 'buses' && (
          <div className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🚌</span>
              Active Buses ({busPositions.length})
            </h3>
            
            {busPositions.length > 0 ? (
              busPositions.map((bus, index) => (
                <div key={`${bus.trackerId}-${index}`} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">Bus #{bus.number}</h4>
                      <p className="text-sm text-gray-500">ID: {bus.trackerId}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">{bus.speed}</div>
                      <div className="text-xs text-gray-500">km/h</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-gray-500">Direction:</span>
                      <div className="font-medium">{bus.direction}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Heading:</span>
                      <div className="font-medium">{bus.bearing}°</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Last Update:</span>
                      <div className="font-medium">{new Date(bus.date).toLocaleString()}</div>
                    </div>
                    {userLocation && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Distance from you:</span>
                        <div className="font-medium">
                          {formatDistance(calculateDistance(userLocation, {
                            lat: bus.coordinates.latitude,
                            lng: bus.coordinates.longitude
                          }))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-6xl mb-4">🚌</div>
                <p className="text-lg">No active buses found</p>
                <p className="text-sm">Buses will appear here when they're active on this route</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center justify-between">
            <span>🔄 Auto-refresh:</span>
            <span className="font-medium">30s</span>
          </div>
          <div className="flex items-center justify-between">
            <span>📡 Status:</span>
            <span className="font-medium text-green-600">Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DesktopSidebar;
