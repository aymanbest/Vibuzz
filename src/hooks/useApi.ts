import { useState, useEffect } from 'react';
import type { BusStopResponse, BusPositionResponse, BusLine } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export function useBusLines(city: string = 'KENITRA') {
  const [data, setData] = useState<BusLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/routes/buses?keys=id,company,line,enabled,label,firstStop,lastStop,zones,type,ticketPrice,city,direction&city=${city}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        // Filter only enabled bus lines
        const enabledLines = result.filter((line: BusLine) => line.enabled && line.id);
        setData(enabledLines);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [city]);

  return { data, loading, error };
}

export function useBusStops(lineId: string | null) {
  const [data, setData] = useState<BusStopResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!lineId) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/routes/paths/${lineId}?direction=FORWARD`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lineId]);

  return { data, loading, error };
}

export function useBusPositions(company?: string, number?: string, direction?: string) {
  const [data, setData] = useState<BusPositionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!company || !number || !direction) {
      setData(null);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_BASE_URL}/tracking/positions?company=${company}&number=${number}&direction=${direction}`
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        setData(result);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // Refresh bus positions every 30 seconds
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [company, number, direction]);

  return { data, loading, error };
}
