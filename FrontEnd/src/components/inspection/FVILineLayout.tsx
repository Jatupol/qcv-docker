// client/src/components/inspection/FVILineLayout.tsx
// FVI Line Layout Component - Reusable Production Line Display
// Complete Separation Entity Architecture - Sampling Inspection Control System

import React, { useState, useEffect } from 'react';

// ============ INTERFACES ============

export interface InspectionStation {
  line: string;
  group: string;
  id: number;
  position: string;      // Position identifier (e.g., "a-gr-1", "MBR", "QC")
  inspectorId: string;
  oprname?: string;      // Operator name (not displayed on layout, only when selected)
}

export interface FVILineLayoutProps {
  stations?: InspectionStation[];
  onStationSelect?: (station: InspectionStation) => void;
  selectedStation?: InspectionStation | null;
  showHeader?: boolean;
  compactMode?: boolean;
  className?: string;
  shift?: string;  // Shift name to display in header
}

// ============ FIXED STATION LAYOUT ============
// Define fixed positions for each group
const GROUP_LAYOUTS = {
  '1': ['a-gr-1', 'a-gr-2', 'a-gr-3', 'a-gr-4', 'a-gr-5', 'a-gr-6', 'a-gr-7', 'MRB'],
  '2': ['b-gr-1', 'b-gr-2', 'b-gr-3', 'b-gr-4', 'b-gr-5', 'b-gr-6', 'b-gr-7', 'QC']
};

// ============ MAIN COMPONENT ============

