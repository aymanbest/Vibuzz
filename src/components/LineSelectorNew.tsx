import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, 
  IconBus, 
  IconRoute,
  IconMapPin,
  IconClock,
  IconTrendingUp
} from '@tabler/icons-react';
import type { BusLine } from '../types';
import LineCard from './LineCard';

interface LineSelectorProps {
  lines: BusLine[];
  selectedLineId: string | null;
  onLineSelect: (lineId: string) => void;
  loading: boolean;
  error: string | null;
  title?: string;
}

const LineSelector: React.FC<LineSelectorProps> = ({
  lines,
  selectedLineId,
  onLineSelect,
  loading,
  error,
  title = "Select Bus Line"
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Group lines by line number
  const groupedLines = lines.reduce((acc, line) => {
    const key = line.line;
    if (!acc[key]) acc[key] = [];
    acc[key].push(line);
    return acc;
  }, {} as Record<string, BusLine[]>);

  // Filter based on search term
  const filteredGroups = Object.entries(groupedLines).filter(([lineNumber, lineVariations]) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      lineNumber.toLowerCase().includes(searchLower) ||
      lineVariations.some(line => 
        line.label.toLowerCase().includes(searchLower) ||
        line.firstStop?.name.toLowerCase().includes(searchLower) ||
        line.lastStop?.name.toLowerCase().includes(searchLower)
      )
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/50">
            <div className="flex flex-col items-center justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full mb-6"
              />
              <h3 className="text-2xl font-bold text-gray-800 mb-3">Loading Bus Lines</h3>
              <p className="text-gray-600 text-center max-w-md">
                Discovering available routes and schedules for your journey...
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/50">
            <div className="text-center">
              <div className="text-8xl mb-6">🚫</div>
              <h3 className="text-2xl font-bold text-red-600 mb-3">Connection Error</h3>
              <p className="text-red-500 mb-6 max-w-md mx-auto">{error}</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-2xl font-medium shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Try Again
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-3xl mb-6 shadow-2xl">
            <IconBus size={40} className="text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent mb-4">
            Choose Your Journey
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select your preferred bus line to start tracking real-time locations and schedules
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <IconSearch size={24} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search by line number, destination, or route..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="
                  w-full pl-16 pr-6 py-5 text-lg
                  bg-white/80 backdrop-blur-lg
                  border-2 border-white/50 rounded-2xl
                  focus:outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500
                  shadow-lg hover:shadow-xl transition-all duration-200
                  placeholder-gray-400
                "
              />
            </div>
          </div>
        </motion.div>
        
        {/* Content */}
        <AnimatePresence mode="wait">
          {filteredGroups.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-20"
            >
              <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-12 border border-white/50 max-w-2xl mx-auto">
                <div className="text-8xl mb-6">🔍</div>
                <h4 className="text-2xl font-bold text-gray-800 mb-3">
                  {searchTerm ? 'No matching routes found' : 'No bus lines available'}
                </h4>
                <p className="text-gray-600 text-lg">
                  {searchTerm ? 'Try adjusting your search terms or browse all available lines' : 'Please check back later for available routes'}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-12"
            >
              {filteredGroups.map(([lineNumber, lineVariations], groupIndex) => (
                <motion.div
                  key={lineNumber}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                  className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50"
                >
                  {/* Line Group Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                        {lineNumber}
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">
                          Line {lineNumber}
                        </h3>
                        <p className="text-gray-600 flex items-center space-x-2">
                          <IconRoute size={16} />
                          <span>{lineVariations.length} direction{lineVariations.length > 1 ? 's' : ''} available</span>
                        </p>
                      </div>
                    </div>
                    
                    <div className="hidden md:flex items-center space-x-6 text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <IconMapPin size={16} />
                        <span>Interactive Map</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <IconClock size={16} />
                        <span>Real-time</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Line Variations Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {lineVariations.map((line, index) => (
                      <motion.div
                        key={line.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                      >
                        <LineCard
                          line={line}
                          isSelected={selectedLineId === line.id}
                          onSelect={onLineSelect}
                          showDirection={true}
                        />
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Stats Footer */}
        {lines.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-16"
          >
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 border border-white/50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-indigo-600">
                    {Object.keys(groupedLines).length}
                  </div>
                  <p className="text-gray-600 flex items-center justify-center space-x-2">
                    <IconTrendingUp size={16} />
                    <span>Total Lines</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-blue-600">
                    {lines.length}
                  </div>
                  <p className="text-gray-600 flex items-center justify-center space-x-2">
                    <IconRoute size={16} />
                    <span>Total Routes</span>
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-purple-600">
                    {filteredGroups.length}
                  </div>
                  <p className="text-gray-600 flex items-center justify-center space-x-2">
                    <IconSearch size={16} />
                    <span>Showing</span>
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default LineSelector;
