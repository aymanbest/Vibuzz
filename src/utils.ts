import type { BusStop, UserLocation } from './types';

// Calculate distance between two points using Haversine formula
export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(point2.lat - point1.lat);
  const dLng = toRadians(point2.lng - point1.lng);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(point1.lat)) * Math.cos(toRadians(point2.lat)) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Find the closest bus stop to user's location
export function findClosestBusStop(
  userLocation: UserLocation,
  busStops: BusStop[]
): BusStop | null {
  if (!busStops.length) return null;
  
  let closestStop = busStops[0];
  let minDistance = calculateDistance(
    userLocation,
    { lat: closestStop.coordinates.latitude, lng: closestStop.coordinates.longitude }
  );
  
  for (let i = 1; i < busStops.length; i++) {
    const stop = busStops[i];
    const distance = calculateDistance(
      userLocation,
      { lat: stop.coordinates.latitude, lng: stop.coordinates.longitude }
    );
    
    if (distance < minDistance) {
      minDistance = distance;
      closestStop = stop;
    }
  }
  
  return closestStop;
}

// Format distance for display
export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  }
  return `${distanceKm.toFixed(1)}km`;
}

// Format time for display (ETA, travel time, etc.)
export function formatTime(minutes: number): string {
  if (!Number.isFinite(minutes)) return 'N/A';
  return `${Math.round(minutes)} min`;
}
