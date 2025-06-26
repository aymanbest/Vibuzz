import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime } from '../utils';
import { 
  IconMapPin, 
  IconCurrentLocation,
  IconBus,
  IconList,
  IconMap,
  IconLocation,
  IconChevronLeft,
  IconClock,
  IconRefresh,
  IconGps
} from '@tabler/icons-react';
import type { BusLine, BusStop, BusPosition, UserLocation } from '../types';
import MapComponent from './MapComponent';
import BusStopsList from './BusStopsList';
import { calculateDistance, formatDistance } from '../utils';

interface BusTrackingViewProps {
  selectedLine: BusLine;
  busStops: BusStop[];
  busPositions: BusPosition[];
  routePath: Array<{ lat: number; lng: number }>;
  userLocation: UserLocation | null;
  closestStop: BusStop | null;
  isLoading: boolean;
  onLocateClick: () => void;
}

const BusTrackingView: React.FC<BusTrackingViewProps> = ({
  selectedLine,
  busStops,
  busPositions,
  routePath,
  userLocation,
  closestStop,
  isLoading,
  onLocateClick
}) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  // Default to map view for better UX
  const [view, setView] = useState<'stops' | 'map'>('map');
  // Track which stop is selected for highlighting on the map
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  
  // Handle resize events
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // Check for selected stop ID in session storage
  useEffect(() => {
    const selectedStopId = window.sessionStorage.getItem('selectedStopId');
    if (selectedStopId && busStops.length > 0) {
      const stop = busStops.find(stop => stop.id === selectedStopId);
      if (stop) {
        setSelectedStop(stop);
        // Clear the session storage so it doesn't persist unnecessarily
        window.sessionStorage.removeItem('selectedStopId');
      }
    }
  }, [busStops]);

  const handleStopSelect = (stop: BusStop) => {
    // Set the selected stop and switch to map view
    setSelectedStop(stop);
    setView('map');
  };

  const handleRefreshLocation = () => {
    onLocateClick();
  };

  // If no map view is needed, show a summary view with stops list and location button
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-default max-w-md mx-auto py-4">
          {/* Header with line info */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4
              ${selectedLine.direction === 'FORWARD' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-orange-100 text-orange-600'
              }`}
            >
              <span className="text-lg font-bold">{selectedLine.line}</span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-800 mb-1">
                {selectedLine.label}
              </h1>
              <div className="flex items-center text-sm text-gray-600">
                <span className={selectedLine.direction === 'FORWARD' ? 'text-green-600' : 'text-orange-600'}>
                  {selectedLine.direction === 'FORWARD' ? 'Outbound' : 'Return'}
                </span>
                <span className="mx-2">•</span>
                <span>{busStops.length} stops</span>
              </div>
            </div>
            
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <IconChevronLeft size={20} className="text-gray-600" />
            </button>
          </motion.div>
          
          {/* Bus stops list */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-sm mb-4 overflow-hidden"
          >
            <div className="border-b border-gray-100 p-4">
              <h2 className="font-medium text-gray-800 flex items-center">
                <IconMapPin size={18} className="mr-2 text-primary-500" />
                Bus Stops
              </h2>
            </div>
            
            <div className="max-h-[50vh] overflow-y-auto">
              <BusStopsList 
                stops={busStops}
                userLocation={null}
                closestStop={null}
                onStopSelect={handleStopSelect}
              />
            </div>
          </motion.div>
          
          {/* Enable Location Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm overflow-hidden"
          >
            <div className="p-4">
              <div className="flex items-center">
                <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center mr-4">
                  <IconCurrentLocation size={24} className="text-primary-600" />
                </div>
                
                <div className="flex-1">
                  <h2 className="font-medium text-gray-800 mb-1">
                    View Live Map
                  </h2>
                  <p className="text-sm text-gray-500 mb-3">
                    Enable location to see real-time buses and your position
                  </p>
                  
                  <button
                    onClick={onLocateClick}
                    className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
                  >
                    <IconLocation size={18} className="mr-2" />
                    Enable Location
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // Mobile layout with improved UX
  if (isMobile) {
    return (
      <div className="h-screen flex flex-col bg-gray-50">
        {/* Mobile header with improved contrast and spacing */}
        <div className="bg-white shadow-md z-10">
          <div className="flex items-center p-3">
            <button 
              onClick={() => window.history.back()}
              className="p-2 rounded-full hover:bg-gray-100 mr-2"
            >
              <IconChevronLeft size={20} className="text-gray-600" />
            </button>
            
            <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3
              ${selectedLine.direction === 'FORWARD' 
                ? 'bg-green-100 text-green-600' 
                : 'bg-orange-100 text-orange-600'
              }`}
            >
              <span className="font-bold">{selectedLine.line}</span>
            </div>
            
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-bold text-gray-900 truncate">
                {selectedLine.label}
              </h1>
              <div className="flex items-center text-xs text-gray-500">
                <span className={selectedLine.direction === 'FORWARD' ? 'text-green-600' : 'text-orange-600'}>
                  {selectedLine.direction === 'FORWARD' ? 'Outbound' : 'Return'}
                </span>
                <span className="mx-1">•</span>
                <span>{busStops.length} stops</span>
                {isLoading && <span className="ml-1">• Loading...</span>}
              </div>
            </div>
            
            <button
              onClick={handleRefreshLocation}
              className="p-2 rounded-full hover:bg-gray-100 text-primary-600"
              disabled={isLoading}
            >
              <IconCurrentLocation size={20} className={`${isLoading ? 'text-gray-400' : 'text-primary-600'}`} />
            </button>
          </div>
          
          {/* Improved tab bar with better visual feedback */}
          <div className="flex border-t border-gray-100 px-2 py-1">
            <button 
              onClick={() => setView('stops')}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center rounded-md
                ${view === 'stops' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <IconList size={18} className="mr-1.5" />
              Stops
            </button>
            <button 
              onClick={() => setView('map')}
              className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center rounded-md ml-1
                ${view === 'map' 
                  ? 'bg-primary-50 text-primary-700' 
                  : 'text-gray-600 hover:bg-gray-50'}
              `}
            >
              <IconMap size={18} className="mr-1.5" />
              Map
            </button>
          </div>
        </div>
        
        {/* Content container with improved transitions */}
        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {view === 'stops' ? (
              <motion.div 
                key="stops"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-y-auto pb-safe"
              >
                <div className="p-4">
                  {/* Improved stats cards with better spacing and visual design */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center mr-3">
                          <IconBus size={18} className="text-blue-600" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{busPositions.length}</div>
                          <div className="text-xs text-gray-500">Active Buses</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                      <div className="flex items-center mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                          <IconMapPin size={18} className="text-green-600" />
                        </div>
                        <div>
                          <div className="text-lg font-bold">{busStops.length}</div>
                          <div className="text-xs text-gray-500">Stops</div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Bus stops list with improved design */}
                  <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100">
                    <div className="border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                      <h2 className="font-medium text-gray-900">Bus Stops</h2>
                      {userLocation && (
                        <span className="text-xs text-primary-600">Sorted by route</span>
                      )}
                    </div>
                    
                    <BusStopsList 
                      stops={busStops}
                      userLocation={userLocation}
                      closestStop={closestStop}
                      onStopSelect={(stop) => {
                        setView('map');
                        handleStopSelect(stop);
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="map"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute inset-0"
              >
                <MapComponent
                  busStops={busStops}
                  busPositions={busPositions}
                  routePath={routePath}
                  userLocation={userLocation}
                  closestStop={closestStop}
                  selectedLine={selectedLine}
                  selectedStop={selectedStop}
                  onStopSelect={handleStopSelect}
                />
                
                {/* Automatic Bus Info Panel - Always visible */}
                <div className="absolute top-4 left-4 right-4">
                  <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        <IconBus size={16} className="mr-2 text-primary-600" />
                        Live Bus Tracking
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                          {busPositions.length} active
                        </span>
                        <button
                          onClick={handleRefreshLocation}
                          className="p-1 rounded-full hover:bg-gray-100"
                          disabled={isLoading}
                        >
                          <IconRefresh size={14} className={`${isLoading ? 'animate-spin text-gray-400' : 'text-primary-600'}`} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Bus positions info */}
                    {busPositions.length > 0 && (
                      <div className="space-y-2">
                        {busPositions.slice(0, 2).map((bus, index) => (
                          <div key={`${bus.trackerId}-${index}`} className="flex items-center justify-between bg-blue-50 rounded-md p-2">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mr-2">
                                <span className="text-white text-xs font-bold">{bus.number}</span>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-800">Bus #{bus.number}</div>
                                <div className="text-xs text-gray-500">{bus.speed} km/h • {bus.bearing}°</div>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500">
                              {new Date(bus.date).toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                        {busPositions.length > 2 && (
                          <div className="text-xs text-center text-gray-500">
                            +{busPositions.length - 2} more buses available
                          </div>
                        )}
                      </div>
                    )}
                    
                    {busPositions.length === 0 && (
                      <div className="text-center py-2">
                        <div className="text-sm text-gray-500">No active buses found</div>
                        <div className="text-xs text-gray-400">Refresh to check for updates</div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Floating quick info panel */}
                <div className="absolute bottom-20 left-4 right-4">
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">Quick Info</h3>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">{busStops.length} stops</span>
                    </div>
                    
                    {closestStop && (
                      <div className="flex items-center mb-2">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-2">
                          <IconMapPin size={16} className="text-yellow-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-800">{closestStop.name}</div>
                          <div className="text-xs text-gray-500">
                            {userLocation && formatDistance(calculateDistance(userLocation, {
                              lat: closestStop.coordinates.latitude,
                              lng: closestStop.coordinates.longitude
                            }))} away
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => setView('stops')}
                      className="w-full py-2 bg-primary-600 text-white rounded-md text-sm font-medium"
                    >
                      View All Stops
                    </button>
                  </div>
                </div>
                
                {/* Enhanced Floating action buttons */}
                <div className="absolute bottom-6 right-4 flex flex-col space-y-2">
                  <button 
                    onClick={handleRefreshLocation} 
                    className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center border border-gray-200 hover:bg-gray-50"
                    disabled={isLoading}
                  >
                    <IconGps size={20} className={`${isLoading ? 'text-gray-400' : 'text-blue-600'}`} />
                  </button>
                  <button 
                    onClick={handleRefreshLocation} 
                    className="w-12 h-12 rounded-full bg-primary-600 shadow-lg flex items-center justify-center border border-primary-700 hover:bg-primary-700"
                    disabled={isLoading}
                  >
                    <IconRefresh size={20} className={`text-white ${isLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Full tracking view with map and improved layout
  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Mobile header with tab switcher */}
      <div className="bg-white shadow-sm z-10">
        <div className="flex items-center p-3">
          <button 
            onClick={() => window.history.back()}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
          >
            <IconChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3
            ${selectedLine.direction === 'FORWARD' 
              ? 'bg-green-100 text-green-600' 
              : 'bg-orange-100 text-orange-600'
            }`}
          >
            <span className="font-bold">{selectedLine.line}</span>
          </div>
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold text-gray-900 truncate">
              {selectedLine.label}
            </h1>
            <div className="flex items-center text-xs text-gray-500">
              <span className={selectedLine.direction === 'FORWARD' ? 'text-green-600' : 'text-orange-600'}>
                {selectedLine.direction === 'FORWARD' ? 'Outbound' : 'Return'}
              </span>
              <span className="mx-1">•</span>
              <span>{busStops.length} stops</span>
              {isLoading && <span className="ml-1">• Loading...</span>}
            </div>
          </div>
          
          <button
            onClick={handleRefreshLocation}
            className="p-2 rounded-full hover:bg-gray-100 text-primary-600"
            disabled={isLoading}
          >
            <IconCurrentLocation size={20} className={`${isLoading ? 'text-gray-400' : 'text-primary-600'}`} />
          </button>
        </div>
        
        {/* Tab switcher */}
        <div className="flex border-t border-gray-100">
          <button 
            onClick={() => setView('stops')}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center
              ${view === 'stops' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'}
            `}
          >
            <IconList size={16} className="mr-1.5" />
            Stops
          </button>
          <button 
            onClick={() => setView('map')}
            className={`flex-1 py-2.5 text-sm font-medium flex items-center justify-center
              ${view === 'map' 
                ? 'text-primary-600 border-b-2 border-primary-600' 
                : 'text-gray-600'}
            `}
          >
            <IconMap size={16} className="mr-1.5" />
            Map
          </button>
        </div>
      </div>
      
      {/* Content container */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'stops' ? (
            <motion.div 
              key="stops"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full overflow-y-auto pb-safe"
            >
              <div className="p-4">
                {/* Stats cards */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                        <IconBus size={16} className="text-blue-500" />
                      </div>
                      <span className="text-xs text-blue-500 font-medium">Active</span>
                    </div>
                    <div className="text-lg font-bold">{busPositions.length}</div>
                    <div className="text-xs text-gray-500">Buses</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                        <IconClock size={16} className="text-orange-500" />
                      </div>
                      <span className="text-xs text-orange-500 font-medium">ETA</span>
                    </div>
                    <div className="text-lg font-bold">{closestStop?.eta !== undefined ? formatTime(closestStop.eta) : '--'}</div>
                    <div className="text-xs text-gray-500">Minutes</div>
                  </div>
                  
                  <div className="bg-white rounded-lg shadow-sm p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                        <IconMapPin size={16} className="text-green-500" />
                      </div>
                      <span className="text-xs text-green-500 font-medium">Total</span>
                    </div>
                    <div className="text-lg font-bold">{busStops.length}</div>
                    <div className="text-xs text-gray-500">Stops</div>
                  </div>
                </div>
                
                {/* Closest stop card if available */}
                {closestStop && (
                  <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border border-yellow-200">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-800 flex items-center">
                        <IconLocation size={18} className="mr-2 text-yellow-500" />
                        Closest Stop
                      </h3>
                      <span className="text-sm font-medium text-yellow-500">
                        {formatTime(closestStop.eta)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-700 mb-2">{closestStop.name}</p>
                    
                    <button 
                      onClick={() => {
                        setView('map');
                        handleStopSelect(closestStop);
                      }}
                      className="w-full py-2 bg-yellow-100 text-yellow-700 rounded flex items-center justify-center text-sm font-medium"
                    >
                      <IconMap size={16} className="mr-1.5" />
                      View on map
                    </button>
                  </div>
                )}
                
                {/* Bus stops list */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <BusStopsList 
                    stops={busStops}
                    userLocation={userLocation}
                    closestStop={closestStop}
                    onStopSelect={(stop) => {
                      setView('map');
                      handleStopSelect(stop);
                    }}
                    listType="modern"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="map"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full relative"
            >
              <MapComponent
                busStops={busStops}
                busPositions={busPositions}
                routePath={routePath}
                userLocation={userLocation}
                closestStop={closestStop}
                selectedLine={selectedLine}
                selectedStop={selectedStop}
                onStopSelect={handleStopSelect}
              />
              
              {/* Floating action buttons */}
              <div className="absolute bottom-6 right-4 flex flex-col space-y-2">
                <button 
                  onClick={handleRefreshLocation} 
                  className="w-12 h-12 rounded-full bg-white shadow-lg flex items-center justify-center"
                >
                  <IconCurrentLocation size={24} className="text-primary-600" />
                </button>
              </div>
              
              {/* Mini bus stats */}
              <div className="absolute top-4 left-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-2">
                      <IconBus size={16} className="text-blue-600" />
                    </div>
                    <div>
                      <div className="text-xs text-gray-600">Active Buses</div>
                      <div className="font-bold">{busPositions.length}</div>
                    </div>
                  </div>
                  
                  {closestStop && (
                    <div className="flex items-center">
                      <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-2">
                        <IconClock size={16} className="text-yellow-600" />
                      </div>
                      <div>
                        <div className="text-xs text-gray-600">Closest ETA</div>
                        <div className="font-bold">{formatTime(closestStop.eta)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default BusTrackingView;
