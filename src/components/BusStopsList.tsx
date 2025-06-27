import React from 'react';
import { motion } from 'framer-motion';
import { IconMapPin, IconRoute, IconClockHour3, IconArrowNarrowRight } from '@tabler/icons-react';
import type { BusStop, UserLocation } from '../types';
import { calculateDistance, formatDistance, formatTime } from '../utils';

interface BusStopsListProps {
  stops: BusStop[];
  userLocation: UserLocation | null;
  closestStop: BusStop | null;
  onStopSelect?: (stop: BusStop) => void;
  listType?: 'compact' | 'detailed' | 'modern';
}

const BusStopsList: React.FC<BusStopsListProps> = ({
  stops,
  userLocation,
  closestStop,
  onStopSelect,
  listType = 'detailed',
}) => {
  if (stops.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <IconMapPin size={24} className="text-gray-400 dark:text-gray-500" />
        </div>
        <p className="font-medium text-gray-600 dark:text-gray-300">No bus stops found</p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Try a different search term</p>
      </div>
    );
  }

  if (listType === 'compact') {
    return (
      <div className="p-2">
        <div className="grid grid-cols-1 gap-2">
          {stops.map((stop, index) => {
            const isClosest = closestStop?.id === stop.id;
            
            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
                onClick={() => onStopSelect?.(stop)}
                className={`
                  p-3 rounded-lg cursor-pointer flex items-center transition-all
                  ${isClosest 
                    ? 'bg-yellow-50 dark:bg-yellow-900/30 border-l-4 border-yellow-400 shadow-sm' 
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-l-4 hover:border-l-primary-400'}
                `}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center mr-3 text-xs text-gray-600 dark:text-gray-300 font-medium">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{stop.name}</p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>{formatTime(stop.eta)}</span>
                    {isClosest && <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300">Closest</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  // Modern list view that's more visually appealing
  if (listType === 'modern') {
    return (
      <div className="h-full">
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 sticky top-0 z-10">
          {stops.length > 0 && (
            <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
              <span>All stops ({stops.length})</span>
              {userLocation && <span>Distance</span>}
            </div>
          )}
        </div>
        
        <div className="pb-4">
          {stops.map((stop, index) => {
            const isClosest = closestStop?.id === stop.id;
            const distance = userLocation 
              ? calculateDistance(userLocation, {
                  lat: stop.coordinates.latitude,
                  lng: stop.coordinates.longitude
                })
              : null;
              
            return (
              <motion.div
                key={stop.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                onClick={() => onStopSelect?.(stop)}
                className={`mx-4 mb-3 p-4 rounded-xl cursor-pointer transition-all duration-200 border-2 ${
                  isClosest
                    ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 shadow-md hover:shadow-lg'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:shadow-md'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1 min-w-0">
                    <div className={`
                      w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 mr-3 shadow-sm
                      ${isClosest ? 'bg-yellow-500 text-white' : 
                        index === 0 ? 'bg-green-500 text-white' : 
                        index === stops.length - 1 ? 'bg-red-500 text-white' : 
                        'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}
                    `}>
                      {isClosest ? (
                        <IconMapPin size={18} />
                      ) : index === 0 ? (
                        <IconRoute size={18} />
                      ) : index === stops.length - 1 ? (
                        <IconRoute size={18} />
                      ) : (
                        <span className="text-sm font-bold">{index + 1}</span>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-gray-900 dark:text-gray-100 truncate mb-1">{stop.name}</p>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                        <IconClockHour3 size={14} className="mr-1 flex-shrink-0" />
                        <span>ETA: {formatTime(stop.eta)}</span>
                        {isClosest && (
                          <span className="ml-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/50 text-yellow-800 dark:text-yellow-300 rounded-full text-xs font-medium">
                            Closest
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end ml-3">
                    {distance !== null && (
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                        {formatDistance(distance)}
                      </span>
                    )}
                    <div className="flex items-center text-blue-600 dark:text-blue-400">
                      <span className="text-xs font-medium">View</span>
                      <IconArrowNarrowRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-4">
      <div className="space-y-3 overflow-y-auto">
        {stops.map((stop, index) => {
          const isClosest = closestStop?.id === stop.id;
          const distance = userLocation 
            ? calculateDistance(userLocation, {
                lat: stop.coordinates.latitude,
                lng: stop.coordinates.longitude
              })
            : null;

          return (
            <motion.div
              key={stop.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.02 }}
              onClick={() => onStopSelect?.(stop)}
              className={`
                p-3 rounded-lg border transition-all cursor-pointer
                ${isClosest
                  ? 'border-yellow-300 bg-yellow-50 shadow-sm'
                  : 'border-gray-100 bg-white hover:border-primary-200 hover:bg-primary-50 hover:shadow-sm'}
              `}
            >
              <div className="flex items-start">
                <div className="flex flex-col items-center mr-3">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1
                    ${isClosest ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {index + 1}
                  </div>
                  {isClosest && (
                    <span className="text-xs font-medium text-yellow-600">Closest</span>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 mb-1 leading-tight">
                    {stop.name}
                  </h4>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-blue-50 text-blue-700 rounded py-1 px-2 flex items-center justify-center">
                      <span className="font-medium">ETA:</span>&nbsp;
                      <span>{formatTime(stop.eta)}</span>
                    </div>
                    
                    <div className="bg-green-50 text-green-700 rounded py-1 px-2 flex items-center justify-center">
                      <span className="font-medium">Travel:</span>&nbsp;
                      <span>{formatTime(stop.travelTimeTo)}</span>
                    </div>
                    
                    {distance && (
                      <div className="bg-purple-50 text-purple-700 rounded py-1 px-2 flex items-center justify-center">
                        <span className="font-medium">Dist:</span>&nbsp;
                        <span>{formatDistance(distance)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col items-end ml-2">
                  <div className="mb-auto text-xs font-medium px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                    #{stop.id.slice(0, 4)}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default BusStopsList;
