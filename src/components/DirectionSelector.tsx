import React from 'react';
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
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
        Choose Direction
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forward Direction */}
        {forwardLine && (
          <div
            onClick={() => onDirectionSelect('FORWARD', forwardLine)}
            className={`
              group cursor-pointer transition-all duration-300 transform hover:scale-105
              ${selectedDirection === 'FORWARD'
                ? 'bg-gradient-to-br from-green-400 to-blue-500 text-white shadow-2xl scale-105'
                : 'bg-gradient-to-br from-green-50 to-blue-50 hover:from-green-100 hover:to-blue-100 border-2 border-green-200 hover:border-green-400'
              }
              rounded-2xl p-8 shadow-lg hover:shadow-xl
            `}
          >
            <div className="text-center space-y-4">
              {/* Direction Icon */}
              <div className={`
                w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl
                ${selectedDirection === 'FORWARD' 
                  ? 'bg-white/20 backdrop-blur' 
                  : 'bg-green-500 text-white group-hover:bg-green-600'
                }
              `}>
                ➡️
              </div>
              
              {/* Direction Label */}
              <div>
                <h4 className={`text-2xl font-bold mb-2 ${
                  selectedDirection === 'FORWARD' ? 'text-white' : 'text-gray-800'
                }`}>
                  Forward
                </h4>
                <p className={`text-sm ${
                  selectedDirection === 'FORWARD' ? 'text-white/80' : 'text-gray-600'
                }`}>
                  Going Direction
                </p>
              </div>

              {/* Route Preview */}
              {forwardLine.firstStop && forwardLine.lastStop && (
                <div className={`
                  bg-white/10 backdrop-blur rounded-xl p-4 text-left
                  ${selectedDirection !== 'FORWARD' ? 'bg-gray-50 border border-gray-200' : ''}
                `}>
                  <div className={`space-y-2 text-sm ${
                    selectedDirection === 'FORWARD' ? 'text-white/90' : 'text-gray-700'
                  }`}>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                      <span className="font-medium">From:</span>
                    </div>
                    <p className="ml-6 text-xs truncate">{forwardLine.firstStop.name}</p>
                    
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-3"></span>
                      <span className="font-medium">To:</span>
                    </div>
                    <p className="ml-6 text-xs truncate">{forwardLine.lastStop.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Selection Indicator */}
            {selectedDirection === 'FORWARD' && (
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-green-600 text-lg">✓</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Backward Direction */}
        {backwardLine && (
          <div
            onClick={() => onDirectionSelect('BACKWARD', backwardLine)}
            className={`
              group cursor-pointer transition-all duration-300 transform hover:scale-105
              ${selectedDirection === 'BACKWARD'
                ? 'bg-gradient-to-br from-orange-400 to-red-500 text-white shadow-2xl scale-105'
                : 'bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100 border-2 border-orange-200 hover:border-orange-400'
              }
              rounded-2xl p-8 shadow-lg hover:shadow-xl
            `}
          >
            <div className="text-center space-y-4">
              {/* Direction Icon */}
              <div className={`
                w-16 h-16 mx-auto rounded-full flex items-center justify-center text-3xl
                ${selectedDirection === 'BACKWARD' 
                  ? 'bg-white/20 backdrop-blur' 
                  : 'bg-orange-500 text-white group-hover:bg-orange-600'
                }
              `}>
                ⬅️
              </div>
              
              {/* Direction Label */}
              <div>
                <h4 className={`text-2xl font-bold mb-2 ${
                  selectedDirection === 'BACKWARD' ? 'text-white' : 'text-gray-800'
                }`}>
                  Backward
                </h4>
                <p className={`text-sm ${
                  selectedDirection === 'BACKWARD' ? 'text-white/80' : 'text-gray-600'
                }`}>
                  Return Direction
                </p>
              </div>

              {/* Route Preview */}
              {backwardLine.firstStop && backwardLine.lastStop && (
                <div className={`
                  bg-white/10 backdrop-blur rounded-xl p-4 text-left
                  ${selectedDirection !== 'BACKWARD' ? 'bg-gray-50 border border-gray-200' : ''}
                `}>
                  <div className={`space-y-2 text-sm ${
                    selectedDirection === 'BACKWARD' ? 'text-white/90' : 'text-gray-700'
                  }`}>
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-green-400 rounded-full mr-3"></span>
                      <span className="font-medium">From:</span>
                    </div>
                    <p className="ml-6 text-xs truncate">{backwardLine.firstStop.name}</p>
                    
                    <div className="flex items-center">
                      <span className="w-3 h-3 bg-red-400 rounded-full mr-3"></span>
                      <span className="font-medium">To:</span>
                    </div>
                    <p className="ml-6 text-xs truncate">{backwardLine.lastStop.name}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Selection Indicator */}
            {selectedDirection === 'BACKWARD' && (
              <div className="absolute top-4 right-4">
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                  <span className="text-orange-600 text-lg">✓</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* No directions available */}
      {!forwardLine && !backwardLine && (
        <div className="text-center py-12 text-gray-500">
          <div className="text-6xl mb-4">🚌</div>
          <p className="text-lg">No directions available</p>
          <p className="text-sm">Please select a different bus line</p>
        </div>
      )}
    </div>
  );
};

export default DirectionSelector;
