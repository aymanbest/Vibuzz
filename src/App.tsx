import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-blue-50/30">
      <Routes>
        <Route path="/" element={<Navigate to="/lines" replace />} />
        <Route path="/lines" element={<LinesPage />} />
        <Route path="/lines/:lineNumber/directions" element={<DirectionsPage />} />
        <Route path="/lines/:lineNumber/directions/:direction/stops" element={<DirectionStopsPage />} />
        <Route path="/lines/:lineNumber/directions/:direction/tracking" element={<TrackingPage />} />
      </Routes>
    </div>
  );
}

// Individual page components
function LinesPage() {
  const navigate = useNavigate();
  const { data: busLines, loading: linesLoading, error: linesError } = useBusLines('KENITRA');

  const handleLineSelect = (lineId: string) => {
    const line = busLines.find(l => l.id === lineId);
    if (line) {
      navigate(`/lines/${line.line}/directions`);
    }
  };

  return (
    <div className="pt-24 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <LineSelector
            lines={busLines}
            selectedLineId={null}
            onLineSelect={handleLineSelect}
            loading={linesLoading}
            error={linesError}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DirectionsPage() {
  const { lineNumber } = useParams<{ lineNumber: string }>();
  const navigate = useNavigate();
  const { location: userLocation } = useUserLocation();
  const { data: busLines, loading: busLinesLoading } = useBusLines('KENITRA');

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

  const availableDirections = lineNumber ? linesByNumber[lineNumber] : null;
  
  // Fetch stops for both directions when line number is selected
  const { forwardStops, backwardStops } = useBusStopsForBothDirections(
    availableDirections?.forward?.id || null,
    availableDirections?.backward?.id || null
  );

  const handleDirectionSelect = (direction: 'FORWARD' | 'BACKWARD', _line: BusLine) => {
    navigate(`/lines/${lineNumber}/directions/${direction.toLowerCase()}/stops`);
  };

  // Show loading while bus lines are being fetched
  if (busLinesLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading directions...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we have loaded the data and still no directions found
  if (!busLinesLoading && !availableDirections) {
    return <Navigate to="/lines" replace />;
  }

  // Don't render if still loading or no directions available
  if (!availableDirections) {
    return null;
  }

  return (
    <div className="pt-24 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <DirectionSelector
            forwardLine={availableDirections.forward}
            backwardLine={availableDirections.backward}
            selectedDirection={null}
            onDirectionSelect={handleDirectionSelect}
            forwardStops={forwardStops?.stops || []}
            backwardStops={backwardStops?.stops || []}
            userLocation={userLocation}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function DirectionStopsPage() {
  const { lineNumber, direction } = useParams<{ lineNumber: string; direction: string }>();
  const navigate = useNavigate();
  const { location: userLocation } = useUserLocation();
  const { data: busLines, loading: busLinesLoading } = useBusLines('KENITRA');

  // Find the selected line based on line number and direction
  const selectedLine = useMemo(() => {
    return busLines.find(line => 
      line.line === lineNumber && 
      line.direction === direction?.toUpperCase()
    ) || null;
  }, [busLines, lineNumber, direction]);

  // Fetch stops for the selected direction
  const { forwardStops, backwardStops } = useBusStopsForBothDirections(
    direction?.toUpperCase() === 'FORWARD' ? selectedLine?.id || null : null,
    direction?.toUpperCase() === 'BACKWARD' ? selectedLine?.id || null : null
  );

  const stops = direction?.toUpperCase() === 'FORWARD' ? 
    (forwardStops?.stops || []) : 
    (backwardStops?.stops || []);

  const handleStopSelect = () => {
    navigate(`/lines/${lineNumber}/directions/${direction}/tracking`);
  };

  const handleBack = () => {
    navigate(`/lines/${lineNumber}/directions`);
  };

  // Show loading while bus lines are being fetched
  if (busLinesLoading) {
    return (
      <div className="pt-24 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading stops...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we have loaded the data and still no line found
  if (!busLinesLoading && !selectedLine) {
    return <Navigate to="/lines" replace />;
  }

  // Don't render if still loading or no line available
  if (!selectedLine) {
    return null;
  }

  return (
    <div className="pt-24 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          <DirectionSelector
            forwardLine={direction?.toUpperCase() === 'FORWARD' ? selectedLine : null}
            backwardLine={direction?.toUpperCase() === 'BACKWARD' ? selectedLine : null}
            selectedDirection={direction?.toUpperCase() as 'FORWARD' | 'BACKWARD'}
            onDirectionSelect={handleStopSelect}
            forwardStops={direction?.toUpperCase() === 'FORWARD' ? stops : []}
            backwardStops={direction?.toUpperCase() === 'BACKWARD' ? stops : []}
            userLocation={userLocation}
            showStopsView={true}
            onBack={handleBack}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function TrackingPage() {
  const { lineNumber, direction } = useParams<{ lineNumber: string; direction: string }>();
  const { location: userLocation, loading: locationLoading, refreshLocation } = useUserLocation();
  const { data: busLines, loading: busLinesLoading } = useBusLines('KENITRA');
  
  // Find the selected line
  const selectedLine = useMemo(() => {
    return busLines.find(line => 
      line.line === lineNumber && 
      line.direction === direction?.toUpperCase()
    ) || null;
  }, [busLines, lineNumber, direction]);

  const { data: busStopsData, loading: currentStopsLoading } = useBusStops(selectedLine?.id || null);
  const { data: busPositionsData, loading: positionsLoading } = useBusPositions(
    selectedLine?.company,
    selectedLine?.line,
    selectedLine?.direction
  );

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

  const isLoading = locationLoading || currentStopsLoading || positionsLoading;

  const handleLocationClick = () => {
    refreshLocation();
  };

  // Show loading while bus lines are being fetched
  if (busLinesLoading) {
    return (
      <div className="pt-0 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading tracking data...</p>
        </div>
      </div>
    );
  }

  // Only redirect if we have loaded the data and still no line found
  if (!busLinesLoading && !selectedLine) {
    return <Navigate to="/lines" replace />;
  }

  // Don't render if still loading or no line available
  if (!selectedLine) {
    return null;
  }

  return (
    <div className="pt-0 min-h-screen">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
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
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default App;
