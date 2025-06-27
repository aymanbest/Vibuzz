import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatTime, calculateDistance } from '../utils';
import { 
  IconBus,
  IconList,
  IconChevronLeft,
  IconRefresh,
  IconRoute,
  IconTarget,
  IconNavigation,
  IconEye,
  IconSearch,
  IconBookmark
} from '@tabler/icons-react';
import type { BusLine, BusStop, BusPosition, UserLocation } from '../types';
import MapComponent from './MapComponent';
import BusStopsList from './BusStopsList';
import ThemeToggle from './ThemeToggle';
import { useTheme } from '../contexts/ThemeContext';

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
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const [showStopsList, setShowStopsList] = useState(false);
  const [selectedStop, setSelectedStop] = useState<BusStop | null>(null);
  const [highlightedBus, setHighlightedBus] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
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

  const handleStopSelect = (stop: BusStop) => {
    setSelectedStop(stop);
  };

  const handleRefreshLocation = () => {
    onLocateClick();
  };

  const handleBusHighlight = (busId: string) => {
    setHighlightedBus(highlightedBus === busId ? null : busId);
  };

  // Calculate bus status relative to closest stop
  const getBusStatusForClosestStop = (bus: BusPosition) => {
    if (!closestStop || !userLocation) return { status: 'unknown', eta: null };
    
    const busToStop = calculateDistance(
      { lat: bus.coordinates.latitude, lng: bus.coordinates.longitude },
      { lat: closestStop.coordinates.latitude, lng: closestStop.coordinates.longitude }
    );
    
    const userToStop = calculateDistance(
      userLocation,
      { lat: closestStop.coordinates.latitude, lng: closestStop.coordinates.longitude }
    );
    
    // If bus is very close to the stop (within 100m), it's "at stop"
    if (busToStop < 0.1) {
      return { status: 'at_stop', eta: 0 };
    }
    
    // If bus is closer to stop than user, it has "passed"
    if (busToStop > userToStop) {
      return { status: 'passed', eta: null };
    }
    
    // If bus is approaching (farther from stop than user but moving towards it)
    // Estimate ETA based on current speed and distance
    const speedKmh = bus.speed || 30; // Default speed if not available
    const speedMs = speedKmh / 3.6; // Convert to m/s
    const etaMinutes = speedMs > 0 ? (busToStop * 1000) / (speedMs * 60) : null;
    
    return { status: 'approaching', eta: Math.round(etaMinutes || 0) };
  };

  // Modern Header Component
  const ModernHeader = () => (
    <div className={`sticky top-0 z-50 backdrop-blur-lg border-b shadow-lg ${
      isDark 
        ? 'bg-gray-900/90 border-gray-700' 
        : 'bg-white/90 border-gray-200'
    }`}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => navigate(-1)}
              className={`p-2 rounded-full transition-colors ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <IconChevronLeft size={20} />
            </button>
            
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              selectedLine.direction === 'FORWARD' 
                ? isDark 
                  ? 'bg-gradient-to-br from-green-500 to-green-700' 
                  : 'bg-gradient-to-br from-green-400 to-green-600'
                : isDark 
                  ? 'bg-gradient-to-br from-orange-500 to-orange-700' 
                  : 'bg-gradient-to-br from-orange-400 to-orange-600'
            }`}>
              <span className="text-white font-bold text-lg">{selectedLine.line}</span>
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
              onClick={() => setShowStopsList(!showStopsList)}
              className={`p-2 rounded-full transition-colors ${
                showStopsList
                  ? isDark
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-500 text-white'
                  : isDark 
                    ? 'hover:bg-gray-800 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <IconList size={18} />
            </button>
            <ThemeToggle size={18} />
            <button
              onClick={handleRefreshLocation}
              disabled={isLoading}
              className={`p-2 rounded-full transition-colors disabled:opacity-50 ${
                isDark 
                  ? 'hover:bg-gray-800 text-gray-300' 
                  : 'hover:bg-gray-100 text-gray-600'
              }`}
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
              <p className={`text-2xl font-bold ${
                isDark ? 'text-orange-100' : 'text-orange-900'
              }`}>{formatTime(closestStop.eta)}</p>
              <p className={`text-sm font-medium ${
                isDark ? 'text-orange-300' : 'text-orange-600'
              }`}>Closest ETA</p>
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
            <div>
              <p className={`text-lg font-bold ${
                isDark ? 'text-indigo-100' : 'text-purple-900'
              }`}>Located</p>
              <p className={`text-sm font-medium ${
                isDark ? 'text-indigo-300' : 'text-purple-600'
              }`}>GPS Active</p>
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
          {/* Overview Panel - Top on mobile, Left on desktop */}
          <div className={`lg:w-96 xl:w-[28rem] flex-shrink-0 overflow-y-auto ${isDark ? 'bg-gray-900' : 'bg-gray-50'} lg:border-r ${isDark ? 'lg:border-gray-700' : 'lg:border-gray-200'}`}>
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
                      {formatTime(closestStop.eta)} min
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
          
          {/* Map Area - Bottom on mobile, Right on desktop */}
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
            />
            
            {/* Floating Bus Count */}
            {busPositions.length > 0 && (
              <div className={`absolute top-4 right-4 px-3 py-2 rounded-lg shadow-lg ${
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
        
        {/* Sliding Stops Panel */}
        <AnimatePresence>
          {showStopsList && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className={`absolute inset-y-0 right-0 w-full md:w-96 z-40 shadow-xl ${
                isDark ? 'bg-gray-900' : 'bg-white'
              } border-l ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
            >
              {/* Stops Panel Header */}
              <div className={`sticky top-0 z-10 backdrop-blur-lg border-b ${
                isDark 
                  ? 'bg-gray-900/90 border-gray-700' 
                  : 'bg-white/90 border-gray-200'
              }`}>
                <div className="px-4 py-3 flex items-center justify-between">
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    All Stops
                  </h2>
                  <button
                    onClick={() => setShowStopsList(false)}
                    className={`p-2 rounded-full transition-colors ${
                      isDark 
                        ? 'hover:bg-gray-800 text-gray-300' 
                        : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <IconChevronLeft size={20} />
                  </button>
                </div>
                
                {/* Search Bar */}
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
              
              {/* Stops List */}
              <div className="flex-1 overflow-y-auto">
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