const FVILineLayout: React.FC<FVILineLayoutProps> = ({
  stations = [],
  onStationSelect,
  selectedStation: externalSelectedStation,
  showHeader = true,
  compactMode = false,
  className = '',
  shift = ''
}) => {
  const [internalSelectedStation, setInternalSelectedStation] = useState<InspectionStation | null>(null);
  const [highlightedInspector, setHighlightedInspector] = useState<string | null>(null);

  // Use external selection if provided, otherwise use internal state
  const selectedStation = externalSelectedStation !== undefined ? externalSelectedStation : internalSelectedStation;

  // Create a map of position -> stations[] for handling multiple inspectors per position
  const stationMap = stations.reduce((acc, station) => {
    if (!acc[station.position]) {
      acc[station.position] = [];
    }
    acc[station.position].push(station);
    return acc;
  }, {} as Record<string, InspectionStation[]>);

  // Build fixed layout with all positions, filling in data from API
  const buildFixedStations = (): InspectionStation[] => {
    const fixedStations: InspectionStation[] = [];
    let idCounter = 1;

    // Get the line from first station or default to 'A'
    const line = stations.length > 0 ? stations[0].line : 'A';

    // Build Group 1
    GROUP_LAYOUTS['1'].forEach((position, index) => {
      const stationsAtPosition = stationMap[position] || [];

      // Join multiple inspector IDs with comma
      const inspectorId = stationsAtPosition.length > 0
        ? stationsAtPosition.map(s => s.inspectorId).join(', ')
        : '-';

      // Join multiple operator names with comma
      const oprname = stationsAtPosition.length > 0
        ? stationsAtPosition.map(s => s.oprname).filter(name => name).join(', ')
        : undefined;

      fixedStations.push({
        line,
        group: '1',
        id: idCounter++,
        position,
        inspectorId,
        oprname
      });
    });

    // Build Group 2
    GROUP_LAYOUTS['2'].forEach((position, index) => {
      const stationsAtPosition = stationMap[position] || [];

      // Join multiple inspector IDs with comma
      const inspectorId = stationsAtPosition.length > 0
        ? stationsAtPosition.map(s => s.inspectorId).join(', ')
        : '-';

      // Join multiple operator names with comma
      const oprname = stationsAtPosition.length > 0
        ? stationsAtPosition.map(s => s.oprname).filter(name => name).join(', ')
        : undefined;

      fixedStations.push({
        line,
        group: '2',
        id: idCounter++,
        position,
        inspectorId,
        oprname
      });
    });

    return fixedStations;
  };

  // Use fixed layout instead of dynamic stations
  const displayStations = buildFixedStations();

  // Group data by line
  const lineData = displayStations.reduce((acc, station) => {
    if (!acc[station.line]) {
      acc[station.line] = [];
    }
    acc[station.line].push(station);
    return acc;
  }, {} as Record<string, InspectionStation[]>);

  const handleStationClick = (station: InspectionStation) => {
    // Don't allow selecting unassigned stations
    if (station.inspectorId === '-') {
      return;
    }

    if (externalSelectedStation === undefined) {
      setInternalSelectedStation(station);
    }
    setHighlightedInspector(station.inspectorId);
    onStationSelect?.(station);
  };

  const isHighlighted = (station: InspectionStation) => {
    return highlightedInspector === station.inspectorId;
  };

  const isSelected = (station: InspectionStation) => {
    return selectedStation?.line === station.line &&
           selectedStation?.group === station.group &&
           selectedStation?.id === station.id;
  };

  return (
    <div className={className}>
      {/* Header */}
      {showHeader && (
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            FVI Line Layout
          </h2>
          <p className="text-gray-600">
            Select an inspection station to view details
          </p>
        </div>
      )}

      {/* Production Lines */}
      <div className="space-y-6">
        {Object.entries(lineData).map(([lineName, lineStations]) => (
          <div key={lineName} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            {/* Line Header */}
            {!compactMode && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-primary-500 text-white rounded-lg flex items-center justify-center text-xl font-bold">
                    {lineName}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">
                      Production Line {lineName} {shift && `- Shift ${shift}`}
                    </h3>
                    <p className="text-gray-600">
                      {lineStations.length} inspection stations • {[...new Set(lineStations.map(s => s.group))].length} group(s)
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">Unique Inspectors</div>
                  <div className="text-lg font-semibold text-gray-800">
                    {[...new Set(lineStations.map(s => s.inspectorId))].length}
                  </div>
                </div>
              </div>
            )}

            {compactMode && (
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary-500 text-white rounded-lg flex items-center justify-center text-sm font-bold">
                  {lineName}
                </div>
                <span className="text-sm font-semibold text-gray-700">
                  FVI Line {lineName} {shift && `Shift ${shift}`}
                </span>
              </div>
            )}

            {/* Group Rows */}
            <div className="space-y-4">
              {[...new Set(lineStations.map(s => s.group))].map(groupName => {
                const groupStations = lineStations.filter(s => s.group === groupName);
                return (
                  <div key={groupName} className="border border-gray-200 rounded-lg p-4">
                    {/* Group Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-500 text-white rounded flex items-center justify-center text-sm font-bold">
                          {groupName}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          Group {groupName}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500 px-2 py-1 bg-gray-100 rounded">
                        {groupStations.length} stations
                      </span>
                    </div>

                    {/* Inspection Stations */}
                    <div className={`grid gap-2 ${
                      compactMode
                        ? 'grid-cols-4 sm:grid-cols-6 md:grid-cols-8'
                        : 'grid-cols-2 sm:grid-cols-4 md:grid-cols-8'
                    }`}>
                      {groupStations.map((station) => (
                          <div
                            key={`${station.line}-${station.group}-${station.id}`}
                            onClick={() => handleStationClick(station)}
                            className={`
                              relative transition-all duration-200 p-3 rounded-lg border-2
                              ${station.inspectorId === '-'
                                ? 'border-gray-200 bg-gray-100 cursor-not-allowed opacity-60'
                                : isHighlighted(station)
                                  ? 'border-primary-500 bg-primary-50 shadow-lg scale-105 cursor-pointer'
                                  : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50 cursor-pointer'
                              }
                              ${isSelected(station)
                                ? 'ring-2 ring-primary-400 ring-offset-2'
                                : ''
                              }
                            `}
                          >
                            {/* Position Badge */}
                            <div className="absolute -top-2 -left-2 px-2 py-1 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                              {station.position}
                            </div>

                            {/* Inspector ID */}
                            <div className="text-center mt-2">
                              <div className="text-xs text-gray-500 mb-1">Inspector</div>
                              <div className={`
                                text-sm font-bold
                                ${station.inspectorId === '-' ? 'text-gray-400 italic' :
                                  isHighlighted(station) ? 'text-primary-700' : 'text-gray-800'}
                              `}>
                                {station.inspectorId === '-' ? 'Not Assigned' : station.inspectorId}
                              </div>
                            </div>

                            {/* Status Indicator */}
                            <div className="absolute top-1 right-1">
                              <div className={`
                                w-2 h-2 rounded-full
                                ${isHighlighted(station) ? 'bg-primary-400' : 'bg-green-400'}
                              `}></div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Selection Info */}
      {selectedStation && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Selected Station</p>
              <p className="font-semibold text-gray-900">
                Line {selectedStation.line} • Group {selectedStation.group} • Position {selectedStation.position} • Inspector {selectedStation.inspectorId}
              </p>
            </div>
            <button
              onClick={() => {
                if (externalSelectedStation === undefined) {
                  setInternalSelectedStation(null);
                }
                setHighlightedInspector(null);
                onStationSelect?.(null as any);
              }}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FVILineLayout;

/*
=== FVI LINE LAYOUT COMPONENT FEATURES ===

COMPONENT PROPS:
✅ stations: Custom inspection station data (optional, uses default if not provided)
✅ onStationSelect: Callback when a station is selected
✅ selectedStation: External control of selected station (optional)
✅ showHeader: Toggle header display (default: true)
✅ compactMode: Compact layout for smaller spaces (default: false)
✅ className: Additional CSS classes

VISUAL FEATURES:
✅ Production line organization with headers
✅ Group-based station layout
✅ Interactive station selection
✅ Inspector highlighting (all stations with same inspector)
✅ Visual feedback (hover, selection, highlighting)
✅ Station ID badges
✅ Status indicators
✅ Responsive grid layout

FUNCTIONALITY:
✅ Click station to select and highlight inspector
✅ Visual indication of selected station
✅ Selection info display at bottom
✅ Clear selection button
✅ Supports both controlled and uncontrolled modes
✅ Compact mode for sidebar/small displays

USAGE EXAMPLES:

// Basic usage with default data
<FVILineLayout />

// With custom stations and selection callback
<FVILineLayout
  stations={customStations}
  onStationSelect={(station) => console.log('Selected:', station)}
/>

// Compact mode for sidebar
<FVILineLayout compactMode showHeader={false} />

// Controlled component
<FVILineLayout
  selectedStation={mySelectedStation}
  onStationSelect={setMySelectedStation}
/>

INTEGRATION NOTES:
✅ Works standalone or integrated in pages
✅ Can be used in DefectInputPage, RecordPage, or any inspection page
✅ Responsive design works on mobile and desktop
✅ Maintains state internally or can be controlled externally
✅ Default stations provided for demo/testing
*/