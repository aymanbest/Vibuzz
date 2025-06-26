import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMapPin, 
  IconCurrentLocation,
  IconBus, 
  IconRoute,
  IconAdjustmentsHorizontal,
  IconChevronUp,
  IconCircleDotFilled,
  IconCircleDot,
  IconArrowNarrowRight,
  IconArrowBarToDown
} from '@tabler/icons-react';
import type { BusStop, BusPosition, UserLocation, BusLine } from '../types';
import { calculateDistance, formatDistance, formatTime } from '../utils';
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
    <motion.div
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl z-[1000] transition-all duration-300
        ${isExpanded ? 'h-[80vh]' : 'h-auto max-h-[50vh]'}`}
      style={{ 
        borderTopLeftRadius: '16px', 
        borderTopRightRadius: '16px',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.1)'
      }}
    >
      {/* Handle with improved grip indicator */}
      <div 
        className="px-4 pt-3 pb-2 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onTouchStart={handleDragStart}
      >
        <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-3"></div>
        
        <div className="w-full flex items-center justify-between">
          {selectedLine && (
            <div className="flex items-center">
              <div className={`
                w-10 h-10 flex items-center justify-center rounded-lg text-white font-bold
                ${selectedLine.direction === 'FORWARD' ? 'bg-green-500' : 'bg-orange-500'}
              `}>
                {selectedLine.line}
              </div>
              
              <div className="ml-3">
                <h2 className="font-semibold text-gray-900">
                  {selectedLine?.label || 'Bus Tracker'}
                </h2>
                <p className="text-xs text-gray-500 flex items-center">
                  <span className={selectedLine?.direction === 'FORWARD' ? 'text-green-600' : 'text-orange-600'}>
                    {selectedLine?.direction === 'FORWARD' ? 'Outbound' : 'Return'}
                  </span>
                  <span className="mx-1">•</span>
                  <span>{busStops.length} stops</span>
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {loading && (
              <div className="w-5 h-5 border-2 border-t-transparent border-primary-600 rounded-full animate-spin"></div>
            )}
            <IconChevronUp
              size={20}
              className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation with improved interactions */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex bg-gray-100 rounded-xl p-1.5">
          {[
            { id: 'overview', label: 'Overview', icon: <IconAdjustmentsHorizontal size={18} /> },
            { id: 'stops', label: 'Stops', icon: <IconMapPin size={18} /> },
            { id: 'buses', label: 'Buses', icon: <IconBus size={18} /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-1.5 py-2 px-1 rounded-lg text-sm transition-all duration-200
                ${activeTab === tab.id
                  ? 'bg-white text-primary-700 shadow-sm font-medium'
                  : 'text-gray-600 hover:bg-gray-200/50'
                }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Area with improved scrolling */}
      <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
        style={{ 
          maxHeight: isExpanded ? 'calc(80vh - 130px)' : 'calc(50vh - 130px)',
          scrollbarWidth: 'thin'
        }}
      >
        <AnimatePresence mode="wait">
          {error && (
            <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
              {error}
            </div>
          )}
          
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-4"
            >
              {/* User Location */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                      <IconCurrentLocation size={16} className="text-primary-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Your Location</h3>
                  </div>
                  
                  {onRefreshLocation && (
                    <button
                      onClick={onRefreshLocation}
                      className="text-xs px-2 py-1 rounded bg-primary-50 text-primary-700"
                    >
                      Refresh
                    </button>
                  )}
                </div>
                
                {userLocation ? (
                  <div className="text-sm text-gray-600">
                    Location active
                    {locationAccuracy && (
                      <div className="text-xs text-gray-500 mt-1">
                        Accuracy: ±{Math.round(locationAccuracy)}m
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">
                    Location not available
                  </div>
                )}
              </div>
              
              {/* Closest Stop */}
              {closestStop && userLocation && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                      <IconMapPin size={16} className="text-yellow-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Closest Stop</h3>
                  </div>
                  
                  <div className="mb-2">
                    <div className="font-medium text-gray-900">{closestStop.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {formatDistance(calculateDistance(userLocation, {
                        lat: closestStop.coordinates.latitude,
                        lng: closestStop.coordinates.longitude
                      }))} away
                    </div>
                  </div>
                  
                  <button
                    onClick={() => onStopSelect?.(closestStop)}
                    className="w-full mt-2 py-1.5 text-sm bg-yellow-50 text-yellow-700 rounded-md border border-yellow-200"
                  >
                    View on Map
                  </button>
                </div>
              )}
              
              {/* Route Info */}
              {selectedLine && selectedLine.firstStop && selectedLine.lastStop && (
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <IconRoute size={16} className="text-green-600" />
                    </div>
                    <h3 className="font-medium text-gray-900">Route Details</h3>
                  </div>
                  
                  <div className="flex">
                    <div className="flex flex-col items-center mr-3">
                      <IconCircleDotFilled size={16} className="text-green-500" />
                      <div className="w-0.5 h-12 bg-gray-200"></div>
                      <IconCircleDot size={16} className="text-red-500" />
                    </div>
                    
                    <div className="flex-1">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{selectedLine.firstStop.name}</div>
                        <div className="text-xs text-gray-500">Starting point</div>
                      </div>
                      
                      <div className="mt-4">
                        <div className="text-sm font-medium text-gray-900">{selectedLine.lastStop.name}</div>
                        <div className="text-xs text-gray-500">Final destination</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary-700">{busStops.length}</div>
                  <div className="text-xs text-gray-600">Stops</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary-700">{busPositions.length}</div>
                  <div className="text-xs text-gray-600">Buses</div>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                  <div className="text-lg font-bold text-primary-700">
                    {closestStop ? formatTime(closestStop.eta) : '-'}
                  </div>
                  <div className="text-xs text-gray-600">ETA</div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'stops' && (
            <motion.div
              key="stops"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <BusStopsList
                stops={busStops}
                userLocation={userLocation}
                closestStop={closestStop}
                onStopSelect={onStopSelect}
              />
            </motion.div>
          )}
          
          {activeTab === 'buses' && (
            <motion.div
              key="buses"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 space-y-4"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">Active Buses</h3>
                <div className="text-sm text-primary-600">{busPositions.length} buses</div>
              </div>
              
              {busPositions.length > 0 ? (
                busPositions.map((bus, index) => (
                  <div key={`${bus.trackerId}-${index}`} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex space-x-3 items-center">
                        <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center text-red-600">
                          <IconBus size={20} />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">Bus #{bus.number || index + 1}</h4>
                          <div className="text-xs text-gray-500">{bus.trackerId}</div>
                        </div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm font-bold text-gray-900">{bus.speed} km/h</div>
                        <div className="text-xs text-gray-500">Speed</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <span className="text-gray-500 text-xs mr-1">Direction:</span>
                        <span className="font-medium text-gray-700">{bus.direction || 'N/A'}</span>
                      </div>
                      
                      <div className="flex items-center">
                        <span className="text-gray-500 text-xs mr-1">Bearing:</span>
                        <span className="font-medium text-gray-700">{bus.bearing}°</span>
                      </div>
                      
                      {userLocation && (
                        <div className="col-span-2 flex items-center">
                          <span className="text-gray-500 text-xs mr-1">Distance:</span>
                          <span className="font-medium text-gray-700">
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
                <div className="py-8 text-center">
                  <div className="w-12 h-12 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
                    <IconBus size={24} className="text-gray-400" />
                  </div>
                  <h4 className="text-gray-600 font-medium">No Active Buses</h4>
                  <p className="text-gray-500 text-sm mt-1">Check back later</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MobileBottomSheet;
