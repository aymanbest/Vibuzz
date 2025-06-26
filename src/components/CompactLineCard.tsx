import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconChevronRight
} from '@tabler/icons-react';
import type { BusLine } from '../types';

interface CompactLineCardProps {
  line: BusLine;
  isSelected: boolean;
  onSelect: (lineId: string) => void;
}

const CompactLineCard: React.FC<CompactLineCardProps> = ({
  line,
  isSelected,
  onSelect
}) => {
  const getDirectionColor = () => {
    return line.direction === 'FORWARD'
      ? 'bg-gradient-to-br from-green-500 to-green-600'
      : 'bg-gradient-to-br from-orange-500 to-orange-600';
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(line.id)}
      className={`
        relative cursor-pointer rounded-xl p-3 transition-all duration-200
        ${isSelected 
          ? 'bg-primary-50 border border-primary-200 shadow-sm' 
          : 'bg-white border border-gray-100 hover:border-gray-200'
        }
      `}
    >
      {/* Line number and details in a compact format */}
      <div className="flex items-center space-x-3">
        {/* Line number */}
        <div className={`
          flex-shrink-0 w-10 h-10 text-white rounded-lg flex items-center justify-center font-bold
          ${getDirectionColor()}
        `}>
          {line.line}
        </div>
        
        {/* Line details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h4 className="font-medium text-gray-900 truncate text-sm">
              {line.label || `Line ${line.line}`}
            </h4>
            
            <div className={`ml-1.5 text-xs px-1.5 py-0.5 rounded-full 
              ${line.direction === 'FORWARD' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-orange-100 text-orange-700'
              }`}
            >
              {line.direction === 'FORWARD' ? '→' : '←'}
            </div>
          </div>
          
          <div className="mt-0.5 text-xs text-gray-500 flex items-center">
            <span className="flex-grow">{line.firstStop?.name || 'N/A'}</span>
            <span className="mx-1 text-gray-400">•</span>
            <span className="flex-grow">{line.lastStop?.name || 'N/A'}</span>
          </div>
        </div>

        {/* Selection indicator */}
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
    </motion.div>
  );
};

export default CompactLineCard;
