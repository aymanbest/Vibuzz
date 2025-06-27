import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconInfoCircle, 
  IconMapPin, 
  IconSettings, 
  IconRefresh,
  IconGps,
  IconAlertTriangle,
  IconCheck
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

interface LocationTipsProps {
  accuracy?: number | null;
  retryCount?: number;
  maxRetries?: number;
  canSelectManually?: boolean;
  onRefresh?: () => void;
}

const LocationTips: React.FC<LocationTipsProps> = ({ 
  accuracy, 
  retryCount = 0,
  maxRetries = 5,
  canSelectManually = false,
  onRefresh 
}) => {
  const { isDark } = useTheme();

  // Don't show tips if location is accurate enough
  if (accuracy && accuracy <= 50) {
    return (
      <div className={`rounded-xl p-4 border ${
        isDark 
          ? 'bg-green-900/30 border-green-700 text-green-300' 
          : 'bg-green-50 border-green-200 text-green-700'
      }`}>
        <div className="flex items-center space-x-3">
          <IconCheck size={20} className="text-green-500" />
          <div>
            <p className="font-medium">High Precision Location</p>
            <p className="text-sm opacity-90">GPS accuracy: ±{Math.round(accuracy)}m</p>
          </div>
        </div>
      </div>
    );
  }

  // Show manual selection option if GPS failed
  if (canSelectManually) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border ${
          isDark 
            ? 'bg-blue-900/30 border-blue-700' 
            : 'bg-blue-50 border-blue-200'
        }`}
      >
        <div className="flex items-start space-x-3">
          <IconMapPin size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
          <div className="flex-1">
            <h3 className={`font-medium mb-1 ${isDark ? 'text-blue-300' : 'text-blue-700'}`}>
              Manual Location Selection
            </h3>
            <p className={`text-sm mb-3 ${isDark ? 'text-blue-200' : 'text-blue-600'}`}>
              GPS location failed after {retryCount} attempts. Click on the map to set your location manually.
            </p>
            {onRefresh && (
              <div className="flex space-x-2">
                <button
                  onClick={onRefresh}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-blue-700 hover:bg-blue-600 text-blue-100' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <IconRefresh size={16} />
                  <span>Try GPS Again</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Show retry status for poor accuracy
  if (accuracy && accuracy > 100) {
    const isRetrying = retryCount < maxRetries;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-xl p-4 border ${
          isDark 
            ? 'bg-orange-900/30 border-orange-700' 
            : 'bg-orange-50 border-orange-200'
        }`}
      >
        <div className="flex items-start space-x-3">
          {isRetrying ? (
            <IconGps size={20} className={`${isDark ? 'text-orange-400' : 'text-orange-600'} animate-pulse`} />
          ) : (
            <IconAlertTriangle size={20} className={isDark ? 'text-orange-400' : 'text-orange-600'} />
          )}
          <div className="flex-1">
            <h3 className={`font-medium mb-1 ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
              {isRetrying ? 'Improving Location Accuracy' : 'Location Accuracy Warning'}
            </h3>
            <p className={`text-sm mb-2 ${isDark ? 'text-orange-200' : 'text-orange-600'}`}>
              Current accuracy: ±{Math.round(accuracy)}m
              {isRetrying && ` (Attempt ${retryCount + 1}/${maxRetries})`}
            </p>
            {isRetrying ? (
              <p className={`text-xs ${isDark ? 'text-orange-300' : 'text-orange-500'}`}>
                Trying to get better GPS signal...
              </p>
            ) : onRefresh && (
              <div className="flex space-x-2">
                <button
                  onClick={onRefresh}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isDark 
                      ? 'bg-orange-700 hover:bg-orange-600 text-orange-100' 
                      : 'bg-orange-100 hover:bg-orange-200 text-orange-700'
                  }`}
                >
                  <IconRefresh size={16} />
                  <span>Refresh Location</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  if (!accuracy) return null;

  return (
    <div className={`rounded-xl p-4 border ${
      isDark 
        ? 'bg-blue-900/20 border-blue-700/50' 
        : 'bg-blue-50 border-blue-200'
    }`}>
      <div className="flex items-start space-x-3">
        <IconInfoCircle size={20} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
        <div className="flex-1">
          <h4 className={`font-medium text-sm mb-2 ${
            isDark ? 'text-blue-300' : 'text-blue-800'
          }`}>
            Improve Location Accuracy
          </h4>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <IconMapPin size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={isDark ? 'text-blue-300' : 'text-blue-700'}>
                Move to an open area away from buildings
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs">
              <IconSettings size={14} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
              <span className={isDark ? 'text-blue-300' : 'text-blue-700'}>
                Enable high accuracy GPS in device settings
              </span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className={`text-xs ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                Current accuracy: ±{Math.round(accuracy)}m
              </span>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  className={`flex items-center space-x-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                    isDark 
                      ? 'bg-blue-800 hover:bg-blue-700 text-blue-200' 
                      : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
                  }`}
                >
                  <IconRefresh size={12} />
                  <span>Refresh</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationTips;
