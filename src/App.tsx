import { useMemo, useState, useEffect } from 'react';
import MapComponent from './components/MapComponent';
import LineSelector from './components/LineSelector';
import DirectionSelector from './components/DirectionSelector';
import StepIndicator from './components/StepIndicator';
import BusStopsList from './components/BusStopsList';
import { useBusStops, useBusPositions, useBusLines } from './hooks/useApi';
import { useUserLocation } from './hooks/useLocation';
import { findClosestBusStop } from './utils';
import type { BusPosition, BusLine } from './types';
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

  // Mobile Layout
  if (isMobile) {
    return (
      <div className="h-screen w-screen flex flex-col bg-gradient-to-br from-blue-50 to-purple-50">
        {/* Mobile Header */}
        <div className="bg-white shadow-lg border-b">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Bus Tracker
                </h1>
                <p className="text-sm text-gray-500">Real-time bus tracking</p>
              </div>
              {isLoading && (
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent"></div>
              )}
            </div>

            {/* Mobile Step Indicator */}
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${currentStep >= step.id 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                    }
                  `}>
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div className={`
                      w-8 h-0.5 mx-2
                      ${currentStep > step.id ? 'bg-blue-500' : 'bg-gray-200'}
                    `} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Content */}
        <div className="flex-1 overflow-hidden">
          {currentStep === 1 && (
            <div className="h-full overflow-y-auto p-4">
              <LineSelector
                lines={busLines}
                selectedLineId={selectedLineId}
                onLineSelect={handleLineSelect}
                loading={linesLoading}
                error={linesError}
                title="Choose Your Bus Line"
              />
            </div>
          )}

          {currentStep === 2 && availableDirections && (
            <div className="h-full overflow-y-auto p-4">
              <div className="mb-4">
                <button
                  onClick={handleBackToLines}
                  className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                >
                  ← Back to Lines
                </button>
              </div>
              <DirectionSelector
                forwardLine={availableDirections.forward}
                backwardLine={availableDirections.backward}
                selectedDirection={selectedDirection}
                onDirectionSelect={handleDirectionSelect}
              />
            </div>
          )}

          {currentStep === 3 && selectedLine && (
            <div className="h-full flex flex-col">
              {/* Mobile Controls */}
              <div className="bg-white shadow-sm border-b p-4">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={handleBackToDirections}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    ← Change Direction
                  </button>
                  <div className="text-sm text-gray-500">
                    {busStops.length} stops • {busPositions.length} active buses
                  </div>
                </div>
                <h2 className="text-lg font-bold text-gray-800">{selectedLine.label}</h2>
                <p className="text-sm text-gray-600">
                  {selectedDirection === 'FORWARD' ? 'Forward' : 'Backward'} Direction
                </p>
              </div>

              {/* Mobile Map */}
              <div className="flex-1 relative">
                <MapComponent
                  userLocation={userLocation}
                  busStops={busStops}
                  busPositions={busPositions}
                  routePath={routePath}
                  closestStop={closestStop}
                  selectedLine={selectedLine}
                />
                
                {/* Mobile Bus Stops Sheet */}
                <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl max-h-64 overflow-hidden">
                  <div className="p-4">
                    <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <BusStopsList
                      stops={busStops}
                      userLocation={userLocation}
                      closestStop={closestStop}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="h-screen w-screen flex bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Desktop Sidebar */}
      <div className="w-96 bg-white shadow-2xl flex flex-col">
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <h1 className="text-3xl font-bold mb-2">Bus Tracker</h1>
          <p className="text-blue-100">Real-time bus tracking system</p>
        </div>

        {/* Step Indicator */}
        <div className="p-6">
          <StepIndicator currentStep={currentStep} steps={STEPS} />
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {currentStep === 1 && (
            <LineSelector
              lines={busLines}
              selectedLineId={selectedLineId}
              onLineSelect={handleLineSelect}
              loading={linesLoading}
              error={linesError}
              title="Step 1: Choose Bus Line"
            />
          )}

          {currentStep === 2 && availableDirections && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800">Step 2: Select Direction</h3>
                <button
                  onClick={handleBackToLines}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  ← Change Line
                </button>
              </div>
              <DirectionSelector
                forwardLine={availableDirections.forward}
                backwardLine={availableDirections.backward}
                selectedDirection={selectedDirection}
                onDirectionSelect={handleDirectionSelect}
              />
            </div>
          )}

          {currentStep === 3 && selectedLine && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Step 3: Track Buses</h3>
                  <p className="text-sm text-gray-600">{selectedLine.label}</p>
                </div>
                <button
                  onClick={handleBackToDirections}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  ← Change Direction
                </button>
              </div>
              
              {/* Bus Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{busStops.length}</div>
                  <div className="text-sm text-green-700">Bus Stops</div>
                </div>
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{busPositions.length}</div>
                  <div className="text-sm text-blue-700">Active Buses</div>
                </div>
              </div>

              {/* Bus Stops List */}
              <BusStopsList
                stops={busStops}
                userLocation={userLocation}
                closestStop={closestStop}
              />
            </div>
          )}
        </div>
      </div>

      {/* Desktop Map */}
      <div className="flex-1 relative">
        {hasError && (
          <div className="absolute top-6 right-6 z-[1000] bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-xl shadow-lg max-w-md">
            <h4 className="font-semibold mb-2">⚠️ Error Loading Data</h4>
            <ul className="text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
        
        {currentStep === 3 && selectedLine ? (
          <MapComponent
            userLocation={userLocation}
            busStops={busStops}
            busPositions={busPositions}
            routePath={routePath}
            closestStop={closestStop}
            selectedLine={selectedLine}
          />
        ) : (
          <div className="h-full flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
            <div className="text-center">
              <div className="text-8xl mb-6">🗺️</div>
              <h2 className="text-3xl font-bold text-gray-700 mb-4">Ready to Track Buses</h2>
              <p className="text-gray-500 text-lg">
                {currentStep === 1 && "Choose a bus line to get started"}
                {currentStep === 2 && "Select your preferred direction"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[3000]">
          <div className="bg-white rounded-2xl p-8 flex items-center space-x-6 shadow-2xl">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <div>
              <div className="text-lg font-semibold text-gray-800">
                {linesLoading ? 'Loading bus lines...' : 
                 stopsLoading ? 'Loading bus stops...' : 
                 positionsLoading ? 'Loading bus positions...' : 
                 'Loading...'}
              </div>
              <div className="text-sm text-gray-500 mt-1">Please wait a moment...</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
