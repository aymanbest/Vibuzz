import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, 
  IconBus, 
  IconRoute,
  IconMapPin,
  IconClock,
  IconTrendingUp,
  IconFilter,
  IconArrowRight
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
  const [searchQuery, setSearchQuery] = useState('');
  
  // Group lines by line number for better organization
  const lineGroups = React.useMemo(() => {
    const groups: { [key: string]: BusLine[] } = {};
    
    lines.forEach(line => {
      if (!groups[line.line]) {
        groups[line.line] = [];
      }
      groups[line.line].push(line);
    });
    
    return groups;
  }, [lines]);
  
  // Filter groups based on search query
  const filteredGroups = React.useMemo(() => {
    if (!searchQuery.trim()) return Object.entries(lineGroups);
    
    return Object.entries(lineGroups).filter(([number, groupLines]) => {
      const lowerQuery = searchQuery.toLowerCase();
      return (
        number.toLowerCase().includes(lowerQuery) || 
        groupLines.some(line => 
          line.label?.toLowerCase().includes(lowerQuery) ||
          line.firstStop?.name.toLowerCase().includes(lowerQuery) ||
          line.lastStop?.name.toLowerCase().includes(lowerQuery)
        )
      );
    });
  }, [lineGroups, searchQuery]);

  // Loading state with improved animation
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-md p-8 w-full max-w-md text-center"
        >
          <div className="relative w-20 h-20 mx-auto mb-6">
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 border-4 rounded-full border-primary-200 border-t-primary-600"
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <IconBus size={28} className="text-primary-600" />
            </div>
          </div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-2">Loading Routes</h3>
          <p className="text-gray-600">
            Finding available bus lines...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state with improved design
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md"
        >
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-error-100 rounded-full flex items-center justify-center">
              <span className="text-error-500 text-2xl">!</span>
            </div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Connection Error</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => window.location.reload()}
              className="px-6 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-all duration-200"
            >
              Try Again
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header with modern search */}
      <div className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="container-max py-4 px-4">
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Select Bus Line</h1>
              <p className="text-gray-500 text-sm">Choose from {lines.length} available routes</p>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative flex-1 sm:min-w-[280px]">
                <IconSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by number or destination..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 text-sm border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 shadow-sm"
                />
              </div>
              
              <button className="p-2.5 rounded-lg text-gray-600 hover:bg-gray-100 hover:text-gray-800 border border-gray-300">
                <IconFilter size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content with grid layout for better organization */}
      <div className="flex-1 overflow-y-auto pb-16">
        <div className="container-max py-6 px-4">
          <AnimatePresence mode="wait">
            {filteredGroups.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64"
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <IconSearch size={24} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No Routes Found</h3>
                  <p className="text-gray-500">Try a different search term</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {filteredGroups.map(([number, groupLines]) => (
                    <div key={number} className="col-span-1">
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <span className="w-10 h-10 rounded-lg bg-primary-100 text-primary-700 flex items-center justify-center font-bold text-lg mr-3">{number}</span>
                              <h3 className="font-semibold text-gray-800">Line {number}</h3>
                            </div>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{groupLines.length} routes</span>
                          </div>
                        </div>
                        
                        <div className="divide-y divide-gray-100">
                          {groupLines.map(line => (
                            <LineCard
                              key={line.id}
                              line={line}
                              isSelected={selectedLineId === line.id}
                              onSelect={onLineSelect}
                              showDirection
                              compact
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default LineSelector;
