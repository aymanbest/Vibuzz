import React from 'react';
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
  showDirection = true 
}) => {
  return (
    <div
      onClick={() => onSelect(line.id)}
      className={`
        group relative cursor-pointer transition-all duration-300 transform hover:scale-105
        ${isSelected 
          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl' 
          : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-blue-300'
        }
        rounded-2xl p-6 shadow-lg hover:shadow-xl
      `}
    >
      {/* Line Number Badge */}
      <div className={`
        absolute -top-3 -right-3 w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-lg
        ${isSelected ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'}
      `}>
        {line.line}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Title */}
        <div>
          <h3 className={`
            text-lg font-bold mb-1
            ${isSelected ? 'text-white' : 'text-gray-800'}
          `}>
            {line.label}
          </h3>
          
          {showDirection && (
            <div className={`
              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
              ${isSelected 
                ? 'bg-white/20 text-white' 
                : line.direction === 'FORWARD' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-orange-100 text-orange-700'
              }
            `}>
              {line.direction === 'FORWARD' ? '➡️ Forward' : '⬅️ Backward'}
            </div>
          )}
        </div>

        {/* Route Info */}
        {line.firstStop && line.lastStop && (
          <div className={`
            text-sm space-y-1
            ${isSelected ? 'text-white/90' : 'text-gray-600'}
          `}>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              <span className="truncate">{line.firstStop.name}</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-400 rounded-full mr-2"></span>
              <span className="truncate">{line.lastStop.name}</span>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className={`
          flex items-center justify-between text-xs
          ${isSelected ? 'text-white/75' : 'text-gray-500'}
        `}>
          <span className="flex items-center">
            <span className="mr-1">🎫</span>
            {line.ticketPrice ? `${line.ticketPrice} MAD` : 'Free'}
          </span>
          <span className="flex items-center">
            <span className="mr-1">🚌</span>
            {line.type}
          </span>
        </div>
      </div>

      {/* Selection Indicator */}
      {isSelected && (
        <div className="absolute top-4 left-4">
          <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
            <span className="text-blue-600 text-sm">✓</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LineCard;
