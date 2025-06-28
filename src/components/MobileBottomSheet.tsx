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
  IconCircleDot
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';
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
  const { isDark } = useTheme();
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
      className={`fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-2xl z-[999] transition-all duration-300 ${
        isDark ? 'bg-gray-900 border-t border-gray-700' : 'bg-white border-t border-gray-200'
      } ${isExpanded ? 'h-[85vh]' : 'h-auto max-h-[35vh]'}`}
      style={{ 
        borderTopLeftRadius: '24px', 
        borderTopRightRadius: '24px',
        boxShadow: isDark 
          ? '0 -8px 32px rgba(0,0,0,0.5)' 
          : '0 -8px 32px rgba(0,0,0,0.15)'
      }}
    >
      {/* Handle with improved grip indicator */}
      <div 
        className="px-6 pt-4 pb-3 flex flex-col items-center justify-center cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        onTouchStart={handleDragStart}
      >
        <div className={`w-12 h-1.5 rounded-full mb-4 ${
          isDark ? 'bg-gray-600' : 'bg-gray-300'
        }`}></div>
        
        <div className="w-full flex items-center justify-between">
          {selectedLine && (
            <div className="flex items-center">
              <div className={`
                w-12 h-12 flex items-center justify-center rounded-2xl text-white font-bold shadow-lg
                ${selectedLine.direction === 'FORWARD' 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-orange-500 to-orange-600'}
              `}>
                {selectedLine.line}
              </div>
              
              <div className="ml-4">
                <h2 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {selectedLine?.label || 'Vibuzz'}
                </h2>
                <div className={`text-sm flex items-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedLine?.direction === 'FORWARD' 
                      ? isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                      : isDark ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {selectedLine?.direction === 'FORWARD' ? 'Outbound' : 'Return'}
                  </span>
                  <span className="mx-2">•</span>
                  <span>{busStops.length} stops</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            {loading && (
              <div className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                isDark ? 'border-blue-400' : 'border-blue-600'
              }`}></div>
            )}
            <IconChevronUp
              size={24}
              className={`transition-transform duration-300 ${
                isExpanded ? 'rotate-180' : ''
              } ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
            />
          </div>
        </div>
      </div>

      {/* Tab Navigation - only show when expanded */}
      {isExpanded && (
        <div className={`px-6 py-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className={`flex rounded-2xl p-2 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
            {[
              { id: 'overview', label: 'Overview', icon: <IconAdjustmentsHorizontal size={20} /> },
              { id: 'stops', label: 'Stops', icon: <IconMapPin size={20} /> },
              { id: 'buses', label: 'Buses', icon: <IconBus size={20} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === tab.id
                    ? isDark 
                      ? 'bg-gray-700 text-blue-400 shadow-lg transform scale-105'
                      : 'bg-white text-blue-700 shadow-lg transform scale-105'
                    : isDark
                      ? 'text-gray-400 hover:bg-gray-700/50 hover:text-gray-200'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                  }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className={`${isExpanded ? 'overflow-y-auto' : 'overflow-hidden'}`} 
        style={{ 
          maxHeight: isExpanded ? 'calc(85vh - 200px)' : '120px',
          scrollbarWidth: 'thin'
        }}
      >
        {error && (
          <div className={`m-4 p-3 rounded-lg text-sm border ${
            isDark 
              ? 'bg-red-900/30 border-red-700 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {error}
          </div>
        )}
        
        {/* Compact Summary for Collapsed State */}
        {!isExpanded && (
          <div className="p-4">
            <div className="grid grid-cols-3 gap-3">
              <div className={`rounded-xl p-3 text-center border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>{busStops.length}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stops</div>
              </div>
              
              <div className={`rounded-xl p-3 text-center border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>{busPositions.length}</div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Buses</div>
              </div>
              
              <div className={`rounded-xl p-3 text-center border ${
                isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
              }`}>
                <div className={`text-lg font-bold ${
                  isDark ? 'text-blue-400' : 'text-blue-700'
                }`}>
                  {closestStop ? formatTime(closestStop.eta) : '-'}
                </div>
                <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ETA</div>
              </div>
            </div>
          </div>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="p-6 space-y-6"
              >
                {/* User Location */}
                <div className={`rounded-2xl p-5 border ${
                  isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isDark ? 'bg-blue-900/50 text-blue-400' : 'bg-blue-100 text-blue-600'
                      }`}>
                        <IconCurrentLocation size={20} />
                      </div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Your Location</h3>
                    </div>
                    
                    {onRefreshLocation && (
                      <button
                        onClick={onRefreshLocation}
                        className={`text-sm px-4 py-2 rounded-xl font-medium transition-colors ${
                          isDark 
                            ? 'bg-blue-900/50 text-blue-400 hover:bg-blue-800/50' 
                            : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                        }`}
                      >
                        Refresh
                      </button>
                    )}
                  </div>
                  
                  {userLocation ? (
                    <div className={`text-base ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="font-medium">Location active</span>
                      </div>
                      {locationAccuracy && (
                        <div className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Accuracy: ±{Math.round(locationAccuracy)}m
                          {locationAccuracy <= 50 && (
                            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isDark ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-700'
                            }`}>
                              High precision
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>Location not available</span>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Closest Stop */}
                {closestStop && userLocation && (
                  <div className={`rounded-2xl p-5 border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                        isDark ? 'bg-yellow-900/50 text-yellow-400' : 'bg-yellow-100 text-yellow-600'
                      }`}>
                        <IconMapPin size={20} />
                      </div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Closest Stop</h3>
                    </div>
                    
                    <div className="mb-4">
                      <div className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>{closestStop.name}</div>
                      <div className={`text-base mt-2 flex items-center space-x-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        <span>
                          {formatDistance(calculateDistance(userLocation, {
                            lat: closestStop.coordinates.latitude,
                            lng: closestStop.coordinates.longitude
                          }))} away
                        </span>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          isDark ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {formatTime(closestStop.eta)} ETA
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => onStopSelect?.(closestStop)}
                      className={`w-full mt-2 py-3 text-base font-medium rounded-xl border transition-colors ${
                        isDark 
                          ? 'bg-yellow-900/50 text-yellow-300 border-yellow-700 hover:bg-yellow-800/50' 
                          : 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100'
                      }`}
                    >
                      View on Map
                    </button>
                  </div>
                )}
                
                {/* Route Info */}
                {selectedLine && selectedLine.firstStop && selectedLine.lastStop && (
                  <div className={`rounded-lg p-4 border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className="flex items-center space-x-2 mb-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        isDark ? 'bg-green-900/50 text-green-400' : 'bg-green-100 text-green-600'
                      }`}>
                        <IconRoute size={16} />
                      </div>
                      <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Route Details</h3>
                    </div>
                    
                    <div className="flex">
                      <div className="flex flex-col items-center mr-3">
                        <IconCircleDotFilled size={16} className="text-green-500" />
                        <div className={`w-0.5 h-12 ${isDark ? 'bg-gray-600' : 'bg-gray-200'}`}></div>
                        <IconCircleDot size={16} className="text-red-500" />
                      </div>
                      
                      <div className="flex-1">
                        <div>
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedLine.firstStop.name}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Starting point</div>
                        </div>
                        
                        <div className="mt-4">
                          <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{selectedLine.lastStop.name}</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Final destination</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className={`rounded-lg p-3 text-center border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`text-lg font-bold ${
                      isDark ? 'text-purple-400' : 'text-primary-700'
                    }`}>{busStops.length}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Stops</div>
                  </div>
                  
                  <div className={`rounded-lg p-3 text-center border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`text-lg font-bold ${
                      isDark ? 'text-purple-400' : 'text-primary-700'
                    }`}>{busPositions.length}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Buses</div>
                  </div>
                  
                  <div className={`rounded-lg p-3 text-center border ${
                    isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                  }`}>
                    <div className={`text-lg font-bold ${
                      isDark ? 'text-purple-400' : 'text-primary-700'
                    }`}>
                      {closestStop ? formatTime(closestStop.eta) : '-'}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>ETA</div>
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
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Active Buses</h3>
                  <div className={`text-sm ${isDark ? 'text-purple-400' : 'text-primary-600'}`}>{busPositions.length} buses</div>
                </div>
                
                {busPositions.length > 0 ? (
                  busPositions.map((bus, index) => (
                    <div key={`${bus.trackerId}-${index}`} className={`rounded-lg p-4 border ${
                      isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex space-x-3 items-center">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            isDark ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-600'
                          }`}>
                            <IconBus size={20} />
                          </div>
                          <div>
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>Bus #{bus.number || index + 1}</h4>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{bus.trackerId}</div>
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{bus.speed} km/h</div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Speed</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div className="flex items-center">
                          <span className={`text-xs mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Direction:</span>
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{bus.direction || 'N/A'}</span>
                        </div>
                        
                        <div className="flex items-center">
                          <span className={`text-xs mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Bearing:</span>
                          <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{bus.bearing}°</span>
                        </div>
                        
                        {userLocation && (
                          <div className="col-span-2 flex items-center">
                            <span className={`text-xs mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Distance:</span>
                            <span className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                    <div className={`w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-gray-800' : 'bg-gray-100'
                    }`}>
                      <IconBus size={24} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                    </div>
                    <h4 className={`font-medium ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>No Active Buses</h4>
                    <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Check back later</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};

export default MobileBottomSheet;
