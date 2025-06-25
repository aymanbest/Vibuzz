import React, { useState } from 'react';
import type { BusStop, BusPosition, UserLocation, BusLine } from '../types';
import { calculateDistance, formatDistance } from '../utils';
import BusStopsList from './BusStopsList';

interface MobileBottomSheetProps {
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

const MobileBottomSheet: React.FC<MobileBottomSheetProps> = ({
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stops' | 'buses'>('overview');

  const handleDragStart = (e: React.TouchEvent) => {
    const startY = e.touches[0].clientY;
    
    const handleDragMove = (e: TouchEvent) => {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      
      if (deltaY > 50 && isExpanded) {
        setIsExpanded(false);
      } else if (deltaY < -50 && !isExpanded) {
        setIsExpanded(true);
      }
    };
    
    const handleDragEnd = () => {
      document.removeEventListener('touchmove', handleDragMove);
      document.removeEventListener('touchend', handleDragEnd);
    };
    
    document.addEventListener('touchmove', handleDragMove);
    document.addEventListener('touchend', handleDragEnd);
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-all duration-300 z-[1000] ${
        isExpanded ? 'h-5/6' : 'h-64'
      }`}
    >
      {/* Drag Handle */}
      <div
        className="flex justify-center py-3 cursor-pointer"
        onTouchStart={handleDragStart}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
      </div>

      {/* Header */}
      <div className="px-6 pb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Bus Tracker</h2>
            <p className="text-sm text-gray-500">
              {selectedLine ? selectedLine.label : 'Select a bus line'}
            </p>
          </div>
          
          {loading && (
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'stops', label: 'Stops', icon: '🚏' },
            { id: 'buses', label: 'Buses', icon: '🚌' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className={`overflow-y-auto ${isExpanded ? 'h-full pb-32' : 'h-32'}`}>
        {error && (
          <div className="mx-6 mb-4 bg-red-50 border border-red-200 rounded-xl p-4">
            <div className="flex items-center">
              <span className="text-red-500 text-xl mr-3">⚠️</span>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-4 px-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">📍</div>
                <div className="text-xs text-gray-600">Your Location</div>
                <div className="text-sm font-semibold text-blue-600">
                  {userLocation ? 'Active' : 'Not Found'}
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🚏</div>
                <div className="text-xs text-gray-600">Bus Stops</div>
                <div className="text-sm font-semibold text-green-600">{busStops.length}</div>
              </div>
              
              <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">🚌</div>
                <div className="text-xs text-gray-600">Active Buses</div>
                <div className="text-sm font-semibold text-red-600">{busPositions.length}</div>
              </div>
            </div>

            {/* Closest Stop Card */}
            {closestStop && userLocation && (
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="text-xl mr-2">🎯</span>
                      <h3 className="font-semibold text-gray-900">Closest Stop</h3>
                    </div>
                    <p className="text-sm font-medium text-gray-800 mb-2">{closestStop.name}</p>
                    <div className="flex items-center space-x-4 text-xs text-gray-600">
                      <span>📍 {formatDistance(calculateDistance(userLocation, {
                        lat: closestStop.coordinates.latitude,
                        lng: closestStop.coordinates.longitude
                      }))}</span>
                      <span>🕒 {Math.round(closestStop.eta)}min</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onStopSelect?.(closestStop)}
                    className="ml-3 px-3 py-1 bg-white rounded-full text-xs font-medium text-yellow-700 border border-yellow-300"
                  >
                    View
                  </button>
                </div>
              </div>
            )}

            {/* User Location Card */}
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <span className="text-xl mr-2">📍</span>
                  Your Location
                </h3>
                {onRefreshLocation && (
                  <button
                    onClick={onRefreshLocation}
                    className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium border border-blue-200 hover:bg-blue-100 transition-colors"
                  >
                    🔄 Refresh
                  </button>
                )}
              </div>
              
              {userLocation ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    <span className="font-mono">{userLocation.lat.toFixed(6)}, {userLocation.lng.toFixed(6)}</span>
                  </div>
                  {locationAccuracy && (
                    <div className="text-xs text-gray-500">
                      Accuracy: ±{Math.round(locationAccuracy)}m
                      {locationAccuracy > 100 && (
                        <span className="text-orange-600 ml-1">(Low accuracy)</span>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  <p>Location not available</p>
                  <p className="text-xs mt-1">Enable location access in your browser</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'stops' && (
          <BusStopsList
            stops={busStops}
            userLocation={userLocation}
            closestStop={closestStop}
            onStopSelect={onStopSelect}
          />
        )}

        {activeTab === 'buses' && (
          <div className="space-y-3 px-6">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="text-2xl mr-2">🚌</span>
              Active Buses ({busPositions.length})
            </h3>
            
            {busPositions.length > 0 ? (
              busPositions.map((bus, index) => (
                <div key={`${bus.trackerId}-${index}`} className="bg-white rounded-xl p-4 border border-gray-200">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-900">Bus #{bus.number}</h4>
                      <p className="text-sm text-gray-500">Tracker: {bus.trackerId}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{bus.speed} km/h</div>
                      <div className="text-xs text-gray-500">Speed</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-gray-500">Direction:</span>
                      <span className="ml-1 font-medium">{bus.direction}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Heading:</span>
                      <span className="ml-1 font-medium">{bus.bearing}°</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-500">Last Update:</span>
                      <span className="ml-1 font-medium">{new Date(bus.date).toLocaleTimeString()}</span>
                    </div>
                    {userLocation && (
                      <div className="col-span-2">
                        <span className="text-gray-500">Distance from you:</span>
                        <span className="ml-1 font-medium">
                          {formatDistance(calculateDistance(userLocation, {
                            lat: bus.coordinates.latitude,
                            lng: bus.coordinates.longitude
                          }))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🚌</div>
                <p>No active buses found</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileBottomSheet;
