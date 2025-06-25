import React from 'react';
import type { BusStop, UserLocation } from '../types';
import { calculateDistance, formatDistance } from '../utils';

interface BusStopsListProps {
  stops: BusStop[];
  userLocation: UserLocation | null;
  closestStop: BusStop | null;
  onStopSelect?: (stop: BusStop) => void;
}

const BusStopsList: React.FC<BusStopsListProps> = ({
  stops,
  userLocation,
  closestStop,
  onStopSelect,
}) => {
  if (stops.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        <div className="text-4xl mb-2">🚏</div>
        <p>No bus stops available</p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
        <span className="text-2xl mr-2">🚏</span>
        Bus Stops ({stops.length})
      </h3>
      
      <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
        {stops.map((stop, index) => {
          const isClosest = closestStop?.id === stop.id;
          const distance = userLocation 
            ? calculateDistance(userLocation, {
                lat: stop.coordinates.latitude,
                lng: stop.coordinates.longitude
              })
            : null;

          return (
            <div
              key={stop.id}
              onClick={() => onStopSelect?.(stop)}
              className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                isClosest
                  ? 'border-yellow-400 bg-yellow-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="text-sm font-medium text-gray-500 mr-2">
                      #{index + 1}
                    </span>
                    {isClosest && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mr-2">
                        🎯 Closest
                      </span>
                    )}
                  </div>
                  
                  <h4 className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                    {stop.name}
                  </h4>
                  
                  <div className="flex items-center space-x-3 text-xs text-gray-500">
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mr-1"></span>
                      ETA: {Math.round(stop.eta)}min
                    </span>
                    <span className="flex items-center">
                      <span className="w-2 h-2 bg-green-400 rounded-full mr-1"></span>
                      Travel: {Math.round(stop.travelTimeTo)}min
                    </span>
                    {distance && (
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-purple-400 rounded-full mr-1"></span>
                        {formatDistance(distance)}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end ml-2">
                  <div className="text-right">
                    <div className="text-xs text-gray-400">
                      {stop.coordinates.latitude.toFixed(4)}°
                    </div>
                    <div className="text-xs text-gray-400">
                      {stop.coordinates.longitude.toFixed(4)}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BusStopsList;
