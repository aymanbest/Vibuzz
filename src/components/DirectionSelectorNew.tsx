import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconArrowRight, 
  IconArrowLeft,
  IconMapPin,
  IconCheck,
  IconRoute
} from '@tabler/icons-react';
import type { BusLine } from '../types';

interface DirectionSelectorProps {
  forwardLine: BusLine | null;
  backwardLine: BusLine | null;
  selectedDirection: 'FORWARD' | 'BACKWARD' | null;
  onDirectionSelect: (direction: 'FORWARD' | 'BACKWARD', line: BusLine) => void;
}

const DirectionSelector: React.FC<DirectionSelectorProps> = ({
  forwardLine,
  backwardLine,
  selectedDirection,
  onDirectionSelect,
}) => {
  const directions = [
    {
      key: 'FORWARD' as const,
      line: forwardLine,
      icon: <IconArrowRight size={32} />,
      label: 'Forward Direction',
      description: 'Going Direction',
      gradient: 'from-green-400 to-emerald-600',
      hoverGradient: 'hover:from-green-500 hover:to-emerald-700',
      emoji: '→'
    },
    {
      key: 'BACKWARD' as const,
      line: backwardLine,
      icon: <IconArrowLeft size={32} />,
      label: 'Backward Direction',
      description: 'Return Direction',
      gradient: 'from-orange-400 to-red-600',
      hoverGradient: 'hover:from-orange-500 hover:to-red-700',
      emoji: '←'
    }
  ];

  const availableDirections = directions.filter(d => d.line !== null);

  if (availableDirections.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/50">
            <div className="text-center">
              <div className="text-8xl mb-6">🚌</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-3">No Directions Available</h3>
              <p className="text-gray-600 text-lg">
                This bus line doesn't have available directions at the moment.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Please select a different bus line or try again later.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl mb-6 shadow-2xl">
            <IconRoute size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Choose Your Direction
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the direction you want to travel in for this bus line
          </p>
        </motion.div>

        {/* Direction Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {availableDirections.map((direction, index) => {
            const isSelected = selectedDirection === direction.key;
            const line = direction.line!;
            
            return (
              <motion.div
                key={direction.key}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => onDirectionSelect(direction.key, line)}
                className={`
                  relative cursor-pointer transition-all duration-300 transform
                  ${isSelected 
                    ? `bg-gradient-to-br ${direction.gradient} text-white shadow-2xl scale-105` 
                    : `bg-white hover:bg-gray-50 border-2 border-gray-200 ${direction.hoverGradient} hover:text-white hover:border-transparent`
                  }
                  rounded-3xl p-8 shadow-lg hover:shadow-xl overflow-hidden
                `}
              >
                {/* Selection Indicator */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-6 right-6 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <IconCheck size={20} className="text-purple-600" />
                  </motion.div>
                )}

                {/* Direction Icon */}
                <div className={`
                  w-20 h-20 mx-auto rounded-2xl flex items-center justify-center text-4xl mb-6
                  ${isSelected 
                    ? 'bg-white/20 backdrop-blur text-white' 
                    : 'bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white'
                  }
                `}>
                  {direction.icon}
                </div>
                
                {/* Direction Info */}
                <div className="text-center space-y-4">
                  <div>
                    <h3 className={`text-2xl font-bold mb-2 ${
                      isSelected ? 'text-white' : 'text-gray-800'
                    }`}>
                      {direction.label}
                    </h3>
                    <p className={`text-sm ${
                      isSelected ? 'text-white/80' : 'text-gray-600'
                    }`}>
                      {direction.description}
                    </p>
                  </div>

                  {/* Route Preview */}
                  {line.firstStop && line.lastStop && (
                    <div className={`
                      rounded-2xl p-4 text-left space-y-3
                      ${isSelected 
                        ? 'bg-white/10 backdrop-blur border border-white/20' 
                        : 'bg-gray-50 border border-gray-200'
                      }
                    `}>
                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-3 h-3 rounded-full
                          ${isSelected ? 'bg-white/60' : 'bg-green-400'}
                        `} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}>
                            {line.firstStop.name}
                          </p>
                          <p className={`text-xs ${
                            isSelected ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            Starting point
                          </p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className={`
                          w-0.5 h-6 rounded-full
                          ${isSelected ? 'bg-white/40' : 'bg-gray-300'}
                        `} />
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className={`
                          w-3 h-3 rounded-full
                          ${isSelected ? 'bg-white/60' : 'bg-red-400'}
                        `} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${
                            isSelected ? 'text-white' : 'text-gray-800'
                          }`}>
                            {line.lastStop.name}
                          </p>
                          <p className={`text-xs ${
                            isSelected ? 'text-white/70' : 'text-gray-500'
                          }`}>
                            Final destination
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Decorative Background */}
                {isSelected && (
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 text-center"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg p-6 border border-white/50 max-w-2xl mx-auto">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <IconMapPin size={20} />
              <span className="text-sm font-medium">
                Real-time tracking will be available after selection
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DirectionSelector;
