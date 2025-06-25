import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  IconMapPin, 
  IconCurrentLocation,
  IconBus,
  IconRoute,
  IconNavigation
} from '@tabler/icons-react';
import type { BusLine, BusStop, BusPosition, UserLocation } from '../types';
import MapComponent from './MapComponent';
import DesktopSidebar from './DesktopSidebar';
import MobileBottomSheet from './MobileBottomSheet';

interface BusTrackingViewProps {
  selectedLine: BusLine;
  busStops: BusStop[];
  busPositions: BusPosition[];
  routePath: Array<{ lat: number; lng: number }>;
  userLocation: UserLocation | null;
  closestStop: BusStop | null;
  isLoading: boolean;
  onLocateClick: () => void;
}

const BusTrackingView: React.FC<BusTrackingViewProps> = ({
  selectedLine,
  busStops,
  busPositions,
  routePath,
  userLocation,
  closestStop,
  isLoading,
  onLocateClick
}) => {
  const [isMobile] = useState(window.innerWidth < 1024);

  const handleStopSelect = (stop: BusStop) => {
    // Handle stop selection if needed
    console.log('Selected stop:', stop);
  };

  const handleRefreshLocation = () => {
    onLocateClick();
  };

  // If no map view is needed, show a summary view
  if (!userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl mb-6 shadow-xl">
              <IconMapPin size={32} className="text-white" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-4">
              {selectedLine.label}
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto mb-6">
              {selectedLine.direction === 'FORWARD' ? 'Forward' : 'Backward'} Direction
            </p>
            
            {/* Location Request */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onLocateClick}
              className="
                inline-flex items-center space-x-3 px-8 py-4 
                bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700
                rounded-2xl text-white font-semibold text-lg shadow-xl hover:shadow-2xl
                transition-all duration-300
              "
            >
              <IconCurrentLocation size={24} />
              <span>Enable Location for Live Tracking</span>
            </motion.button>
          </motion.div>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg p-6 border border-white/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <IconBus size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{busPositions.length}</h3>
              <p className="text-gray-600">Active Buses</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg p-6 border border-white/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <IconMapPin size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{busStops.length}</h3>
              <p className="text-gray-600">Bus Stops</p>
            </div>
            
            <div className="bg-white/80 backdrop-blur rounded-3xl shadow-lg p-6 border border-white/50 text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <IconRoute size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">{selectedLine.line}</h3>
              <p className="text-gray-600">Line Number</p>
            </div>
          </motion.div>

          {/* Route Info */}
          {selectedLine.firstStop && selectedLine.lastStop && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="bg-white/80 backdrop-blur rounded-3xl shadow-lg p-8 border border-white/50"
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <IconNavigation size={24} className="mr-3 text-indigo-600" />
                Route Information
              </h3>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-emerald-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedLine.firstStop.name}</p>
                    <p className="text-sm text-gray-600">Starting Point</p>
                  </div>
                </div>
                
                <div className="ml-2 w-0.5 h-8 bg-gray-300 rounded-full"></div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                  <div>
                    <p className="font-semibold text-gray-800">{selectedLine.lastStop.name}</p>
                    <p className="text-sm text-gray-600">Final Destination</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    );
  }

  // Full tracking view with map
  return (
    <div className="h-screen flex">
      {/* Desktop Sidebar */}
      {!isMobile && (
        <div className="w-96 bg-white shadow-xl">
          <DesktopSidebar
            userLocation={userLocation}
            closestStop={closestStop}
            busPositions={busPositions}
            busStops={busStops}
            selectedLine={selectedLine}
            loading={isLoading}
            error={null}
            locationAccuracy={null}
            onRefreshLocation={handleRefreshLocation}
            onStopSelect={handleStopSelect}
          />
        </div>
      )}

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapComponent
          busStops={busStops}
          busPositions={busPositions}
          routePath={routePath}
          userLocation={userLocation}
          closestStop={closestStop}
        />

        {/* Mobile Bottom Sheet */}
        {isMobile && (
          <MobileBottomSheet
            userLocation={userLocation}
            closestStop={closestStop}
            busPositions={busPositions}
            busStops={busStops}
            selectedLine={selectedLine}
            loading={isLoading}
            error={null}
            locationAccuracy={null}
            onRefreshLocation={handleRefreshLocation}
            onStopSelect={handleStopSelect}
          />
        )}
      </div>
    </div>
  );
};

export default BusTrackingView;
