import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconBus, 
  IconArrowRight, 
  IconArrowLeft,
  IconCoin,
  IconCheck
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
  showDirection = true 
}) => {
  const directionConfig = {
    FORWARD: {
      icon: <IconArrowRight size={20} />,
      label: 'Forward',
      gradient: 'from-green-500 to-emerald-600',
      bgColor: 'bg-green-100',
      textColor: 'text-green-700'
    },
    BACKWARD: {
      icon: <IconArrowLeft size={20} />,
      label: 'Backward', 
      gradient: 'from-orange-500 to-red-600',
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700'
    }
  };

  const config = directionConfig[line.direction];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(line.id)}
      className={`
        relative cursor-pointer transition-all duration-300
        ${isSelected 
          ? `bg-gradient-to-br ${config.gradient} text-white shadow-2xl transform scale-105` 
          : 'bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-indigo-300 hover:shadow-lg'
        }
        rounded-2xl p-6 shadow-md
        overflow-hidden
      `}
    >
      {/* Selection indicator */}
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-4 right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg"
        >
          <IconCheck size={16} className="text-indigo-600" />
        </motion.div>
      )}

      {/* Line number badge */}
      <div className={`
        absolute -top-3 -left-3 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg
        ${isSelected ? 'bg-white text-indigo-600' : `bg-gradient-to-br ${config.gradient} text-white`}
      `}>
        {line.line}
      </div>

      {/* Content */}
      <div className="space-y-4 mt-4">
        {/* Title */}
        <div>
          <h3 className={`
            text-lg font-bold mb-2
            ${isSelected ? 'text-white' : 'text-gray-800'}
          `}>
            {line.label}
          </h3>
          
          {showDirection && (
            <div className={`
              inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-medium space-x-2
              ${isSelected 
                ? 'bg-white/20 text-white backdrop-blur-sm' 
                : `${config.bgColor} ${config.textColor}`
              }
            `}>
              {config.icon}
              <span>{config.label}</span>
            </div>
          )}
        </div>

        {/* Route Info */}
        {line.firstStop && line.lastStop && (
          <div className={`
            space-y-3 text-sm
            ${isSelected ? 'text-white/90' : 'text-gray-600'}
          `}>
            <div className="flex items-start space-x-3">
              <div className={`
                w-3 h-3 rounded-full mt-1 flex-shrink-0
                ${isSelected ? 'bg-white/60' : 'bg-green-400'}
              `} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{line.firstStop.name}</p>
                <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                  Starting point
                </p>
              </div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className={`
                w-0.5 h-8 rounded-full
                ${isSelected ? 'bg-white/40' : 'bg-gray-300'}
              `} />
            </div>
            
            <div className="flex items-start space-x-3">
              <div className={`
                w-3 h-3 rounded-full mt-1 flex-shrink-0
                ${isSelected ? 'bg-white/60' : 'bg-red-400'}
              `} />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{line.lastStop.name}</p>
                <p className={`text-xs ${isSelected ? 'text-white/70' : 'text-gray-500'}`}>
                  Final destination
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className={`
          flex items-center justify-between text-xs pt-4 border-t
          ${isSelected ? 'text-white/75 border-white/20' : 'text-gray-500 border-gray-200'}
        `}>
          <span className="flex items-center space-x-1">
            <IconCoin size={14} />
            <span>{line.ticketPrice ? `${line.ticketPrice} MAD` : 'Free'}</span>
          </span>
          <span className="flex items-center space-x-1">
            <IconBus size={14} />
            <span>{line.type}</span>
          </span>
        </div>
      </div>

      {/* Decorative background pattern */}
      {isSelected && (
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-16 translate-x-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-12 -translate-x-12" />
        </div>
      )}
    </motion.div>
  );
};

export default LineCard;
