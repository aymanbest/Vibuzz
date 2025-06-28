import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconBus, 
  IconMapPin,
  IconRoute,
  IconCurrentLocation,
  IconChevronLeft,
  IconCircleCheck
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';

interface FloatingHeaderProps {
  currentStep: number;
  selectedLineNumber?: string | null;
  selectedDirection?: 'FORWARD' | 'BACKWARD' | null;
  selectedLine?: any;
  onBack?: () => void;
  showLocationButton?: boolean;
  onLocationClick?: () => void;
  isMobile?: boolean;
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  currentStep,
  selectedLineNumber,
  selectedDirection,
  selectedLine,
  onBack,
  showLocationButton = false,
  onLocationClick,
  isMobile = false
}) => {
  const { isDark } = useTheme();
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: isMobile ? 'Select Line' : 'Choose Bus Line',
          subtitle: 'Select your bus route',
          icon: <IconBus size={isMobile ? 18 : 20} />,
          color: 'primary-600'
        };
      case 2:
        return {
          title: isMobile ? `Line ${selectedLineNumber}` : `Line ${selectedLineNumber}`,
          subtitle: 'Select direction',
          icon: <IconRoute size={isMobile ? 18 : 20} />,
          color: selectedDirection === 'FORWARD' ? 'green-600' : 'orange-500'
        };
      case 3:
        return {
          title: selectedLine?.label || 'Bus Tracking',
          subtitle: `${selectedDirection === 'FORWARD' ? 'Outbound' : 'Return'} Route`,
          icon: <IconMapPin size={isMobile ? 18 : 20} />,
          color: selectedDirection === 'FORWARD' ? 'green-600' : 'orange-500'
        };
      default:
        return {
          title: 'Vibuzz',
          subtitle: 'Real-time tracking',
          icon: <IconBus size={isMobile ? 18 : 20} />,
          color: 'primary-600'
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 shadow-sm ${
        isDark ? 'bg-gray-900 border-b border-gray-700' : 'bg-white'
      }`}
    >
      <div className="px-4 py-2">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Left side - Back button and step info */}
          <div className="flex items-center">
            {onBack && currentStep > 1 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className={`mr-3 p-2 rounded-full transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:bg-gray-800 hover:text-gray-300' 
                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                }`}
                aria-label="Go back"
              >
                <IconChevronLeft size={isMobile ? 18 : 20} />
              </motion.button>
            )}
            
            <div className="flex items-center">
              <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3
                bg-${stepInfo.color}
              `}>
                {stepInfo.icon}
              </div>
              
              <div>
                <h1 className={`font-medium text-base ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {stepInfo.title}
                </h1>
                <p className={`text-xs ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  {stepInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Progress and Location button */}
          <div className="flex items-center space-x-3">
            {/* Step Indicators */}
            <div className="hidden sm:flex items-center space-x-1">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`
                    w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium
                    ${step === currentStep 
                      ? isDark 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-primary-600 text-white'
                      : step < currentStep
                        ? isDark
                          ? 'bg-purple-900/50 text-purple-400'
                          : 'bg-primary-100 text-primary-700'
                        : isDark
                          ? 'bg-gray-700 text-gray-400'
                          : 'bg-gray-100 text-gray-400'
                    }
                    ${step < currentStep ? isDark ? 'ring-1 ring-purple-600' : 'ring-1 ring-primary-600' : ''}
                  `}
                >
                  {step < currentStep ? (
                    <IconCircleCheck size={16} className={isDark ? 'text-purple-600' : 'text-primary-600'} />
                  ) : (
                    step
                  )}
                </div>
              ))}
            </div>
            
            {/* Mobile Steps */}
            <div className={`sm:hidden text-xs ${
              isDark ? 'text-gray-400' : 'text-gray-500'
            }`}>
              Step {currentStep} of 3
            </div>

            {/* Location Button */}
            {showLocationButton && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={onLocationClick}
                className={`
                  flex items-center px-3 py-1.5 rounded-lg text-sm
                  ${isDark 
                    ? 'bg-purple-600 text-white hover:bg-purple-700' 
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                  }
                `}
              >
                <IconCurrentLocation size={16} className="mr-1.5" />
                <span className={isMobile ? 'hidden sm:inline' : ''}>
                  My Location
                </span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingHeader;
