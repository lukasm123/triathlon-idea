import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Activity, List, Grid } from 'lucide-react';
import Calendar from './components/Calendar';
import ListView from './components/ListView';
import { TriathlonRace, NewRace } from './types';

// API Configuration for different environments
const getApiBaseUrl = () => {
  // Check if we're in Gitpod environment
  if (typeof window !== 'undefined' && window.location.hostname.includes('gitpod.dev')) {
    const envId = window.location.hostname.split('--')[1];
    return `https://3001--${envId}/api`;
  }
  
  // In production, use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  
  // In local development, use localhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();
console.log('🔗 API Base URL:', API_BASE_URL);

type ViewMode = 'calendar' | 'list';

function App() {
  const [races, setRaces] = useState<TriathlonRace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');

  // Fetch races from API with detailed error handling
  const fetchRaces = async () => {
    try {
      console.log('🔄 Fetching races from:', `${API_BASE_URL}/races`);
      
      const response = await fetch(`${API_BASE_URL}/races`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Races fetched successfully:', data.length, 'races');
      setRaces(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch races';
      console.error('❌ Error fetching races:', errorMessage);
      setError(`Unable to connect to the backend API. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  // Create new race with improved error handling
  const handleRaceCreate = async (raceData: NewRace) => {
    try {
      console.log('🔄 Creating race:', raceData);
      
      const response = await fetch(`${API_BASE_URL}/races`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(raceData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create race: ${response.status} ${errorText}`);
      }

      const newRace = await response.json();
      console.log('✅ Race created successfully:', newRace);
      setRaces(prev => [...prev, newRace]);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create race';
      console.error('❌ Error creating race:', errorMessage);
      setError(errorMessage);
    }
  };

  // Update existing race
  const handleRaceUpdate = async (id: string, raceData: Partial<NewRace>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/races/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(raceData),
      });

      if (!response.ok) {
        throw new Error('Failed to update race');
      }

      const updatedRace = await response.json();
      setRaces(prev => prev.map(race => 
        race.id === id ? updatedRace : race
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update race');
    }
  };

  // Delete race
  const handleRaceDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/races/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete race');
      }

      setRaces(prev => prev.filter(race => race.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete race');
    }
  };

  useEffect(() => {
    fetchRaces();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your triathlon schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-8 h-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">Triathlon Race Scheduler</h1>
              </div>
              <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
                <span>🏊‍♂️</span>
                <span>🚴‍♂️</span>
                <span>🏃‍♂️</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {races.length} race{races.length !== 1 ? 's' : ''} scheduled
              </div>
              
              {/* View Toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendar')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'calendar' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                  <span>Calendar</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list' 
                      ? 'bg-white text-gray-900 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <List className="w-4 h-4" />
                  <span>List</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <div className="text-red-600 text-sm">
                <strong>Error:</strong> {error}
              </div>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {viewMode === 'calendar' ? (
          <Calendar
            races={races}
            onRaceCreate={handleRaceCreate}
            onRaceUpdate={handleRaceUpdate}
            onRaceDelete={handleRaceDelete}
          />
        ) : (
          <ListView
            races={races}
            onRaceCreate={handleRaceCreate}
            onRaceUpdate={handleRaceUpdate}
            onRaceDelete={handleRaceDelete}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>Plan your triathlon journey • Track training • Schedule races</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
