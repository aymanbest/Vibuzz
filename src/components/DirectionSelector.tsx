import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatTime } from '../utils';
import { 
  IconArrowRight,
  IconArrowLeft,
  IconMapPin,
  IconCheck,
  IconRoute,
  IconCircle,
  IconCircleDotFilled,
  IconList,
  IconMapSearch,
  IconClock,
  IconGps,
  IconArrowLeft as IconBack,
} from '@tabler/icons-react';
import type { BusLine, BusStop, UserLocation } from '../types';

interface DirectionSelectorProps {
  forwardLine: BusLine | null;
  backwardLine: BusLine | null;
  selectedDirection: 'FORWARD' | 'BACKWARD' | null;
  onDirectionSelect: (direction: 'FORWARD' | 'BACKWARD', line: BusLine) => void;
  forwardStops?: BusStop[]; // Forward direction stops
  backwardStops?: BusStop[]; // Backward direction stops
  userLocation?: UserLocation | null; // User's current location
  showStopsView?: boolean; // Whether to show the stops view directly
  onBack?: () => void; // Callback for back navigation
}

const DirectionSelector: React.FC<DirectionSelectorProps> = ({
  forwardLine,
  backwardLine,
  selectedDirection,
  onDirectionSelect,
  forwardStops = [],
  backwardStops = [],
  userLocation = null,
  showStopsView = false,
  onBack,
}) => {
  const navigate = useNavigate();
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  const [selectedStops, setSelectedStops] = useState<BusStop[]>([]);
  
  // Set up selected line and stops based on the current direction
  useEffect(() => {
    if (showStopsView && selectedDirection) {
      const line = selectedDirection === 'FORWARD' ? forwardLine : backwardLine;
      const stops = selectedDirection === 'FORWARD' ? forwardStops : backwardStops;
      
      if (line) {
        setSelectedLine(line);
        setSelectedStops(stops);
      }
    }
  }, [showStopsView, selectedDirection, forwardLine, backwardLine, forwardStops, backwardStops]);
  
  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
  
  // Find the closest bus stop to the user from currently selected direction stops
  const closestStop: BusStop | null = useMemo(() => {
    if (!userLocation || !selectedStops.length) return null;
    
    let closest: BusStop | null = null;
    let minDistance = Infinity;
    
    selectedStops.forEach(stop => {
      const distance = calculateDistance(
        userLocation.lat, 
        userLocation.lng, 
        stop.coordinates.latitude, 
        stop.coordinates.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        closest = stop;
      }
    });
    
    return closest;
  }, [userLocation, selectedStops]);
  
  const directions = [
    {
      key: 'FORWARD' as const,
      line: forwardLine,
      icon: <IconArrowRight size={24} />,
      label: 'Forward Direction',
      description: 'Outbound Route',
      color: 'green',
      stops: forwardStops
    },
    {
      key: 'BACKWARD' as const,
      line: backwardLine,
      icon: <IconArrowLeft size={24} />,
      label: 'Backward Direction',
      description: 'Return Route',
      color: 'orange',
      stops: backwardStops
    }
  ];

  const availableDirections = directions.filter(d => d.line !== null);

  const handleDirectionClick = (direction: 'FORWARD' | 'BACKWARD', line: BusLine) => {
    // Navigate to the stops view for this direction
    const lineNumber = line.line;
    const directionParam = direction.toLowerCase();
    navigate(`/lines/${lineNumber}/directions/${directionParam}/stops`);
  };

  // Handle the case when no directions are available
  if (availableDirections.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-xl shadow-md p-6 max-w-sm mx-auto text-center"
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <IconRoute size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Directions Available</h3>
          <p className="text-gray-600 mb-4">
            This bus line doesn't have any available directions at the moment.
          </p>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Show the bus stops in 2-column grid after direction selection
  if (showStopsView && selectedLine && selectedStops.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-default max-w-4xl mx-auto py-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-4 mb-4 flex items-center sticky top-0 z-10"
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
                <span>{selectedStops.length} stops</span>
              </div>
            </div>
            
            <button 
              onClick={onBack}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <IconBack size={20} className="text-gray-600" />
            </button>
          </motion.div>

          {/* Bus stops in 2-column grid */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-white rounded-xl shadow-md mb-4 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-800 flex items-center">
                <IconMapPin size={18} className="mr-2 text-primary-600" />
                All Bus Stops ({selectedStops.length})
              </h2>
              
              {/* Route summary */}
              {selectedStops.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-3 mt-3 flex items-center justify-between">
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white text-xs mr-1.5">
                      1
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[140px]">{selectedStops[0].name}</span>
                  </div>
                  
                  <div className="flex-1 mx-2 h-0.5 bg-gray-300 relative">
                    <div className="absolute inset-x-0 top-1/2 border-t border-dashed border-gray-400"></div>
                  </div>
                  
                  <div className="flex items-center text-sm">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex items-center justify-center text-white text-xs mr-1.5">
                      {selectedStops.length}
                    </div>
                    <span className="font-medium text-gray-800 truncate max-w-[140px]">{selectedStops[selectedStops.length - 1].name}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="p-4">
              {/* 2-column grid layout for bus stops */}
              <div className="grid grid-cols-2 gap-3">
                {selectedStops.map((stop, index) => {
                  const isClosest = closestStop !== null && stop.id === (closestStop as BusStop).id;
                  const isFirstStop = index === 0;
                  const isLastStop = index === selectedStops.length - 1;
                  
                  return (
                    <motion.div 
                      key={stop.id} 
                      className={`
                        p-3 rounded-lg cursor-pointer transition-all duration-300
                        ${isClosest 
                          ? 'bg-blue-50 border-2 border-blue-400 shadow-md' 
                          : isFirstStop
                            ? 'border-2 border-green-200 bg-green-50 shadow-sm'
                            : isLastStop
                              ? 'border-2 border-red-200 bg-red-50 shadow-sm'
                              : 'hover:bg-primary-50 border hover:border-primary-300 shadow-sm bg-white border-gray-200'}
                      `}
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                      onClick={() => {
                        // Save selected stop ID in session storage to highlight it on the map
                        window.sessionStorage.setItem('selectedStopId', stop.id);
                        onDirectionSelect(selectedLine!.direction, selectedLine!);
                      }}
                    >
                      <div className="flex flex-col">
                        {/* Stop number indicator */}
                        <div className="flex items-center justify-between mb-2">
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                            border-2 shadow-sm
                            ${isClosest 
                              ? 'bg-blue-600 text-white border-white animate-pulse-slow'
                              : isFirstStop
                                ? 'bg-green-600 text-white border-white'
                                : isLastStop
                                  ? 'bg-red-600 text-white border-white'
                                  : 'bg-primary-600 text-white border-white'}
                          `}>
                            {index + 1}
                          </div>
                          
                          {/* Special badges */}
                          {isClosest && (
                            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded font-semibold">
                              Closest
                            </span>
                          )}
                          {isFirstStop && !isClosest && (
                            <span className="bg-green-200 text-green-800 text-xs px-2 py-0.5 rounded font-semibold">
                              First
                            </span>
                          )}
                          {isLastStop && !isClosest && (
                            <span className="bg-red-200 text-red-800 text-xs px-2 py-0.5 rounded font-semibold">
                              Last
                            </span>
                          )}
                        </div>
                        
                        {/* Stop name */}
                        <div className="font-medium text-gray-900 text-sm mb-2 leading-tight">
                          {stop.name}
                        </div>
                        
                        {/* Stop details */}
                        <div className="space-y-1">
                          {/* ETA indicator */}
                          <div className="bg-blue-100 rounded p-1.5 flex items-center border border-blue-200">
                            <IconClock size={14} className="mr-1 text-blue-700" />
                            <span className="text-xs text-blue-800 font-medium">
                              {formatTime(stop.eta)}
                            </span>
                          </div>
                          {/* Travel time indicator */}
                          <div className="bg-green-100 rounded p-1.5 flex items-center border border-green-200">
                            <IconRoute size={14} className="mr-1 text-green-700" />
                            <span className="text-xs text-green-800 font-medium">
                              {formatTime(stop.travelTimeTo)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Select button */}
                        <button 
                          className={`
                            mt-2 w-full py-1 text-xs font-medium rounded flex items-center justify-center transition-colors
                            ${isClosest 
                              ? 'bg-blue-200 text-blue-800 hover:bg-blue-300' 
                              : 'bg-primary-100 text-primary-700 hover:bg-primary-200'
                            }
                          `}
                        >
                          <IconMapSearch size={10} className="mr-1" />
                          View
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
          
          {/* View Live Map Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-md p-4 border border-primary-100"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-700 font-medium mb-2 sm:mb-0">
                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center mr-2">
                  <IconRoute size={18} className="text-primary-600" />
                </div>
                <div>
                  <span className="font-semibold">{selectedStops.length} bus stops</span>
                  <span className="px-2 text-gray-500">•</span>
                  <span>{formatTime(selectedLine?.firstStop?.eta || 0)} travel time</span>
                </div>
              </div>
              <div className="flex items-center text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-lg border border-green-200 font-medium shadow-sm">
                <IconClock size={14} className="mr-1.5" />
                <span>Live data available</span>
              </div>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onDirectionSelect(selectedLine!.direction, selectedLine!)}
              className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors shadow-md"
            >
              <IconMapSearch size={20} className="mr-2.5" />
              View Live Bus Map
            </motion.button>
            
            {closestStop && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                  <IconGps size={18} className="text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-800">Closest stop detected</p>
                  <p className="text-xs text-blue-600 mt-0.5">{(closestStop as BusStop).name}</p>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    );
  }

  // Show view for selecting a direction
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-default py-6 max-w-xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-8 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-600 rounded-2xl mb-5 text-white">
            <IconRoute size={32} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Choose Your Direction</h1>
          <p className="text-gray-600 max-w-md mx-auto text-lg">
            Select the direction you want to travel
          </p>
        </motion.div>

        {/* Direction Cards */}
        <div className="grid grid-cols-1 gap-5 max-w-md mx-auto">
          {availableDirections.map((direction, index) => {
            const isSelected = selectedDirection === direction.key;
            const line = direction.line!;
            const isForward = direction.key === 'FORWARD';
            const stops = direction.stops;
            
            return (
              <motion.div
                key={direction.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -4, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)' }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleDirectionClick(direction.key, line)}
                className={`
                  bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transition-all duration-300
                  border-2 ${isSelected 
                    ? isForward ? 'border-green-500' : 'border-orange-500' 
                    : 'border-transparent hover:border-gray-200'
                  }
                `}
              >
                <div className="p-5">
                  {/* Header with direction info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`
                        w-14 h-14 rounded-full flex items-center justify-center mr-4
                        shadow-sm border-2 
                        ${isForward 
                          ? 'bg-green-100 text-green-600 border-green-200' 
                          : 'bg-orange-100 text-orange-600 border-orange-200'
                        }
                      `}>
                        {direction.icon}
                      </div>
                      
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg mb-1">
                          {direction.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {direction.description}
                        </p>
                      </div>
                    </div>
                    
                    {isSelected && (
                      <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center shadow-md">
                        <IconCheck size={16} stroke={3} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Route endpoints visualization */}
                  {line.firstStop && line.lastStop && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-3 border border-gray-200">
                      <div className="flex items-start">
                        <div className="flex flex-col items-center mr-4">
                          <IconCircleDotFilled size={20} className={isForward ? "text-green-600" : "text-orange-600"} />
                          <div className="w-1 bg-gray-300 h-12"></div>
                          <IconCircle size={20} className={isForward ? "text-green-400" : "text-orange-400"} />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="mb-5">
                            <div className="text-sm font-semibold text-gray-900">
                              {line.firstStop.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5 flex items-center">
                              <IconMapPin size={12} className="mr-1" />
                              <span>Starting point</span>
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">
                              {line.lastStop.name}
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5 flex items-center">
                              <IconMapPin size={12} className="mr-1" />
                              <span>Final destination</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Stops count */}
                      <div className="mt-3 border-t border-gray-200 pt-3 flex items-center justify-between">
                        <span className="text-xs text-gray-500 flex items-center">
                          <IconRoute size={14} className="mr-1" />
                          {stops.length} stops available
                        </span>
                        
                        {userLocation && stops.length > 0 && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                            <IconGps size={10} className="inline mr-1" />
                            Location available
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Call to action button */}
                  <div className="mt-4 flex">
                    <motion.button
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`
                        flex items-center justify-center w-full py-3 rounded-lg font-medium text-sm
                        shadow-sm transition-all
                        ${isForward 
                          ? 'bg-green-600 text-white hover:bg-green-700' 
                          : 'bg-orange-600 text-white hover:bg-orange-700'}
                      `}
                    >
                      <IconList size={16} className="mr-1.5" />
                      View All Stops
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DirectionSelector;
