import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconMapPin, 
  IconCurrentLocation,
  IconBus,
  IconClock,
  IconRoute,
  IconUsers,
  IconRefresh,
  IconList
} from '@tabler/icons-react';
import type { BusStop, BusPosition, BusLine, UserLocation } from '../types';
import MapComponent from './MapComponent';
import BusStopsList from './BusStopsList';

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
  const [showMap, setShowMap] = useState(false);
  const [activeView, setActiveView] = useState<'overview' | 'stops' | 'buses'>('overview');

  const handleLocateClick = () => {
    setShowMap(true);
    onLocateClick();
  };

  const stats = [
    {
      label: 'Active Buses',
      value: busPositions.length,
      icon: <IconBus size={24} />,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Total Stops',
      value: busStops.length,
      icon: <IconMapPin size={24} />,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Route Length',
      value: `${Math.round(routePath.length * 0.5)}km`,
      icon: <IconRoute size={24} />,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Next Bus',
      value: closestStop ? `${Math.round(closestStop.eta)}min` : 'N/A',
      icon: <IconClock size={24} />,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  if (showMap) {
    return (
      <div className="h-screen w-full relative">
        <MapComponent
          userLocation={userLocation}
          busStops={busStops}
          busPositions={busPositions}
          routePath={routePath}
          closestStop={closestStop}
          selectedLine={selectedLine}
        />
        
        {/* Map Controls */}
        <div className="absolute top-4 right-4 space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowMap(false)}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700"
          >
            <IconList size={20} />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onLocateClick}
            className="p-3 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700"
          >
            <IconRefresh size={20} />
          </motion.button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
            <IconMapPin size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            Track Your Bus
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            {selectedLine.label} - {selectedLine.direction === 'FORWARD' ? 'Forward' : 'Backward'} Direction
          </p>
          
          {/* Locate Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLocateClick}
            className="
              inline-flex items-center space-x-3 px-8 py-4 
              bg-gradient-to-r from-blue-500 to-indigo-600 
              text-white font-semibold rounded-2xl shadow-lg hover:shadow-xl 
              transition-all duration-200 text-lg
            "
          >
            <IconCurrentLocation size={24} />
            <span>Show on Map</span>
          </motion.button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/50"
            >
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-2xl ${stat.bgColor}`}>
                  <div className={stat.color}>
                    {stat.icon}
                  </div>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Navigation Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mb-8"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-2 shadow-lg border border-white/50 max-w-md mx-auto">
            <div className="grid grid-cols-3 gap-2">
              {[
                { key: 'overview', label: 'Overview', icon: <IconUsers size={16} /> },
                { key: 'stops', label: 'Stops', icon: <IconMapPin size={16} /> },
                { key: 'buses', label: 'Buses', icon: <IconBus size={16} /> }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveView(tab.key as any)}
                  className={`
                    flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-medium transition-all duration-200
                    ${activeView === tab.key
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }
                  `}
                >
                  {tab.icon}
                  <span className="text-sm">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Content Based on Active View */}
        <AnimatePresence mode="wait">
          {activeView === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Route Info */}
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-white/50">
                <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                  <IconRoute size={28} />
                  <span>Route Information</span>
                </h3>
                
                {selectedLine.firstStop && selectedLine.lastStop && (
                  <div className="space-y-6">
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-green-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Starting Point</h4>
                        <p className="text-gray-600">{selectedLine.firstStop.name}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-center">
                      <div className="w-1 h-16 bg-gradient-to-b from-green-500 to-red-500 rounded-full" />
                    </div>
                    
                    <div className="flex items-start space-x-4">
                      <div className="w-4 h-4 bg-red-500 rounded-full mt-2" />
                      <div>
                        <h4 className="font-semibold text-gray-800">Final Destination</h4>
                        <p className="text-gray-600">{selectedLine.lastStop.name}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Closest Stop */}
              {closestStop && (
                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-3xl p-8 shadow-lg text-white">
                  <h3 className="text-2xl font-bold mb-4 flex items-center space-x-3">
                    <IconCurrentLocation size={28} />
                    <span>Closest Stop</span>
                  </h3>
                  <div className="space-y-2">
                    <p className="text-xl font-semibold">{closestStop.name}</p>
                    <p className="text-white/90">Next bus arrives in {Math.round(closestStop.eta)} minutes</p>
                    <p className="text-white/90">Travel time: {Math.round(closestStop.travelTimeTo)} minutes</p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeView === 'stops' && (
            <motion.div
              key="stops"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-lg border border-white/50"
            >
              <BusStopsList
                stops={busStops}
                userLocation={userLocation}
                closestStop={closestStop}
              />
            </motion.div>
          )}

          {activeView === 'buses' && (
            <motion.div
              key="buses"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-lg border border-white/50"
            >
              <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-3">
                <IconBus size={28} />
                <span>Active Buses ({busPositions.length})</span>
              </h3>
              
              {busPositions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {busPositions.map((bus, index) => (
                    <div key={`${bus.trackerId}-${index}`} className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">
                          {bus.number}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">Bus #{bus.number}</h4>
                          <p className="text-sm text-gray-600">ID: {bus.trackerId}</p>
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm text-gray-600">
                        <p>Speed: {bus.speed} km/h</p>
                        <p>Heading: {bus.bearing}°</p>
                        <p>Last Update: {new Date(bus.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🚌</div>
                  <p className="text-gray-600 text-lg">No active buses at the moment</p>
                  <p className="text-gray-500 text-sm mt-2">Check back in a few minutes</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Loading Overlay */}
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-sm mx-4">
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"
                />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Loading...</h3>
                <p className="text-gray-600">Fetching real-time data</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default BusTrackingView;
