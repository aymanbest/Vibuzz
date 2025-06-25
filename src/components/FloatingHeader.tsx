import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconBus, 
  IconMapPin,
  IconRoute,
  IconCurrentLocation,
  IconChevronLeft
} from '@tabler/icons-react';

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
  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: isMobile ? 'Select Route' : 'Choose Your Route',
          subtitle: 'Select a bus line to get started',
          icon: <IconBus size={isMobile ? 18 : 20} />,
          gradient: 'from-blue-500 to-indigo-600'
        };
      case 2:
        return {
          title: isMobile ? `Line ${selectedLineNumber}` : `Line ${selectedLineNumber} Direction`,
          subtitle: 'Choose your direction',
          icon: <IconRoute size={isMobile ? 18 : 20} />,
          gradient: 'from-purple-500 to-pink-600'
        };
      case 3:
        return {
          title: selectedLine?.label || 'Bus Tracking',
          subtitle: `${selectedDirection === 'FORWARD' ? 'Forward' : 'Backward'} Direction`,
          icon: <IconMapPin size={isMobile ? 18 : 20} />,
          gradient: 'from-emerald-500 to-teal-600'
        };
      default:
        return {
          title: 'Bus Tracker',
          subtitle: 'Real-time bus tracking',
          icon: <IconBus size={isMobile ? 18 : 20} />,
          gradient: 'from-blue-500 to-indigo-600'
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/85 backdrop-blur-2xl border-b border-gray-100/50"
    >
      <div className={`${isMobile ? 'px-3 py-1.5' : 'px-6 py-2.5'}`}>
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          {/* Left side - Back button and step info */}
          <div className="flex items-center space-x-2 md:space-x-3">
            {onBack && currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onBack}
                className={`flex items-center space-x-1 md:space-x-2 px-2 md:px-3 py-1.5 md:py-2 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-all duration-200 ${isMobile ? 'text-sm' : ''}`}
              >
                <IconChevronLeft size={isMobile ? 14 : 16} />
                {!isMobile && <span className="text-sm font-medium">Back</span>}
              </motion.button>
            )}
            
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className={`
                ${isMobile ? 'p-1.5' : 'p-2.5'} rounded-xl bg-gradient-to-r ${stepInfo.gradient} text-white shadow-lg
              `}>
                {stepInfo.icon}
              </div>
              
              <div>
                <h1 className={`
                  font-bold text-gray-900
                  ${isMobile ? 'text-sm' : 'text-lg'}
                `}>
                  {stepInfo.title}
                </h1>
                {!isMobile && (
                  <p className="text-gray-500 text-xs mt-0.5">
                    {stepInfo.subtitle}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right side - Progress and Location button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Compact Progress indicator */}
            <div className="flex items-center space-x-1 md:space-x-2">
              {[1, 2, 3].map((step, index) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`
                      ${isMobile ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-xs'} rounded-full flex items-center justify-center font-bold transition-all duration-300
                      ${step <= currentStep 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg scale-110' 
                        : 'bg-gray-100 text-gray-400'
                      }
                    `}
                  >
                    {step}
                  </div>
                  {index < 2 && (
                    <div className={`
                      ${isMobile ? 'w-4' : 'w-8'} h-0.5 mx-0.5 md:mx-1 transition-all duration-300
                      ${step < currentStep 
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600' 
                        : 'bg-gray-200'
                      }
                    `} />
                  )}
                </div>
              ))}
            </div>

            {showLocationButton && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLocationClick}
                className={`
                  flex items-center space-x-1 md:space-x-2 px-3 md:px-4 py-2 md:py-2.5 
                  bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                  rounded-xl text-white font-medium ${isMobile ? 'text-xs' : 'text-sm'} shadow-lg hover:shadow-xl
                  transition-all duration-200
                `}
              >
                <IconCurrentLocation size={isMobile ? 14 : 16} />
                <span className={isMobile ? 'hidden sm:inline' : 'inline'}>
                  Locate Me
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
