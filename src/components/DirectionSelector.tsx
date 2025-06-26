import React, { useState } from 'react';
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
  IconChevronsRight,
  IconMapSearch,
  IconClock,
  IconClockHour3
} from '@tabler/icons-react';
import type { BusLine, BusStop } from '../types';

interface DirectionSelectorProps {
  forwardLine: BusLine | null;
  backwardLine: BusLine | null;
  selectedDirection: 'FORWARD' | 'BACKWARD' | null;
  onDirectionSelect: (direction: 'FORWARD' | 'BACKWARD', line: BusLine) => void;
  busStops?: BusStop[]; // Optional bus stops to display after direction selection
}

const DirectionSelector: React.FC<DirectionSelectorProps> = ({
  forwardLine,
  backwardLine,
  selectedDirection,
  onDirectionSelect,
  busStops = [],
}) => {
  const [showStops, setShowStops] = useState(false);
  const [selectedLine, setSelectedLine] = useState<BusLine | null>(null);
  
  const directions = [
    {
      key: 'FORWARD' as const,
      line: forwardLine,
      icon: <IconArrowRight size={24} />,
      label: 'Forward Direction',
      description: 'Outbound Route',
      color: 'green'
    },
    {
      key: 'BACKWARD' as const,
      line: backwardLine,
      icon: <IconArrowLeft size={24} />,
      label: 'Backward Direction',
      description: 'Return Route',
      color: 'orange'
    }
  ];

  const availableDirections = directions.filter(d => d.line !== null);

  const handleDirectionClick = (direction: 'FORWARD' | 'BACKWARD', line: BusLine) => {
    // Just update the selected line and call the parent's callback
    // Do NOT use setSelectedDirection as it doesn't exist in this component
    // The parent component (App.tsx) handles direction state
    setSelectedLine(line);
    onDirectionSelect(direction, line);
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
            onClick={() => window.history.back()}
            className="w-full py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
          >
            Go Back
          </button>
        </motion.div>
      </div>
    );
  }

  // Show the bus stops after direction selection
  if (showStops && selectedLine && busStops.length > 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container-default max-w-md mx-auto py-4">
          {/* Header */}
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
              onClick={() => setShowStops(false)}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <IconArrowLeft size={20} className="text-gray-600" />
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
            
            <div className="p-4">
              {busStops.map((stop, index) => (
                <motion.div 
                  key={stop.id} 
                  className="mb-3 last:mb-0 hover:bg-primary-50 p-3 rounded-lg cursor-pointer transition-colors border-2 border-transparent hover:border-primary-300 shadow-sm"
                  whileHover={{ x: 4, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                  onClick={() => {
                    // Save selected stop ID in session storage to highlight it on the map
                    window.sessionStorage.setItem('selectedStopId', stop.id);
                    onDirectionSelect(selectedLine!.direction, selectedLine!);
                  }}
                >
                  <div className="flex">
                    <div className="flex flex-col items-center mr-3">
                      {/* Enhanced visibility with larger, brighter number indicator */}
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center text-sm font-bold text-white border-2 border-white shadow-md">
                        {index + 1}
                      </div>
                      {/* More pronounced connection line */}
                      {index < busStops.length - 1 && <div className="w-1 h-8 bg-primary-300"></div>}
                    </div>
                    
                    <div className="flex-1">
                      {/* More visible stop name */}
                      <div className="font-bold text-gray-900 text-base">{stop.name}</div>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Better visual indicator for ETA */}
                        <div className="bg-blue-100 rounded-lg p-2 flex items-center border border-blue-200">
                          <IconClock size={18} className="mr-1.5 text-blue-600" />
                          <span className="text-sm text-blue-800 font-medium">
                            {formatTime(stop.eta)}
                          </span>
                        </div>
                        {/* Better visual indicator for travel time */}
                        <div className="bg-green-100 rounded-lg p-2 flex items-center border border-green-200">
                          <IconRoute size={18} className="mr-1.5 text-green-600" />
                          <span className="text-sm text-green-800 font-medium">
                            {formatTime(stop.travelTimeTo)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
          
          {/* View Live Map Button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-4"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-sm text-gray-600">
                <IconMapPin size={18} className="mr-2 text-primary-500" />
                <span>{busStops.length} bus stops available</span>
              </div>
              <div className="flex items-center text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full">
                <IconClock size={14} className="mr-1" />
                <span>Updated recently</span>
              </div>
            </div>
            
            <button
              onClick={() => onDirectionSelect(selectedLine!.direction, selectedLine!)}
              className="w-full py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg flex items-center justify-center font-medium transition-colors"
            >
              <IconMapSearch size={18} className="mr-2" />
              View Live Bus Map
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  // Show view for selecting a direction with improved UI
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-default py-6 max-w-xl mx-auto">
        {/* Header with improved visual hierarchy */}
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

        {/* Direction Cards with modern design */}
        <div className="grid grid-cols-1 gap-5 max-w-md mx-auto">
          {directions.filter(d => d.line !== null).map((direction, index) => {
            const isSelected = selectedDirection === direction.key;
            const line = direction.line!;
            const isForward = direction.key === 'FORWARD';
            
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
                  bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer transition-all duration-300
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
                      {/* Direction icon */}
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center mr-4
                        ${isForward ? 'bg-green-100' : 'bg-orange-100'}
                      `}>
                        <div className={`
                          ${isForward ? 'text-green-600' : 'text-orange-600'}
                        `}>
                          {direction.icon}
                        </div>
                      </div>
                      
                      {/* Direction label */}
                      <div>
                        <h3 className="font-semibold text-gray-800 text-lg mb-1">
                          {direction.label}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {direction.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Selection indicator */}
                    {isSelected && (
                      <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                        <IconCheck size={16} stroke={3} className="text-white" />
                      </div>
                    )}
                  </div>
                  
                  {/* Route endpoints with improved visualization */}
                  {line.firstStop && line.lastStop && (
                    <div className="bg-gray-50 rounded-lg p-4 mt-2">
                      <div className="flex items-start">
                        {/* Visual route indicator */}
                        <div className="flex flex-col items-center mr-4">
                          <IconCircleDotFilled size={18} className={isForward ? "text-green-500" : "text-orange-500"} />
                          <div className="w-0.5 bg-gray-300 h-10"></div>
                          <IconCircle size={18} className="text-gray-400" />
                        </div>
                        
                        {/* Stop names and details */}
                        <div className="flex-1 flex flex-col justify-between">
                          <div className="mb-4">
                            <div className="text-sm font-medium text-gray-900">
                              {line.firstStop.name}
                            </div>
                            <div className="text-xs text-gray-500">Starting point</div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {line.lastStop.name}
                            </div>
                            <div className="text-xs text-gray-500">Final destination</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Call to action button */}
                  <div className="mt-4 flex">
                    <button
                      className={`
                        flex items-center justify-center w-full py-2.5 rounded-lg font-medium text-sm
                        ${isForward 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-orange-100 text-orange-700 hover:bg-orange-200'}
                      `}
                    >
                      <IconMapPin size={16} className="mr-1.5" />
                      Select Direction
                    </button>
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
