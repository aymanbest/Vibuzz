import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingHeader from './components/FloatingHeader';
import LineSelector from './components/LineSelector';
import DirectionSelector from './components/DirectionSelector'; 
import BusTrackingView from './components/BusTrackingView';
import { useUserLocation } from './hooks/useLocation';
import { useBusLines, useBusStops, useBusPositions } from './hooks/useApi';
import { findClosestBusStop } from './utils';
import type { BusLine, BusPosition, BusStopResponse } from './types';
import './App.css';

// Custom hook to fetch bus stops for both directions
function useBusStopsForBothDirections(forwardLineId: string | null, backwardLineId: string | null) {
  const [forwardStops, setForwardStops] = useState<BusStopResponse | null>(null);
  const [backwardStops, setBackwardStops] = useState<BusStopResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStops = async () => {
      if (!forwardLineId && !backwardLineId) {
        setForwardStops(null);
        setBackwardStops(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const promises = [];
        
        if (forwardLineId) {
          promises.push(
            fetch(`https://BaseURL.com/routes/paths/${forwardLineId}`)
              .then(res => res.json())
              .catch(() => null)
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        if (backwardLineId) {
          promises.push(
            fetch(`https://BaseURL.com/routes/paths/${backwardLineId}`)
              .then(res => res.json())
              .catch(() => null)
          );
        } else {
          promises.push(Promise.resolve(null));
        }

        const [forwardData, backwardData] = await Promise.all(promises);
        
        setForwardStops(forwardData);
        setBackwardStops(backwardData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStops();
  }, [forwardLineId, backwardLineId]);

  return { forwardStops, backwardStops, loading, error };
}

// Define the steps for the user flow

function App() {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedLineNumber, setSelectedLineNumber] = useState<string | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'FORWARD' | 'BACKWARD' | null>(null);
  const [selectedLineId, setSelectedLineId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // API hooks
  const { location: userLocation, loading: locationLoading, error: locationError, refreshLocation } = useUserLocation();
  const { data: busLines, loading: linesLoading, error: linesError } = useBusLines('KENITRA');
  
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
  
  // Fetch stops for both directions when line number is selected
  const { forwardStops, backwardStops, loading: stopsLoading, error: stopsError } = useBusStopsForBothDirections(
    availableDirections?.forward?.id || null,
    availableDirections?.backward?.id || null
  );

  // Get bus stops data for the selected direction
  const { data: busStopsData, loading: currentStopsLoading, error: currentStopsError } = useBusStops(selectedLineId);
  
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

  const isLoading = locationLoading || linesLoading || stopsLoading || currentStopsLoading || positionsLoading;
  const errors = [locationError, linesError, stopsError, currentStopsError, positionsError].filter(Boolean);
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
    
    // Store the line ID in session storage to persist between refreshes
    window.sessionStorage.setItem('selectedLineId', line.id);
    window.sessionStorage.setItem('selectedDirection', direction);
    
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
    // Manually refresh location
    refreshLocation();
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
            forwardStops={forwardStops?.stops || []}
            backwardStops={backwardStops?.stops || []}
            userLocation={userLocation}
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
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
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
      <div className={`${currentStep === 3 ? 'pt-0' : isMobile ? 'pt-20' : 'pt-24'} min-h-screen`}>
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
          className="fixed bottom-6 right-6 bg-red-500/90 backdrop-blur text-white p-4 rounded-2xl shadow-xl max-w-sm z-50 border border-red-400/20"
        >
          <h4 className="font-semibold mb-2">Connection Error</h4>
          <p className="text-sm text-red-100">{errors[0]}</p>
        </motion.div>
      )}
    </div>
  );
}

export default App;
