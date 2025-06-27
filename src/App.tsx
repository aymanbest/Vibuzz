import { useState, useEffect, useMemo } from 'react';
import { Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { IconBus } from '@tabler/icons-react';
import LineSelector from './components/LineSelector';
import DirectionSelector from './components/DirectionSelector'; 
import BusTrackingView from './components/BusTrackingView';
import ThemeToggle from './components/ThemeToggle';
import { useUserLocation } from './hooks/useLocation';
import { useBusLines, useBusStops, useBusPositions } from './hooks/useApi';
import { findClosestBusStop } from './utils';
import { useTheme } from './contexts/ThemeContext';
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
  const { isDark } = useTheme();
  
  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${
      isDark 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-slate-50 to-blue-50/30'
    }`}>
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
  const { isDark } = useTheme();
  const { data: busLines, loading: linesLoading, error: linesError } = useBusLines('KENITRA');

  const handleLineSelect = (lineId: string) => {
    const line = busLines.find(l => l.id === lineId);
    if (line) {
      navigate(`/lines/${line.line}/directions`);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Enhanced Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-purple-900 to-indigo-900' 
          : 'bg-gradient-to-r from-blue-600 to-purple-700'
      }`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <IconBus size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Bus Tracker</h1>
                <p className="text-primary-100 text-sm">Choose your bus line to get started</p>
              </div>
            </div>
            
            {/* Enhanced Step indicator */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                  1
                </div>
                <div className="w-6 h-0.5 bg-white/30"></div>
                <div className="w-8 h-8 bg-white/20 text-white/60 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div className="w-6 h-0.5 bg-white/20"></div>
                <div className="w-8 h-8 bg-white/20 text-white/60 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">Step 1 of 3</p>
                <p className="text-primary-200 text-xs">Select Bus Line</p>
              </div>
              <ThemeToggle />
            </div>

            {/* Mobile step indicator */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                1
              </div>
              <span className="text-primary-100 text-sm">/ 3</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div className="h-full bg-white w-1/3 transition-all duration-500"></div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24">
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
    </div>
  );
}

function DirectionsPage() {
  const { lineNumber } = useParams<{ lineNumber: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
  if (!busLinesLoading && busLines.length > 0 && !availableDirections) {
    return <Navigate to="/lines" replace />;
  }

  // Show error if no lines loaded at all
  if (!busLinesLoading && busLines.length === 0) {
    return <Navigate to="/lines" replace />;
  }

  // Don't render if still loading or no directions available yet
  if (busLinesLoading || !availableDirections) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Enhanced Header for Step 2 */}
      <header className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-purple-900 to-indigo-900' 
          : 'bg-gradient-to-r from-blue-600 to-purple-700'
      }`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <IconBus size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Line {lineNumber}</h1>
                <p className="text-primary-100 text-sm">Choose your direction</p>
              </div>
            </div>
            
            {/* Enhanced Step indicator */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/30 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="w-6 h-0.5 bg-white"></div>
                <div className="w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                  2
                </div>
                <div className="w-6 h-0.5 bg-white/30"></div>
                <div className="w-8 h-8 bg-white/20 text-white/60 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">Step 2 of 3</p>
                <p className="text-primary-200 text-xs">Select Direction</p>
              </div>
              <ThemeToggle />
            </div>

            {/* Mobile step indicator */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-primary-100 text-sm">/ 3</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div className="h-full bg-white w-2/3 transition-all duration-500"></div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24">
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
    </div>
  );
}

function DirectionStopsPage() {
  const { lineNumber, direction } = useParams<{ lineNumber: string; direction: string }>();
  const navigate = useNavigate();
  const { isDark } = useTheme();
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
    <div className="min-h-screen">
      {/* Enhanced Header for Step 2.5 (Stops) */}
      <header className={`fixed top-0 left-0 right-0 z-50 shadow-lg ${
        isDark 
          ? 'bg-gradient-to-r from-purple-900 to-indigo-900' 
          : 'bg-gradient-to-r from-blue-600 to-purple-700'
      }`}>
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center space-x-4">
              <button 
                onClick={handleBack}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 12H5M12 19L5 12L12 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30">
                <IconBus size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Line {lineNumber} • {direction?.toUpperCase() === 'FORWARD' ? 'Outbound' : 'Return'}</h1>
                <p className="text-primary-100 text-sm">View all bus stops ({stops.length} stops)</p>
              </div>
            </div>
            
            {/* Enhanced Step indicator */}
            <div className="hidden sm:flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white/30 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div className="w-6 h-0.5 bg-white/50"></div>
                <div className="w-8 h-8 bg-white text-primary-600 rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                  2
                </div>
                <div className="w-6 h-0.5 bg-white/30"></div>
                <div className="w-8 h-8 bg-white/20 text-white/60 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
              </div>
              <div className="text-right">
                <p className="text-white text-sm font-medium">Step 2 of 3</p>
                <p className="text-primary-200 text-xs">View Bus Stops</p>
              </div>
              <ThemeToggle />
            </div>

            {/* Mobile step indicator */}
            <div className="sm:hidden flex items-center space-x-2">
              <div className="w-6 h-6 bg-white text-primary-600 rounded-full flex items-center justify-center text-xs font-bold">
                2
              </div>
              <span className="text-primary-100 text-sm">/ 3</span>
              <ThemeToggle />
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-white/20">
          <div className="h-full bg-white w-4/5 transition-all duration-500"></div>
        </div>
      </header>

      {/* Content */}
      <div className="pt-24">
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
