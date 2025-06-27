import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IconSearch, 
  IconBus, 
  IconStarFilled,
  IconClock,
  IconMapPin,
  IconInfoCircle,
  IconArrowNarrowRight,
  IconArrowLeft
} from '@tabler/icons-react';
import { useTheme } from '../contexts/ThemeContext';
import type { BusLine } from '../types';

interface LineSelectorProps {
  lines: BusLine[];
  selectedLineId: string | null;
  onLineSelect: (lineId: string) => void;
  loading: boolean;
  error: string | null;
  title?: string;
}

// Define filter tabs (removed night category)
type FilterTab = 'all' | 'frequent' | 'urban';

// Define categories for grouping bus lines
type LineCategory = {
  title: string;
  icon: React.ReactNode;
  description: string;
  filter: (lines: BusLine[]) => boolean;
  color: string;
};

const LineSelector: React.FC<LineSelectorProps> = ({
  lines,
  selectedLineId,
  onLineSelect,
  loading,
  error,
  title = "Select Bus Line"
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  
  // Define line categories for grouping (removed night category)
  const lineCategories: Record<string, LineCategory> = useMemo(() => ({
    frequent: {
      title: 'Frequent Lines',
      icon: <IconStarFilled size={18} className={`mr-2 ${isDark ? 'text-yellow-400' : 'text-yellow-500'}`} />,
      description: 'High frequency routes with departures every 5-10 minutes',
      filter: (groupLines: BusLine[]) => parseInt(groupLines[0].line) < 30,
      color: 'from-green-500 to-green-600'
    },
    urban: {
      title: 'Urban Lines',
      icon: <IconBus size={18} className={`mr-2 ${isDark ? 'text-blue-400' : 'text-blue-500'}`} />,
      description: 'City center routes connecting major destinations',
      filter: (groupLines: BusLine[]) => parseInt(groupLines[0].line) >= 30,
      color: 'from-blue-500 to-blue-600'
    }
  }), [isDark]);

  // Group lines by line number for better organization
  const lineGroups = useMemo(() => {
    const groups: { [key: string]: BusLine[] } = {};
    
    lines.forEach(line => {
      if (!groups[line.line]) {
        groups[line.line] = [];
      }
      groups[line.line].push(line);
    });
    
    return groups;
  }, [lines]);
  
  // Group lines by category for the new sectioned layout
  const groupedLinesByCategory = useMemo(() => {
    const groupedByCategory: Record<string, [string, BusLine[]][]> = {
      frequent: [],
      urban: [],
      other: []
    };

    Object.entries(lineGroups).forEach(([number, groupLines]) => {
      // Skip if filtered by search
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const matches = number.toLowerCase().includes(lowerQuery) || 
          groupLines.some(line => 
            line.label?.toLowerCase().includes(lowerQuery) ||
            line.firstStop?.name?.toLowerCase().includes(lowerQuery) ||
            line.lastStop?.name?.toLowerCase().includes(lowerQuery)
          );
        
        if (!matches) return;
      }
      
      // Assign to appropriate category
      if (lineCategories.frequent.filter(groupLines)) {
        groupedByCategory.frequent.push([number, groupLines]);
      } else if (lineCategories.urban.filter(groupLines)) {
        groupedByCategory.urban.push([number, groupLines]);
      } else {
        groupedByCategory.other.push([number, groupLines]);
      }
    });
    
    return groupedByCategory;
  }, [lineGroups, lineCategories, searchQuery]);

  // Filter the grouped categories based on the active tab
  const filteredCategories = useMemo(() => {
    if (activeTab === 'all') {
      return Object.entries(lineCategories).filter(([key, _]) => 
        groupedLinesByCategory[key].length > 0
      );
    }
    
    return Object.entries(lineCategories)
      .filter(([key, _]) => key === activeTab && groupedLinesByCategory[key].length > 0);
  }, [activeTab, lineCategories, groupedLinesByCategory]);
  
  // Check if there are any matches for the search query
  const hasSearchResults = useMemo(() => 
    Object.values(groupedLinesByCategory).some(group => group.length > 0),
  [groupedLinesByCategory]);

  // Loading state with improved animation
  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl shadow-md p-8 w-full max-w-md text-center ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
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
          <h3 className={`text-2xl font-semibold mb-2 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>Loading Routes</h3>
          <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
            Finding available bus lines...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state with improved design
  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${
        isDark ? 'bg-gray-900' : 'bg-gray-50'
      }`}>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`rounded-2xl shadow-lg p-8 w-full max-w-md ${
            isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'
          }`}
        >
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-red-900 border border-red-700' : 'bg-red-100'
            }`}>
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h3 className={`text-2xl font-semibold mb-3 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>Connection Error</h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>{error}</p>
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
    <div className={`min-h-screen flex flex-col ${
      isDark ? 'bg-gray-900' : 'bg-gray-50'
    }`}>
      {/* Enhanced Sticky Header with modern search */}
      <div className={`sticky top-0 z-30 shadow-md ${
        isDark ? 'bg-gray-900 border-b border-gray-700' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto py-4 px-4">
          <div className="flex flex-col space-y-4">
            {/* Title and search bar */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex-shrink-0">
                <motion.h1 
                  className={`text-2xl font-bold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {title}
                </motion.h1>
              </div>
              
              <div className="flex-1 max-w-md">
                <motion.div 
                  className="relative"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <IconSearch size={18} className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`} />
                  <input
                    type="text"
                    placeholder="Search by number, stop name, or destination..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`pl-10 pr-4 py-3.5 text-sm border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 shadow-sm transition-all ${
                      isDark 
                        ? 'border-gray-600 bg-gray-800 text-white placeholder-gray-400 hover:bg-gray-700 focus:bg-gray-700' 
                        : 'border-gray-300 bg-gray-50 hover:bg-white focus:bg-white'
                    }`}
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className={`absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-colors ${
                        isDark 
                          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-700' 
                          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <span className="sr-only">Clear search</span>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 4L4 12M4 4L12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  )}
                </motion.div>
              </div>
            </div>
            
            {/* Enhanced Tab filters with sticky horizontal scroll on mobile */}
            <motion.div 
              className="flex overflow-x-auto py-2 -mx-4 px-4 scrollbar-none"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <div className="flex space-x-2.5 min-w-max">
                <button 
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all
                    ${activeTab === 'all' 
                      ? isDark
                        ? 'bg-primary-600 text-white shadow-sm border border-primary-500'
                        : 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                      : isDark
                        ? 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                        : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                    }`}
                >
                  All Lines
                </button>
                
                {Object.entries(lineCategories).map(([key, category]) => (
                  <button 
                    key={key}
                    onClick={() => setActiveTab(key as FilterTab)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center
                      ${activeTab === key 
                        ? isDark
                          ? 'bg-primary-600 text-white shadow-sm border border-primary-500'
                          : 'bg-primary-100 text-primary-700 shadow-sm border border-primary-200'
                        : isDark
                          ? 'text-gray-300 hover:bg-gray-800 hover:text-white border border-transparent'
                          : 'text-gray-600 hover:bg-gray-100 border border-transparent'
                      }`}
                    disabled={groupedLinesByCategory[key].length === 0}
                  >
                    {category.icon}
                    <span className="ml-1.5">{category.title.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto pb-16" style={{ scrollbarWidth: 'thin' }}>
        <div className="max-w-6xl mx-auto py-4 px-4 relative">
          <AnimatePresence mode="wait">
            {!hasSearchResults ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center h-64"
              >
                <div className="text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                    isDark ? 'bg-gray-800' : 'bg-gray-100'
                  }`}>
                    <IconSearch size={24} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
                  </div>
                  <h3 className={`text-lg font-medium mb-1 ${
                    isDark ? 'text-white' : 'text-gray-700'
                  }`}>No Routes Found</h3>
                  <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    Try a different search term or filter
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="categories-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-10"
              >
                {filteredCategories.map(([categoryKey, category]) => (
                  <div key={categoryKey} className="space-y-4">
                    {/* Section Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        {category.icon}
                        <h2 className={`text-lg font-semibold ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}>{category.title}</h2>
                      </div>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {groupedLinesByCategory[categoryKey].length} lines available
                      </p>
                    </div>
                    
                    {/* Section description */}
                    <p className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>{category.description}</p>
                    
                    {/* Cards grid with responsive column count */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {groupedLinesByCategory[categoryKey].map(([number, groupLines], index) => {
                        // Use the first line in the group as representative
                        const primaryLine = groupLines[0];
                        
                        return (
                          <motion.div 
                            key={number}
                            className={`
                              relative overflow-hidden transition-all duration-300 rounded-xl cursor-pointer
                              ${isDark 
                                ? 'bg-gray-800 border border-gray-700 hover:border-primary-500 hover:shadow-lg' 
                                : 'bg-white border border-gray-200 hover:border-primary-200 hover:shadow-md'
                              }
                              ${groupLines.some(line => line.id === selectedLineId) ? 'ring-2 ring-primary-500 ring-opacity-60' : ''}
                            `}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ 
                              opacity: 1, 
                              y: 0, 
                              height: 'auto',
                              transition: { delay: index * 0.05 }
                            }}
                            layout
                            onClick={() => onLineSelect(primaryLine.id)}
                          >
                            {/* Card Header */}
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-3">
                                {/* Line number with improved visibility */}
                                <div className="flex items-center space-x-3">
                                  <div className={`
                                    flex-shrink-0 w-14 h-14 text-white rounded-lg flex items-center justify-center
                                    font-bold text-xl shadow-sm bg-gradient-to-br ${category.color}
                                  `}>
                                    {number}
                                  </div>
                                  
                                  <div>
                                    <h3 className={`font-semibold text-base ${
                                      isDark ? 'text-white' : 'text-gray-900'
                                    }`}>
                                      {primaryLine.label || `Line ${number}`}
                                    </h3>
                                    <div className={`flex items-center text-xs mt-1 ${
                                      isDark ? 'text-gray-400' : 'text-gray-500'
                                    }`}>
                                      <IconMapPin size={14} className="mr-1 text-primary-500" />
                                      <span>{primaryLine.city}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Bidirectional Route Preview */}
                              <div className={`rounded-lg p-3 text-sm overflow-hidden ${
                                isDark 
                                  ? 'bg-gray-700 text-gray-200' 
                                  : 'bg-gray-50 text-gray-700'
                              }`}>
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2">
                                    <div className="mt-1 flex-shrink-0">
                                      <span className="flex h-3 w-3 rounded-full bg-green-500"></span>
                                    </div>
                                    <span className="font-medium text-xs" title={primaryLine.firstStop?.name || "N/A"}>
                                      {primaryLine.firstStop?.name && primaryLine.firstStop.name.length > 25 
                                        ? primaryLine.firstStop.name.substring(0, 25) + "..." 
                                        : primaryLine.firstStop?.name || "N/A"}
                                    </span>
                                  </div>
                                  
                                  <div className="flex items-center space-x-1">
                                    <IconArrowNarrowRight size={14} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
                                    <IconArrowLeft size={14} className={isDark ? 'text-gray-400' : 'text-gray-400'} />
                                  </div>
                                  
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-xs" title={primaryLine.lastStop?.name || "N/A"}>
                                      {primaryLine.lastStop?.name && primaryLine.lastStop.name.length > 25 
                                        ? primaryLine.lastStop.name.substring(0, 25) + "..." 
                                        : primaryLine.lastStop?.name || "N/A"}
                                    </span>
                                    <div className="mt-1 flex-shrink-0">
                                      <span className="flex h-3 w-3 rounded-full bg-red-500"></span>
                                    </div>
                                  </div>
                                </div>
                                <div className={`text-xs mt-2 text-center ${
                                  isDark ? 'text-gray-400' : 'text-gray-500'
                                }`}>
                                  Bidirectional route • Tap to select direction
                                </div>
                              </div>
                            </div>
                            
                            {/* Selection indicator */}
                            {groupLines.some(line => line.id === selectedLineId) && (
                              <div className="absolute top-2 right-2 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center shadow-sm">
                                <svg width="10" height="8" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            )}
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Enhanced Floating action button for mobile */}
      <motion.div 
        className="lg:hidden fixed right-5 bottom-6 z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      >
        <button 
          className="w-16 h-16 bg-primary-600 hover:bg-primary-700 rounded-full shadow-xl flex items-center justify-center text-white transition-all"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <div className="flex flex-col items-center">
            <IconBus size={24} />
            <span className="text-xs font-medium mt-0.5">Find</span>
          </div>
        </button>
        
        {/* Pulse animation for the button */}
        <span className="animate-ping absolute top-0 right-0 w-16 h-16 inline-flex rounded-full bg-primary-400 opacity-50"></span>
      </motion.div>
    </div>
  );
};

export default LineSelector;
