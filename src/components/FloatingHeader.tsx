import React from 'react';
import { motion } from 'framer-motion';
import { 
  IconBus, 
  IconArrowLeft, 
  IconMapPin,
  IconRoute,
  IconCurrentLocation
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
          title: 'Choose Your Route',
          subtitle: 'Select a bus line to get started',
          icon: <IconBus size={24} />,
          color: 'from-blue-500 to-indigo-600'
        };
      case 2:
        return {
          title: `Line ${selectedLineNumber}`,
          subtitle: 'Choose your direction',
          icon: <IconRoute size={24} />,
          color: 'from-purple-500 to-pink-600'
        };
      case 3:
        return {
          title: `${selectedLine?.label || 'Bus Tracking'}`,
          subtitle: `${selectedDirection === 'FORWARD' ? 'Forward' : 'Backward'} Direction`,
          icon: <IconMapPin size={24} />,
          color: 'from-green-500 to-emerald-600'
        };
      default:
        return {
          title: 'Bus Tracker',
          subtitle: 'Real-time bus tracking',
          icon: <IconBus size={24} />,
          color: 'from-blue-500 to-indigo-600'
        };
    }
  };

  const stepInfo = getStepInfo();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className={`
        fixed top-0 left-0 right-0 z-50
        ${isMobile ? 'px-4 pt-2 pb-4' : 'px-6 pt-4 pb-6'}
      `}
    >
      <div className={`
        bg-gradient-to-r ${stepInfo.color}
        backdrop-blur-lg bg-opacity-90 
        rounded-2xl shadow-2xl border border-white/20
        ${isMobile ? 'p-4' : 'p-6'}
      `}>
        <div className="flex items-center justify-between">
          {/* Left side - Back button and step info */}
          <div className="flex items-center space-x-4">
            {onBack && currentStep > 1 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onBack}
                className="
                  p-2 rounded-xl bg-white/20 hover:bg-white/30 
                  text-white transition-all duration-200
                  backdrop-blur-sm
                "
              >
                <IconArrowLeft size={20} />
              </motion.button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="
                p-2 rounded-xl bg-white/20 backdrop-blur-sm
                text-white
              ">
                {stepInfo.icon}
              </div>
              
              <div>
                <h1 className={`
                  font-bold text-white
                  ${isMobile ? 'text-lg' : 'text-xl'}
                `}>
                  {stepInfo.title}
                </h1>
                <p className={`
                  text-white/80
                  ${isMobile ? 'text-sm' : 'text-base'}
                `}>
                  {stepInfo.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Location button */}
          {showLocationButton && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onLocationClick}
              className="
                flex items-center space-x-2 px-4 py-2 
                bg-white/20 hover:bg-white/30 
                rounded-xl text-white font-medium
                transition-all duration-200 backdrop-blur-sm
                border border-white/30
              "
            >
              <IconCurrentLocation size={18} />
              <span className={isMobile ? 'hidden' : 'block'}>
                Locate
              </span>
            </motion.button>
          )}
        </div>

        {/* Progress indicator */}
        <div className="mt-4 flex space-x-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`
                h-1 rounded-full transition-all duration-300
                ${step <= currentStep 
                  ? 'bg-white flex-1' 
                  : 'bg-white/30 flex-1'
                }
              `}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingHeader;
