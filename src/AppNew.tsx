import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHeader from './components/FloatingHeader';
import LineSelector from './components/LineSelector';
import DirectionSelector from './components/DirectionSelector'; 
import BusTrackingView from './components/BusTrackingView';
import { useUserLocation } from './hooks/useLocation';
import { useBusLines, useBusStops, useBusPositions } from './hooks/useApi';
import { findClosestBusStop } from './utils';
import type { BusLine, BusPosition } from './types';
import './App.css';

// Define the steps for the user flow
const STEPS = [
  {
    id: 1,
    title: 'Choose Bus Line',
    description: 'Select your preferred bus route',
    icon: '🚌'
  },
  {
    id: 2, 
    title: 'Select Direction',
    description: 'Choose forward or backward route',
    icon: '🧭'
  },
  {
    id: 3,
    title: 'Track Buses',
    description: 'View real-time bus locations',
    icon: '📍'
  }
];

function App() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLineNumber, setSelectedLineNumber] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'FORWARD' | 'BACKWARD' | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // API hooks
  const { location: userLocation, loading: locationLoading, error: locationError } = useUserLocation();
  const { data: busLines, loading: linesLoading, error: linesError } = useBusLines('KENITRA');
  const { data: busStopsData, loading: stopsLoading, error: stopsError } = useBusStops(selectedLineId);
  
  // Extract bus info from selected line
  const selectedLine = useMemo(() => {
    return busLines.find(line => line.id === selectedLineId) || null;
  }, [busLines, selectedLineId]);
  
  const { data: busPositionsData, loading: positionsLoading, error: positionsError } = useBusPositions(
    selectedLine?.company,
    selectedLine?.line,
    selectedLine?.direction
  );

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Group lines by line number for direction selection
  const linesByNumber = useMemo(() => {
    return busLines.reduce((acc, line) => {
      const key = line.line;
      if (!acc[key]) acc[key] = { forward: null, backward: null };
      if (line.direction === 'FORWARD') acc[key].forward = line;
      if (line.direction === 'BACKWARD') acc[key].backward = line;
      return acc;
    }, {} as Record<string, { forward: BusLine | null; backward: BusLine | null }>);
  }, [busLines]);

  // Get available directions for selected line number
  const availableDirections = selectedLineNumber ? linesByNumber[selectedLineNumber] : null;

  // Extract bus stops and route path
  const busStops = busStopsData?.stops || [];
  const routePath = useMemo(() => {
    if (!busStopsData?.path) return [];
    
    const validPath = busStopsData.path
      .filter(point => point.lat != null && point.lng != null)
      .map(point => ({
        lat: point.lat,
        lng: point.lng,
      }));
      
    return validPath;
  }, [busStopsData?.path]);

  // Extract bus positions
  const busPositions = useMemo(() => {
    if (!busPositionsData?.positions) return [];
    
    const allPositions: BusPosition[] = [];
    Object.values(busPositionsData.positions).forEach(positionArray => {
      if (Array.isArray(positionArray) && positionArray.length > 0) {
        allPositions.push(positionArray[0]);
      }
    });
    
    return allPositions;
  }, [busPositionsData]);

  // Find closest bus stop to user
  const closestStop = useMemo(() => {
    if (!userLocation || !busStops.length) return null;
    return findClosestBusStop(userLocation, busStops);
  }, [userLocation, busStops]);

  const isLoading = locationLoading || linesLoading || stopsLoading || positionsLoading;
  const errors = [locationError, linesError, stopsError, positionsError].filter(Boolean);
  const hasError = errors.length > 0;

  // Step handlers
  const handleLineSelect = (lineId: string) => {
    const line = busLines.find(l => l.id === lineId);
    if (line) {
      setSelectedLineNumber(line.line);
      setCurrentStep(2);
    }
  };

  const handleDirectionSelect = (direction: 'FORWARD' | 'BACKWARD', line: BusLine) => {
    setSelectedDirection(direction);
    setSelectedLineId(line.id);
    setCurrentStep(3);
  };

  const handleBackToLines = () => {
    setSelectedLineNumber(null);
    setSelectedDirection(null);
    setSelectedLineId(null);
    setCurrentStep(1);
  };

  const handleBackToDirections = () => {
    setSelectedDirection(null);
    setSelectedLineId(null);
    setCurrentStep(2);
  };

  const handleLocationClick = () => {
    // This will trigger the location hook to get user location
    // The map component will handle the actual map display
  };

  // Determine which view to show
  const renderCurrentView = () => {
    switch (currentStep) {
      case 1:
        return (
          <LineSelector
            lines={busLines}
            selectedLineId={selectedLineId}
            onLineSelect={handleLineSelect}
            loading={linesLoading}
            error={linesError}
          />
        );
      
      case 2:
        if (!availableDirections) return null;
        return (
          <DirectionSelector
            forwardLine={availableDirections.forward}
            backwardLine={availableDirections.backward}
            selectedDirection={selectedDirection}
            onDirectionSelect={handleDirectionSelect}
          />
        );
      
      case 3:
        if (!selectedLine) return null;
        return (
          <BusTrackingView
            selectedLine={selectedLine}
            busStops={busStops}
            busPositions={busPositions}
            routePath={routePath}
            userLocation={userLocation}
            closestStop={closestStop}
            isLoading={isLoading}
            onLocateClick={handleLocationClick}
          />
        );
      
      default:
        return null;
    }
  };

  const getBackHandler = () => {
    switch (currentStep) {
      case 2:
        return handleBackToLines;
      case 3:
        return handleBackToDirections;
      default:
        return undefined;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Floating Header */}
      <FloatingHeader
        currentStep={currentStep}
        selectedLineNumber={selectedLineNumber}
        selectedDirection={selectedDirection}
        selectedLine={selectedLine}
        onBack={getBackHandler()}
        showLocationButton={currentStep === 3}
        onLocationClick={handleLocationClick}
        isMobile={isMobile}
      />

      {/* Main Content */}
      <div className={`${currentStep === 3 ? 'pt-0' : 'pt-24'} min-h-screen`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          >
            {renderCurrentView()}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Error Display */}
      {hasError && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed bottom-6 right-6 bg-red-500 text-white p-4 rounded-2xl shadow-lg max-w-sm z-50"
        >
          <h4 className="font-semibold mb-2">Connection Error</h4>
          <p className="text-sm text-red-100">{errors[0]}</p>
        </motion.div>
      )}
    </div>
  );
}

export default App;
