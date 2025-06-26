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
  IconArrowRight,
  IconStarFilled,
  IconGridDots,
  IconList,
  IconCircleDot
} from '@tabler/icons-react';
import type { BusLine } from '../types';
import LineCard from './LineCard';
import CompactLineCard from './CompactLineCard';

interface LineSelectorProps {
  lines: BusLine[];
  selectedLineId: string | null;
  onLineSelect: (lineId: string) => void;
  loading: boolean;
  error: string | null;
  title?: string;
}

type ViewMode = 'compact' | 'grid' | 'list';
type FilterTab = 'all' | 'frequent' | 'urban' | 'regional';

const LineSelector: React.FC<LineSelectorProps> = ({
  lines,
  selectedLineId,
  onLineSelect,
  loading,
  error,
  title = "Select Bus Line"
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('compact');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  
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
  
  // Filter groups based on search query and active tab
  const filteredGroups = React.useMemo(() => {
    // First apply search filter
    let filtered = Object.entries(lineGroups);
    
    if (searchQuery.trim()) {
      filtered = filtered.filter(([number, groupLines]) => {
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
    }
    
    // Then apply tab filter (this is simulated as we don't have actual data categories)
    if (activeTab !== 'all') {
      // This is a simulated filter - in real app, you would have actual categorization
      if (activeTab === 'frequent') {
        filtered = filtered.filter(([_, lines]) => parseInt(lines[0].line) < 30);
      } else if (activeTab === 'urban') {
        filtered = filtered.filter(([_, lines]) => parseInt(lines[0].line) >= 30 && parseInt(lines[0].line) < 70);
      } else if (activeTab === 'regional') {
        filtered = filtered.filter(([_, lines]) => parseInt(lines[0].line) >= 70);
      }
    }
    
    return filtered;
  }, [lineGroups, searchQuery, activeTab]);

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
          <div className="flex flex-col space-y-4">
            {/* Title and search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                <p className="text-gray-500 text-sm">Choose from {lines.length} available routes</p>
              </div>
              
              <div className="flex items-center space-x-2 mt-3 sm:mt-0">
                <div className="relative flex-1 sm:min-w-[280px]">
                  <IconSearch size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by number or destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 shadow-sm"
                  />
                </div>
                
                <button 
                  className={`p-2 rounded-lg hover:text-gray-800 border transition-colors
                    ${viewMode === 'compact'
                      ? 'text-gray-700 bg-gray-100 border-gray-300' 
                      : 'text-gray-600 hover:bg-gray-100 border-gray-300'
                    }`}
                  onClick={() => setViewMode(viewMode === 'compact' ? 'grid' : 'compact')}
                >
                  {viewMode === 'compact'
                    ? <IconList size={20} /> 
                    : <IconGridDots size={20} />
                  }
                </button>
              </div>
            </div>
            
            {/* Tab filters */}
            <div className="flex overflow-x-auto -mx-4 px-4 py-1 scrollbar-none">
              <div className="flex space-x-1 min-w-max">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeTab === 'all' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  All Lines
                </button>
                <button 
                  onClick={() => setActiveTab('frequent')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center
                    ${activeTab === 'frequent' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <IconStarFilled size={16} className="mr-1.5" />
                  Frequent
                </button>
                <button 
                  onClick={() => setActiveTab('urban')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeTab === 'urban' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Urban
                </button>
                <button 
                  onClick={() => setActiveTab('regional')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeTab === 'regional' 
                      ? 'bg-primary-100 text-primary-700' 
                      : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Regional
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Compact View - All lines visible without excessive scrolling */}
      <div className="flex-1 overflow-y-auto pb-16 scrollbar-thin">
        <div className="container-max py-4 px-4 relative">
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
                  <p className="text-gray-500">Try a different search term or filter</p>
                </div>
              </motion.div>
            ) : viewMode === 'compact' ? (
              <motion.div 
                key="compact-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                  {filteredGroups.map(([number, groupLines]) => (
                    <div key={number} className="col-span-1">
                      <motion.div 
                        className="relative rounded-xl shadow-sm border border-gray-100 bg-white overflow-hidden h-full"
                        whileHover={{ y: -2, boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex flex-col p-3 h-full">
                          {/* Line group header */}
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                              <span className={`
                                w-8 h-8 rounded-md text-white flex items-center justify-center font-bold text-base
                                ${groupLines.some(l => l.direction === 'FORWARD') 
                                  ? 'bg-gradient-to-br from-green-500 to-green-600' 
                                  : 'bg-gradient-to-br from-orange-500 to-orange-600'
                                }
                              `}>{number}</span>
                              <span className="text-xs ml-1.5 bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">
                                {groupLines.length}
                              </span>
                            </div>
                            
                            {groupLines.some(line => line.id === selectedLineId) && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </div>
                          
                          {/* Directions list */}
                          <div className="space-y-1.5">
                            {groupLines.length > 0 && (
                              <div className="text-xs font-medium text-gray-700 mb-1">
                                {groupLines[0].label || `Line ${number}`}
                              </div>
                            )}
                            {groupLines.map((line, idx) => (
                              <div 
                                key={line.id} 
                                onClick={() => onLineSelect(line.id)}
                                className={`text-xs p-1.5 rounded-md cursor-pointer flex items-center
                                  ${line.id === selectedLineId 
                                    ? 'bg-primary-50 border border-primary-100' 
                                    : 'hover:bg-gray-50'
                                  }
                                `}
                              >
                                <span className={`w-1.5 h-1.5 rounded-full mr-1 
                                  ${line.direction === 'FORWARD' ? 'bg-green-500' : 'bg-orange-500'}`
                                }></span>
                                <span className="truncate flex-1">
                                  {line.direction === 'FORWARD' ? 'To ' : 'From '}
                                  {(line.direction === 'FORWARD' ? line.lastStop?.name : line.firstStop?.name) || 'N/A'}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="grid-view"
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
