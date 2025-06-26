import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconMapPin, 
  IconArrowNarrowRight, 
  IconClock,
  IconRoute,
  IconChevronRight,
  IconCircleDot,
  IconCircleDotFilled
} from '@tabler/icons-react';
import type { BusLine } from '../types';

interface LineCardProps {
  line: BusLine;
  isSelected: boolean;
  onSelect: (lineId: string) => void;
  showDirection?: boolean;
  compact?: boolean;
}

const LineCard: React.FC<LineCardProps> = ({
  line,
  isSelected,
  onSelect,
  showDirection = false,
  compact = false
}) => {
  const getDirectionColor = () => {
    switch (line.direction) {
      case 'FORWARD':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'BACKWARD':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      default:
        return 'bg-primary-100 text-primary-700 border-primary-200';
    }
  };

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={() => onSelect(line.id)}
        className={`
          cursor-pointer rounded-lg border transition-all duration-300
          ${isSelected 
            ? 'bg-primary-50 border-primary-200 shadow-sm' 
            : 'bg-white hover:bg-gray-50 border-gray-100 hover:border-gray-200'
          }
        `}
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {/* Line number with improved visibility */}
              <div className={`
                flex-shrink-0 w-11 h-11 text-white rounded-lg flex items-center justify-center font-bold shadow-sm
                ${line.direction === 'FORWARD' 
                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                  : 'bg-gradient-to-br from-orange-500 to-orange-600'}
              `}>
                {line.line}
              </div>
              
              {/* Line details with improved hierarchy */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center">
                  <h4 className="font-medium text-gray-900 truncate">
                    {line.label}
                  </h4>
                  
                  {showDirection && (
                    <div className={`ml-2 text-xs px-2 py-0.5 rounded-full border ${getDirectionColor()}`}>
                      {line.direction === 'FORWARD' ? 'Outbound' : 'Return'}
                    </div>
                  )}
                </div>
                
                {(line.firstStop && line.lastStop) && (
                  <div className="text-xs text-gray-500 flex items-center mt-1">
                    <span className="truncate max-w-[100px]">{line.firstStop.name}</span>
                    <span className="mx-1.5 text-gray-400">→</span>
                    <span className="truncate max-w-[100px]">{line.lastStop.name}</span>
                  </div>
                )}
              </div>
            </div>
            
            {isSelected ? (
              <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            ) : (
              <div className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center">
                <IconChevronRight size={14} className="text-gray-400" />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(line.id)}
      className={`
        relative cursor-pointer rounded-xl border transition-all duration-200
        ${isSelected 
          ? 'bg-primary-50 border-primary-200 shadow-md' 
          : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300'
        }
      `}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          {/* Line number and label */}
          <div className="flex items-center space-x-3">
            <div className={`
              flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-white font-medium text-lg
              ${line.direction === 'FORWARD' ? 'bg-green-600' : 'bg-orange-500'}
            `}>
              {line.line}
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900">
                {line.label}
              </h4>
              
              {showDirection && (
                <span className={`text-sm inline-flex items-center ${
                  line.direction === 'FORWARD' ? 'text-green-700' : 'text-orange-700'
                }`}>
                  <IconArrowNarrowRight 
                    size={14} 
                    className={`mr-1 ${line.direction === 'BACKWARD' ? 'rotate-180' : ''}`} 
                  />
                  {line.direction === 'FORWARD' ? 'Forward Direction' : 'Return Direction'}
                </span>
              )}
            </div>
          </div>
          
          {isSelected && (
            <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center">
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          )}
        </div>

        {/* Route Info */}
        {line.firstStop && line.lastStop && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3">
            <div className="flex space-x-3">
              {/* Stops visualization */}
              <div className="flex flex-col items-center">
                <IconCircleDotFilled size={18} className="text-green-500" />
                <div className="w-0.5 bg-gray-300 h-6"></div>
                <IconCircleDot size={18} className="text-red-500" />
              </div>
              
              {/* Stop names */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {line.firstStop.name}
                  </div>
                  <div className="text-xs text-gray-500">Starting point</div>
                </div>
                <div className="mt-2">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {line.lastStop.name}
                  </div>
                  <div className="text-xs text-gray-500">Destination</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <IconMapPin size={14} className="mr-1 text-primary-500" />
              <span>Live tracking</span>
            </div>
            <div className="flex items-center">
              <IconClock size={14} className="mr-1 text-primary-500" />
              <span>Real-time</span>
            </div>
          </div>
          
          {line.company && (
            <span className="text-gray-400">
              {line.company}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LineCard;
