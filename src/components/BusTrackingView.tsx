import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, calculateDistance, formatDistance } from '../utils';
import { 
  IconBus,
  IconList,
  IconChevronLeft,
  IconChevronRight,
  IconRefresh,
  IconRoute,
  IconTarget,
  IconNavigation,
  IconEye,
  IconSearch,
  IconBookmark,
  IconArrowsLeftRight,
  IconChevronDown
} from '@tabler/icons-react';
import type { BusLine, BusStop, BusPosition, UserLocation } from '../types';
import MapComponent from './MapComponent';
import BusStopsList from './BusStopsList';
import ThemeToggle from './ThemeToggle';
import LocationTips from './LocationTips';
import { useTheme } from '../contexts/ThemeContext';
import { useBusLines } from '../hooks/useApi';

interface BusTrackingViewProps {
  selectedLine: BusLine;
  busStops: BusStop[];
  busPositions: BusPosition[];
  routePath: Array<{ lat: number; lng: number }>;
  userLocation: UserLocation | null;
  locationAccuracy?: number | null;
  retryCount?: number;
  maxRetries?: number;
  canSelectManually?: boolean;
  onManualLocationSelect?: (lat: number, lng: number) => void;
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
  locationAccuracy,
  canSelectManually,
  onManualLocationSelect,
  closestStop,
  isLoading,
  onLocateClick
}) => {
  const navigate = useNavigate();
  const params = useParams();
  const { isDark } = useTheme();
  const [showStopsList, setShowStopsList] = useState(false);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [highlightedBus, setHighlightedBus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLineSelector, setShowLineSelector] = useState(false);
  
  // Fetch available bus lines for line switching
  const { data: busLines } = useBusLines('KENITRA');
  
  // Direction switching handler
  const handleDirectionSwitch = () => {
    const currentDirection = selectedLine.direction;
    const newDirection = currentDirection === 'FORWARD' ? 'backward' : 'forward';
    const lineNumber = params.lineNumber;
    navigate(`/lines/${lineNumber}/directions/${newDirection}/tracking`);
  };
  
  // Line switching handler
  const handleLineSwitch = (lineNumber: string) => {
    const currentDirection = selectedLine.direction.toLowerCase();
    navigate(`/lines/${lineNumber}/directions/${currentDirection}/tracking`);
    setShowLineSelector(false);
  };
  
  // Check for selected stop ID in session storage
  useEffect(() => {
    const selectedStopId = window.sessionStorage.getItem('selectedStopId');
    if (selectedStopId && busStops.length > 0) {
      const stop = busStops.find(stop => stop.id === selectedStopId);
      if (stop) {
        setSelectedStop(stop);
        window.sessionStorage.removeItem('selectedStopId');
      }
    }
  }, [busStops]);
  
  // Close line selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showLineSelector && !(event.target as Element).closest('.line-selector')) {
        setShowLineSelector(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLineSelector]);

  const handleStopSelect = (stop: BusStop) => {
    setSelectedStop(stop);
  };

  const handleRefreshLocation = () => {
    onLocateClick();
  };

  const handleBusHighlight = (busId: string) => {
    setHighlightedBus(highlightedBus === busId ? null : busId);
  };

  // Calculate the ETA of the next bus approaching the closest stop
  const getNextBusETA = (): { bus: BusPosition; eta: number } | null => {
    if (!closestStop || !busPositions.length) return null;
    
    let nextBus: { bus: BusPosition; eta: number } | null = null;
    let shortestETA = Infinity;
    
    busPositions.forEach((bus) => {
      const busStatus = getBusStatusForClosestStop(bus);
      if (busStatus.status === 'approaching' && busStatus.eta !== null && busStatus.eta < shortestETA) {
        shortestETA = busStatus.eta;
        nextBus = { bus, eta: busStatus.eta };
      }
    });
    
    return nextBus;
  };

  // Calculate bus status relative to closest stop using proper stop order
  const getBusStatusForClosestStop = (bus: BusPosition) => {
    if (!closestStop || !userLocation) return { status: 'unknown', eta: null };
    
    const busToStop = calculateDistance(
      { lat: bus.coordinates.latitude, lng: bus.coordinates.longitude },
      { lat: closestStop.coordinates.latitude, lng: closestStop.coordinates.longitude }
    );
    
    // If bus is very close to the stop (within 100m), it's "at stop"
    if (busToStop < 0.1) {
      return { status: 'at_stop', eta: 0 };
    }
    
    // Find the closest stop index in the bus stops list
    const closestStopIndex = busStops.findIndex(stop => stop.id === closestStop.id);
    if (closestStopIndex === -1) {
      return { status: 'unknown', eta: null };
    }
    
    // Find the bus's closest stop to determine its position in the route
    let busClosestStopIndex = -1;
    let minDistanceToBusStops = Infinity;
    
    busStops.forEach((stop, index) => {
      const distanceToBusStop = calculateDistance(
        { lat: bus.coordinates.latitude, lng: bus.coordinates.longitude },
        { lat: stop.coordinates.latitude, lng: stop.coordinates.longitude }
      );
      
      if (distanceToBusStop < minDistanceToBusStops) {
        minDistanceToBusStops = distanceToBusStop;
        busClosestStopIndex = index;
      }
    });
    
    // Determine status based on bus direction and stop positions
    const busDirection = selectedLine.direction; // Use selected line direction, not bus direction
    const isForward = busDirection === 'FORWARD';
    
    let hasPassed = false;
    if (isForward) {
      // For forward direction: bus has passed if it's at a higher index than closest stop
      hasPassed = busClosestStopIndex > closestStopIndex;
    } else {
      // For backward/return direction: In return, the bus travels from high index to low index
      // So the bus has passed if it's at a lower index than the closest stop
      // This means the bus already went past the user's stop
      hasPassed = busClosestStopIndex < closestStopIndex;
    }
    
    if (hasPassed) {
      return { status: 'passed', eta: null };
    }
    
    // Bus is approaching - calculate realistic ETA
    const speedKmh = bus.speed || 25; // Default speed if not available
    const speedMs = speedKmh / 3.6; // Convert to m/s
    
    // Calculate distance through route stops instead of direct distance
    let routeDistance = 0;
    if (isForward) {
      // Calculate distance from bus's current stop to user's closest stop
      for (let i = busClosestStopIndex; i < closestStopIndex; i++) {
        if (i + 1 < busStops.length) {
          routeDistance += calculateDistance(
            { lat: busStops[i].coordinates.latitude, lng: busStops[i].coordinates.longitude },
            { lat: busStops[i + 1].coordinates.latitude, lng: busStops[i + 1].coordinates.longitude }
          );
        }
      }
    } else {
      // For backward direction
      for (let i = busClosestStopIndex; i > closestStopIndex; i--) {
        if (i - 1 >= 0) {
          routeDistance += calculateDistance(
            { lat: busStops[i].coordinates.latitude, lng: busStops[i].coordinates.longitude },
            { lat: busStops[i - 1].coordinates.latitude, lng: busStops[i - 1].coordinates.longitude }
          );
        }
      }
    }
    
    // Add distance from bus to its closest stop
    routeDistance += minDistanceToBusStops;
    
    // Calculate ETA in minutes (more realistic calculation)
    let etaMinutes = 5; // Minimum realistic ETA
    if (speedMs > 0 && routeDistance > 0) {
      const estimatedTimeMinutes = (routeDistance * 1000) / (speedMs * 60); // Convert to minutes
      // Add buffer time for stops (1 minute per stop)
      const stopsBetween = Math.abs(closestStopIndex - busClosestStopIndex);
      const bufferTime = stopsBetween * 1;
      etaMinutes = Math.max(5, Math.round(estimatedTimeMinutes + bufferTime));
    }
    
    // Cap maximum ETA at 45 minutes for realism
    etaMinutes = Math.min(etaMinutes, 45);
    
    return { status: 'approaching', eta: etaMinutes };
  };

  // Modern Header Component with proper z-index
  const ModernHeader = () => (
    <div className={`sticky top-0 z-50 backdrop-blur-lg border-b shadow-lg ${
      isDark 
        ? 'bg-gray-900/95 border-gray-700' 
        : 'bg-white/95 border-gray-200'
    }`} style={{ zIndex: 1000 }}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors relative z-10 ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              style={{ zIndex: 1001 }}
            >
              <IconChevronLeft size={20} />
            </button>
            
            {/* Line Selector Button */}
            <div className="relative line-selector" style={{ zIndex: 1002 }}>
              <button
                onClick={() => setShowLineSelector(!showLineSelector)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-xl transition-all relative z-10 ${
                  isDark 
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                  selectedLine.direction === 'FORWARD' 
                    ? isDark 
                      ? 'bg-gradient-to-br from-green-500 to-green-700' 
                      : 'bg-gradient-to-br from-green-400 to-green-600'
                    : isDark 
                      ? 'bg-gradient-to-br from-orange-500 to-orange-700' 
                      : 'bg-gradient-to-br from-orange-400 to-orange-600'
                }`}>
                  <span className="text-white font-bold text-sm">{selectedLine.line}</span>
                </div>
                <IconChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
              </button>
              
              {/* Line Dropdown */}
              <AnimatePresence>
                {showLineSelector && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`absolute top-full left-0 mt-2 w-48 rounded-xl shadow-lg border z-50 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600' 
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    <div className="p-2 max-h-60 overflow-y-auto">
                      {busLines
                        .reduce((acc: string[], line) => {
                          if (!acc.includes(line.line)) acc.push(line.line);
                          return acc;
                        }, [])
                        .map((lineNumber) => (
                          <button
                            key={lineNumber}
                            onClick={() => handleLineSwitch(lineNumber)}
                            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                              lineNumber === selectedLine.line
                                ? isDark
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-blue-500 text-white'
                                : isDark
                                  ? 'hover:bg-gray-700 text-gray-300'
                                  : 'hover:bg-gray-100 text-gray-700'
                            }`}
                          >
                            <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                              lineNumber === selectedLine.line
                                ? 'bg-white/20 text-white'
                                : isDark
                                  ? 'bg-gray-600 text-gray-200'
                                  : 'bg-gray-200 text-gray-700'
                            }`}>
                              {lineNumber}
                            </div>
                            <span className="text-sm font-medium">Line {lineNumber}</span>
                          </button>
                        ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div>
              <h1 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {selectedLine.label}
              </h1>
              <div className="flex items-center space-x-2 text-sm">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  selectedLine.direction === 'FORWARD' 
                    ? isDark
                      ? 'bg-green-900 text-green-300' 
                      : 'bg-green-100 text-green-700'
                    : isDark
                      ? 'bg-orange-900 text-orange-300' 
                      : 'bg-orange-100 text-orange-700'
                }`}>
                  {selectedLine.direction === 'FORWARD' ? 'Outbound' : 'Return'}
                </span>
                <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>•</span>
                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>{busStops.length} stops</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                console.log('Stops list button clicked, current state:', showStopsList);
                setShowStopsList(!showStopsList);
              }}
              className={`p-3 rounded-full transition-all duration-200 relative z-10 ${
                showStopsList
                  ? isDark
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-blue-500 text-white shadow-lg'
                  : isDark 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
              style={{ zIndex: 1003 }}
              title={showStopsList ? 'Hide stops list' : 'Show all stops'}
            >
              <IconList size={18} />
            </button>
            <ThemeToggle size={18} />
            <button
              onClick={handleRefreshLocation}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors disabled:opacity-50 relative z-10 ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
              style={{ zIndex: 1003 }}
            >
              <IconRefresh size={18} className={isLoading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Quick Stats Component with Theme Colors
  const QuickStats = () => (
    <div className="grid grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4 p-6">
      <div className={`rounded-2xl p-5 border shadow-sm ${
        isDark 
          ? 'bg-gradient-to-br from-purple-900 to-purple-800 border-purple-700' 
          : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
            isDark ? 'bg-purple-600' : 'bg-blue-500'
          }`}>
            <IconBus size={22} className="text-white" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${
              isDark ? 'text-purple-100' : 'text-blue-900'
            }`}>{busPositions.length}</p>
            <p className={`text-sm font-medium ${
              isDark ? 'text-purple-300' : 'text-blue-600'
            }`}>Active Buses</p>
          </div>
        </div>
      </div>
      
      <div className={`rounded-2xl p-5 border shadow-sm ${
        isDark 
          ? 'bg-gradient-to-br from-teal-900 to-teal-800 border-teal-700' 
          : 'bg-gradient-to-br from-green-50 to-green-100 border-green-200'
      }`}>
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
            isDark ? 'bg-teal-600' : 'bg-green-500'
          }`}>
            <IconRoute size={22} className="text-white" />
          </div>
          <div>
            <p className={`text-2xl font-bold ${
              isDark ? 'text-teal-100' : 'text-green-900'
            }`}>{busStops.length}</p>
            <p className={`text-sm font-medium ${
              isDark ? 'text-teal-300' : 'text-green-600'
            }`}>Total Stops</p>
          </div>
        </div>
      </div>
      
      {closestStop && (
        <div className={`rounded-2xl p-5 border shadow-sm ${
          isDark 
            ? 'bg-gradient-to-br from-orange-900 to-orange-800 border-orange-700' 
            : 'bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
              isDark ? 'bg-orange-600' : 'bg-orange-500'
            }`}>
              <IconTarget size={22} className="text-white" />
            </div>
            <div>
              {(() => {
                const nextBus = getNextBusETA();
                return (
                  <>
                    <p className={`text-2xl font-bold ${
                      isDark ? 'text-orange-100' : 'text-orange-900'
                    }`}>
                      {nextBus ? `${nextBus.eta} min` : 'No bus'}
                    </p>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-orange-300' : 'text-orange-600'
                    }`}>
                      {nextBus ? 'Next Bus ETA' : 'Closest Stop'}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}
      
      {userLocation && (
        <div className={`rounded-2xl p-5 border shadow-sm ${
          isDark 
            ? 'bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-700' 
            : 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200'
        }`}>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-md ${
              isDark ? 'bg-indigo-600' : 'bg-purple-500'
            }`}>
              <IconNavigation size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <p className={`text-lg font-bold ${
                  isDark ? 'text-indigo-100' : 'text-purple-900'
                }`}>Located</p>
                {locationAccuracy && (
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    locationAccuracy <= 50 
                      ? isDark ? 'bg-green-800 text-green-300' : 'bg-green-100 text-green-700'
                      : locationAccuracy <= 100
                        ? isDark ? 'bg-yellow-800 text-yellow-300' : 'bg-yellow-100 text-yellow-700'
                        : isDark ? 'bg-red-800 text-red-300' : 'bg-red-100 text-red-700'
                  }`}>
                    ±{Math.round(locationAccuracy)}m
                  </span>
                )}
              </div>
              <p className={`text-sm font-medium ${
                isDark ? 'text-indigo-300' : 'text-purple-600'
              }`}>
                {locationAccuracy && locationAccuracy <= 50 
                  ? 'High Precision GPS' 
                  : locationAccuracy && locationAccuracy <= 100 
                    ? 'GPS Active' 
                    : 'Network Location'}
              </p>
              {locationAccuracy && locationAccuracy > 100 && (
                <p className={`text-xs mt-1 ${
                  isDark ? 'text-orange-300' : 'text-orange-600'
                }`}>
                  Try refreshing for better accuracy
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className={`flex flex-col h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <ModernHeader />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Main Content Area - Overview + Map */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* Overview Panel - Hidden on mobile, Left on desktop */}
          <div className={`hidden lg:block lg:w-96 xl:w-[28rem] flex-shrink-0 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'} lg:border-r ${isDark ? 'lg:border-gray-700' : 'lg:border-gray-200'}`}>
            <QuickStats />
            
            {/* Closest Stop Hero Card */}
            {closestStop && userLocation && (
              <div className="mx-6 mb-8">
                <div className={`rounded-2xl p-6 text-white shadow-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <IconTarget size={24} className="text-white" />
                      <h3 className="text-lg font-bold">Closest Stop</h3>
                    </div>
                    <span className="bg-white/20 rounded-full px-3 py-1 text-sm font-medium">
                      {formatTime(closestStop.eta)}
                    </span>
                  </div>
                  <p className="text-white/90 mb-4 font-medium text-base">{closestStop.name}</p>
                  <div className="flex space-x-3">
                    <button 
                      onClick={() => {
                        setSelectedStop(closestStop);
                      }}
                      className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-3 px-4 text-center font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <IconEye size={16} />
                      <span>Focus on Map</span>
                    </button>
                    <button 
                      onClick={() => {
                        window.sessionStorage.setItem('selectedStopId', closestStop.id);
                        setShowStopsList(true);
                      }}
                      className="flex-1 bg-white/20 hover:bg-white/30 rounded-lg py-3 px-4 text-center font-medium transition-colors flex items-center justify-center space-x-2"
                    >
                      <IconBookmark size={16} />
                      <span>Save Stop</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Location Accuracy Tips */}
            <div className="mx-6 mb-6">
              <LocationTips 
                accuracy={locationAccuracy} 
                onRefresh={handleRefreshLocation}
              />
            </div>

            {/* Real-time Bus Updates */}
            <div className="mx-6 mb-8">
              <div className={`rounded-2xl p-6 border shadow-sm ${
                isDark 
                  ? 'bg-gray-800 border-gray-700' 
                  : 'bg-white border-gray-200'
              }`}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <IconBus size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                    <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>Live Bus Updates</h3>
                  </div>
                  <button
                    onClick={handleRefreshLocation}
                    disabled={isLoading}
                    className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <IconRefresh size={16} className={isLoading ? 'animate-spin' : ''} />
                  </button>
                </div>
                
                {busPositions.length > 0 ? (
                  <div className="space-y-4">
                    {busPositions.slice(0, 3).map((bus, index) => {
                      const busStatus = getBusStatusForClosestStop(bus);
                      const isHighlighted = highlightedBus === bus.trackerId;
                      
                      return (
                        <div 
                          key={`${bus.trackerId}-${index}`} 
                          onClick={() => handleBusHighlight(bus.trackerId)}
                          className={`flex items-center justify-between rounded-xl p-5 cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                            isHighlighted
                              ? isDark 
                                ? 'bg-gradient-to-r from-blue-800 to-purple-800 shadow-lg ring-2 ring-blue-400' 
                                : 'bg-gradient-to-r from-blue-100 to-purple-100 shadow-lg ring-2 ring-blue-400'
                              : isDark 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-blue-50 hover:bg-blue-100'
                          }`}
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                              isHighlighted
                                ? 'bg-white shadow-md'
                                : isDark ? 'bg-blue-600' : 'bg-blue-500'
                            }`}>
                              <IconBus size={16} className={isHighlighted ? 'text-blue-600' : 'text-white'} />
                            </div>
                            <div>
                              <p className={`font-medium ${
                                isHighlighted
                                  ? isDark ? 'text-white' : 'text-gray-900'
                                  : isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                Bus #{bus.trackerId}
                              </p>
                              <p className={`text-sm ${
                                isHighlighted
                                  ? isDark ? 'text-blue-200' : 'text-blue-700'
                                  : isDark ? 'text-gray-300' : 'text-gray-600'
                              }`}>
                                Route {selectedLine.line} • {bus.speed} km/h
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            {busStatus.status === 'approaching' && busStatus.eta !== null ? (
                              <>
                                <p className={`text-sm font-medium ${
                                  isHighlighted 
                                    ? isDark ? 'text-green-300' : 'text-green-700'
                                    : isDark ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  Approaching
                                </p>
                                <p className={`text-xs ${
                                  isHighlighted
                                    ? isDark ? 'text-blue-200' : 'text-blue-700'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  ETA {busStatus.eta} min
                                </p>
                              </>
                            ) : busStatus.status === 'at_stop' ? (
                              <>
                                <p className={`text-sm font-medium ${
                                  isHighlighted 
                                    ? isDark ? 'text-yellow-300' : 'text-yellow-700'
                                    : isDark ? 'text-yellow-400' : 'text-yellow-600'
                                }`}>
                                  At Stop
                                </p>
                                <p className={`text-xs ${
                                  isHighlighted
                                    ? isDark ? 'text-blue-200' : 'text-blue-700'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Now boarding
                                </p>
                              </>
                            ) : busStatus.status === 'passed' ? (
                              <>
                                <p className={`text-sm font-medium ${
                                  isHighlighted 
                                    ? isDark ? 'text-gray-300' : 'text-gray-600'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Passed
                                </p>
                                <p className={`text-xs ${
                                  isHighlighted
                                    ? isDark ? 'text-blue-200' : 'text-blue-700'
                                    : isDark ? 'text-gray-500' : 'text-gray-400'
                                }`}>
                                  Already gone
                                </p>
                              </>
                            ) : (
                              <>
                                <p className={`text-sm font-medium ${
                                  isHighlighted 
                                    ? isDark ? 'text-green-300' : 'text-green-700'
                                    : isDark ? 'text-green-400' : 'text-green-600'
                                }`}>
                                  Active
                                </p>
                                <p className={`text-xs ${
                                  isHighlighted
                                    ? isDark ? 'text-blue-200' : 'text-blue-700'
                                    : isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  {new Date().toLocaleTimeString()}
                                </p>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                    
                    {busPositions.length > 3 && (
                      <button
                        onClick={() => setSelectedStop(null)}
                        className={`w-full py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                          isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        View {busPositions.length - 3} more buses on map
                      </button>
                    )}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    <IconBus size={32} className="mx-auto mb-2 opacity-50" />
                    <p>No active buses found</p>
                    <p className="text-sm">Check back in a few minutes</p>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Map Area - Full screen on mobile, Right on desktop */}
          <div className="flex-1 relative">
            <MapComponent
              busPositions={busPositions}
              busStops={busStops}
              routePath={routePath}
              userLocation={userLocation}
              onStopSelect={handleStopSelect}
              selectedStop={selectedStop}
              selectedLine={selectedLine}
              closestStop={closestStop}
              highlightedBus={highlightedBus}
              onLocationSelect={onManualLocationSelect ? (location) => onManualLocationSelect(location.lat, location.lng) : undefined}
              canSetManualLocation={canSelectManually}
            />
            
            {/* Mobile Floating Controls - Simplified for mobile priority */}
            <div className="lg:hidden">
              {/* Top Bar - Line & Direction Controls */}
              <div className="absolute top-4 left-4 right-4 z-50">
                <div className="flex items-center justify-between space-x-3">
                  {/* Line Selector */}
                  <div className="relative line-selector">
                    <button
                      onClick={() => setShowLineSelector(!showLineSelector)}
                      className={`flex items-center space-x-2 px-3 py-2 rounded-2xl shadow-xl transition-all backdrop-blur-md ${
                        isDark 
                          ? 'bg-gray-800/90 hover:bg-gray-700/90 text-white border border-gray-600' 
                          : 'bg-white/90 hover:bg-gray-50/90 text-gray-900 border border-gray-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${
                        selectedLine.direction === 'FORWARD' 
                          ? 'bg-gradient-to-br from-green-500 to-green-600' 
                          : 'bg-gradient-to-br from-orange-500 to-orange-600'
                      }`}>
                        <span className="text-white font-bold text-sm">{selectedLine.line}</span>
                      </div>
                      <IconChevronDown size={16} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                    </button>
                    
                    {/* Line Dropdown */}
                    <AnimatePresence>
                      {showLineSelector && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={`absolute top-full left-0 mt-2 w-48 rounded-xl shadow-xl border z-50 backdrop-blur-md ${
                            isDark 
                              ? 'bg-gray-800/95 border-gray-600' 
                              : 'bg-white/95 border-gray-300'
                          }`}
                        >
                          <div className="p-2 max-h-60 overflow-y-auto">
                            {busLines
                              .reduce((acc: string[], line) => {
                                if (!acc.includes(line.line)) acc.push(line.line);
                                return acc;
                              }, [])
                              .map((lineNumber) => (
                                <button
                                  key={lineNumber}
                                  onClick={() => handleLineSwitch(lineNumber)}
                                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                                    lineNumber === selectedLine.line
                                      ? isDark
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-blue-500 text-white'
                                      : isDark
                                        ? 'hover:bg-gray-700 text-gray-300'
                                        : 'hover:bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                                    lineNumber === selectedLine.line
                                      ? 'bg-white/20 text-white'
                                      : isDark
                                        ? 'bg-gray-600 text-gray-200'
                                        : 'bg-gray-200 text-gray-700'
                                  }`}>
                                    {lineNumber}
                                  </div>
                                  <span className="text-sm font-medium">Line {lineNumber}</span>
                                </button>
                              ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Direction Switch */}
                  <button
                    onClick={() => handleDirectionSwitch()}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-2xl shadow-xl transition-all duration-200 transform active:scale-95 backdrop-blur-md ${
                      selectedLine.direction === 'FORWARD'
                        ? isDark
                          ? 'bg-green-600/90 border border-green-500 text-white'
                          : 'bg-green-500/90 border border-green-400 text-white'
                        : isDark
                          ? 'bg-orange-600/90 border border-orange-500 text-white'
                          : 'bg-orange-500/90 border border-orange-400 text-white'
                    }`}
                  >
                    <IconArrowsLeftRight size={18} />
                    <div className="text-left">
                      <div className="text-sm font-bold">
                        {selectedLine.direction === 'FORWARD' ? 'Forward' : 'Return'}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Essential Info - Compact */}
              <div className="absolute bottom-4 left-4 right-4 z-40">
                <div className={`rounded-2xl p-3 shadow-xl backdrop-blur-lg border ${
                  isDark 
                    ? 'bg-gray-900/95 border-gray-700' 
                    : 'bg-white/95 border-gray-200'
                }`}>
                  {/* Primary Info Row - Always Visible */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-4">
                      {/* Bus Count */}
                      <div className="flex items-center space-x-2">
                        <IconBus size={18} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                        <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {busPositions.length}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          buses
                        </span>
                      </div>
                      
                      {/* Next Bus ETA */}
                      {(() => {
                        const nextBus = getNextBusETA();
                        return nextBus ? (
                          <div className="flex items-center space-x-2">
                            <IconTarget size={18} className={isDark ? 'text-green-400' : 'text-green-600'} />
                            <span className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}>
                              {nextBus.eta}
                            </span>
                            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              min
                            </span>
                          </div>
                        ) : null;
                      })()}
                    </div>

                    {/* Action Buttons - Compact */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={handleRefreshLocation}
                        disabled={isLoading}
                        className={`w-9 h-9 rounded-xl transition-all duration-200 transform active:scale-95 flex items-center justify-center disabled:opacity-50 ${
                          isDark 
                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <IconRefresh size={14} className={isLoading ? 'animate-spin' : ''} />
                      </button>
                      
                      <button
                        onClick={() => setShowStopsList(!showStopsList)}
                        className={`w-9 h-9 rounded-xl transition-all duration-200 transform active:scale-95 flex items-center justify-center ${
                          showStopsList
                            ? isDark
                              ? 'bg-blue-600 text-white'
                              : 'bg-blue-500 text-white'
                            : isDark 
                              ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' 
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        <IconList size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Closest Stop Info - Collapsible on tap */}
                  {closestStop && userLocation && (
                    <div className={`text-sm border-t pt-2 ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className={`font-medium truncate text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {closestStop.name}
                          </p>
                          <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            {formatDistance(calculateDistance(userLocation, {
                              lat: closestStop.coordinates.latitude,
                              lng: closestStop.coordinates.longitude
                            }))} • {formatTime(closestStop.eta)}
                          </p>
                        </div>
                        <button 
                          onClick={() => setSelectedStop(closestStop)}
                          className={`ml-2 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                            isDark
                              ? 'bg-blue-600 hover:bg-blue-700 text-white'
                              : 'bg-blue-500 hover:bg-blue-600 text-white'
                          }`}
                        >
                          Focus
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Floating Controls - Only visible on desktop */}
            <div className="hidden lg:block">
              {/* Floating Direction Switch Button - Top Right of Map */}
              <div className="absolute top-4 right-4 z-40">
                <button
                  onClick={() => handleDirectionSwitch()}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl shadow-xl border-2 transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    selectedLine.direction === 'FORWARD'
                      ? isDark
                        ? 'bg-gradient-to-r from-green-600 to-green-700 border-green-500 text-white'
                        : 'bg-gradient-to-r from-green-500 to-green-600 border-green-400 text-white'
                      : isDark
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 border-orange-500 text-white'
                        : 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-400 text-white'
                  } backdrop-blur-sm`}
                  style={{ zIndex: 1003 }}
                >
                  <div className="flex items-center space-x-2">
                    <IconArrowsLeftRight size={20} />
                    <div className="text-left">
                      <div className="text-sm font-bold">
                        {selectedLine.direction === 'FORWARD' ? 'Forward' : 'Return'}
                      </div>
                      <div className="text-xs opacity-90">
                        Tap to switch
                      </div>
                    </div>
                  </div>
                  <IconChevronRight size={16} className="opacity-70" />
                </button>
              </div>
              
              {/* Floating Bus Count - Bottom Right */}
              {busPositions.length > 0 && (
                <div className={`absolute bottom-4 right-4 px-3 py-2 rounded-lg shadow-lg ${
                  isDark ? 'bg-gray-800/90 text-white' : 'bg-white/90 text-gray-900'
                }`}>
                  <div className="flex items-center space-x-2 text-sm font-medium">
                    <IconBus size={16} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
                    <span>{busPositions.length} active</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Mobile Stops List Overlay - Full screen on mobile when showStopsList is true */}
        <AnimatePresence>
          {showStopsList && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setShowStopsList(false)}
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showStopsList && (
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`lg:hidden fixed inset-x-0 bottom-0 top-16 z-50 shadow-2xl flex flex-col ${
                isDark ? 'bg-gray-900' : 'bg-white'
              }`}
              style={{ zIndex: 1004 }}
            >
              {/* Mobile Header */}
              <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowStopsList(false)}
                      className={`p-2 rounded-full transition-colors ${
                        isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <IconChevronLeft size={24} />
                    </button>
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        All Bus Stops
                      </h3>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {busStops.length} stops • Line {selectedLine.line}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Mobile Search Bar */}
                <div className="px-4 pb-4">
                  <div className="relative">
                    <IconSearch size={20} className={`absolute left-4 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search bus stops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-base ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Mobile Stops List - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto min-h-0" 
                style={{ 
                  height: 'calc(100vh - 180px)',
                }}
              >
                <BusStopsList
                  stops={busStops.filter(stop =>
                    stop.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  onStopSelect={(stop) => {
                    handleStopSelect(stop);
                    setShowStopsList(false);
                  }}
                  userLocation={userLocation}
                  closestStop={closestStop}
                  listType="detailed"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Desktop Stops List Overlay - Only visible on desktop when showStopsList is true */}
        <AnimatePresence>
          {showStopsList && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="hidden lg:block fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowStopsList(false)}
            />
          )}
        </AnimatePresence>
        
        <AnimatePresence>
          {showStopsList && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`hidden lg:block fixed right-0 top-0 h-full w-96 z-50 shadow-2xl border-l flex flex-col ${
                isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              }`}
              style={{ zIndex: 1004 }}
            >
              {/* Desktop Header */}
              <div className={`flex-shrink-0 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="flex items-center justify-between p-4">
                  <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    All Bus Stops
                  </h3>
                  <button
                    onClick={() => setShowStopsList(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <IconChevronLeft size={20} />
                  </button>
                </div>
                
                {/* Desktop Search Bar */}
                <div className="px-4 pb-3">
                  <div className="relative">
                    <IconSearch size={20} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`} />
                    <input
                      type="text"
                      placeholder="Search bus stops..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={`w-full pl-10 pr-4 py-2 rounded-lg border text-sm ${
                        isDark 
                          ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400' 
                          : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                      }`}
                    />
                  </div>
                </div>
              </div>
              
              {/* Desktop Stops List - Scrollable */}
              <div 
                className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100" 
                style={{ 
                  height: 'calc(100vh - 140px)',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#d1d5db #f3f4f6'
                }}
              >
                <BusStopsList
                  stops={busStops.filter(stop =>
                    stop.name.toLowerCase().includes(searchTerm.toLowerCase())
                  )}
                  onStopSelect={(stop) => {
                    handleStopSelect(stop);
                    setShowStopsList(false);
                  }}
                  userLocation={userLocation}
                  closestStop={closestStop}
                  listType="modern"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BusTrackingView;
