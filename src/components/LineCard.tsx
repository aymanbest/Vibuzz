import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconMapPin, 
  IconArrowRight, 
  IconClock,
  IconRoute,
  IconChevronRight
} from '@tabler/icons-react';
import type { BusLine } from '../types';

interface LineCardProps {
  line: BusLine;
  isSelected: boolean;
  onSelect: (lineId: string) => void;
  showDirection?: boolean;
}

const LineCard: React.FC<LineCardProps> = ({
  line,
  isSelected,
  onSelect,
  showDirection = false
}) => {
  const getDirectionIcon = () => {
    switch (line.direction) {
      case 'FORWARD':
        return <IconArrowRight size={16} className="text-emerald-500" />;
      case 'BACKWARD':
        return <IconArrowRight size={16} className="text-orange-500 rotate-180" />;
      default:
        return <IconRoute size={16} className="text-blue-500" />;
    }
  };

  const getDirectionColor = () => {
    switch (line.direction) {
      case 'FORWARD':
        return 'from-emerald-500 to-teal-600';
      case 'BACKWARD':
        return 'from-orange-500 to-red-600';
      default:
        return 'from-blue-500 to-indigo-600';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(line.id)}
      className={`
        relative cursor-pointer rounded-2xl border-2 transition-all duration-300 overflow-hidden
        ${isSelected 
          ? `bg-gradient-to-br ${getDirectionColor()} text-white shadow-xl border-transparent` 
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg'
        }
      `}
    >
      {/* Selection Indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
          className="absolute top-3 right-3 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
        </motion.div>
      )}

      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            {showDirection && (
              <div className="flex items-center">
                {getDirectionIcon()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className={`font-semibold text-sm truncate ${
                isSelected ? 'text-white' : 'text-gray-800'
              }`}>
                {line.label}
              </h4>
              {showDirection && (
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-white/80' : 'text-gray-500'
                }`}>
                  {line.direction === 'FORWARD' ? 'Forward' : 'Backward'}
                </span>
              )}
            </div>
          </div>
          
          <IconChevronRight 
            size={16} 
            className={`${isSelected ? 'text-white/60' : 'text-gray-400'} transition-transform duration-200`}
          />
        </div>

        {/* Route Info */}
        {line.firstStop && line.lastStop && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isSelected ? 'bg-white/60' : 'bg-emerald-400'
              }`} />
              <span className={`text-xs truncate ${
                isSelected ? 'text-white/90' : 'text-gray-600'
              }`}>
                {line.firstStop.name}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 ml-1">
              <div className={`w-0.5 h-4 rounded-full ${
                isSelected ? 'bg-white/40' : 'bg-gray-300'
              }`} />
            </div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                isSelected ? 'bg-white/60' : 'bg-red-400'
              }`} />
              <span className={`text-xs truncate ${
                isSelected ? 'text-white/90' : 'text-gray-600'
              }`}>
                {line.lastStop.name}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-gray-200/50 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <div className="flex items-center space-x-1">
              <IconMapPin size={12} />
              <span className={`${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                Live
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <IconClock size={12} />
              <span className={`${isSelected ? 'text-white/80' : 'text-gray-500'}`}>
                Real-time
              </span>
            </div>
          </div>
          
          {line.company && (
            <span className={`text-xs font-medium ${
              isSelected ? 'text-white/70' : 'text-gray-400'
            }`}>
              {line.company}
            </span>
          )}
        </div>
      </div>

      {/* Gradient Overlay for unselected cards */}
      {!isSelected && (
        <div className="absolute inset-0 opacity-0 hover:opacity-5 bg-gradient-to-br from-indigo-500 to-blue-600 transition-opacity duration-300 pointer-events-none" />
      )}
    </motion.div>
  );
};

export default LineCard;
