import React, { useState } from 'react';
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
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4"></div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">Loading Bus Lines</h3>
          <p className="text-gray-500 text-center">Fetching available routes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Bus Lines</h3>
          <p className="text-red-500 text-sm mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6">
        <h3 className="text-2xl font-bold mb-2">{title}</h3>
        <p className="text-blue-100">Choose your bus line to get started</p>
        
        {/* Search Bar */}
        <div className="mt-4 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400">🔍</span>
          </div>
          <input
            type="text"
            placeholder="Search lines, destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
          />
        </div>
      </div>
      
      {/* Content */}
      <div className="p-6">
        {filteredGroups.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🚌</div>
            <h4 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No matching lines found' : 'No bus lines available'}
            </h4>
            <p className="text-sm">
              {searchTerm ? 'Try adjusting your search terms' : 'Please check back later'}
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {filteredGroups.map(([lineNumber, lineVariations]) => (
              <div key={lineNumber} className="space-y-4">
                {/* Line Group Header */}
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
                    {lineNumber}
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-gray-800">
                      Line {lineNumber}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {lineVariations.length} direction{lineVariations.length > 1 ? 's' : ''} available
                    </p>
                  </div>
                </div>
                
                {/* Line Variations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 ml-4">
                  {lineVariations.map((line) => (
                    <LineCard
                      key={line.id}
                      line={line}
                      isSelected={selectedLineId === line.id}
                      onSelect={onLineSelect}
                      showDirection={true}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Stats Footer */}
        {lines.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm text-gray-500">
              <span>📊 Total Lines: {Object.keys(groupedLines).length}</span>
              <span>🚌 Total Routes: {lines.length}</span>
              <span>🔍 Showing: {filteredGroups.length}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineSelector;
