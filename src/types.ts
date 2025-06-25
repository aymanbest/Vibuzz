// API response types
export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface BusStop {
  id: string;
  name: string;
  eta: number;
  travelTimeTo: number;
  coordinates: Coordinates;
}

export interface PathPoint {
  lng: number;
  lat: number;
}

export interface BusStopResponse {
  stops: BusStop[];
  path: PathPoint[];
}

export interface BusPosition {
  company: string;
  number: string;
  trackerId: string;
  coordinates: Coordinates;
  date: string;
  direction: string;
  heading: number;
  bearing: number;
  speed: number;
  precision: string;
  metadata: Record<string, any>;
}

export interface BusPositionResponse {
  positions: Record<string, BusPosition[]>;
  latestPositions: any[];
  endOfService: any;
  startsIn: any;
}

export interface UserLocation {
  lat: number;
  lng: number;
}

// New types for the bus lines API
export interface BusLine {
  id: string;
  company: string;
  line: string;
  enabled: boolean;
  label: string;
  firstStop: BusStop | null;
  lastStop: BusStop | null;
  zones: string[];
  type: string;
  ticketPrice: number | null;
  city: string;
  direction: 'FORWARD' | 'BACKWARD';
}

export interface BusLinesResponse {
  lines: BusLine[];
}
