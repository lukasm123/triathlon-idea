import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Activity } from 'lucide-react';
import Calendar from './components/Calendar';
import { TriathlonEvent, NewEvent } from './types';

c// API Configuration for different environments
const API_BASE_URL = (() => {
  // In Gitpod, use the public backend URL
  if (window.location.hostname.includes('gitpod.dev')) {
    const envId = window.location.hostname.split('--')[1];
    return `https://3001--${envId}/api`;
  }
  // In production, use relative path
  if (process.env.NODE_ENV === 'production') {
    return '/api';
  }
  // In local development, use localhost
  return 'http://localhost:3001/api';
})();

console.log('🔗 API Base URL:', API_BASE_URL);

function App() {
  const [events, setEvents] = useState<TriathlonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

    // Fetch events from API with detailed error handling
  const fetchEvents = async () => {
    try {
      console.log('🔄 Fetching events from:', `${API_BASE_URL}/events`);
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ Events fetched successfully:', data.length, 'events');
      setEvents(data);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch events';
      console.error('❌ Error fetching events:', errorMessage);
      setError(`Unable to connect to the backend API. ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

    // Create new event with improved error handling
  const handleEventCreate = async (eventData: NewEvent) => {
    try {
      console.log('🔄 Creating event:', eventData);
      
      const response = await fetch(`${API_BASE_URL}/events`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create event: ${response.status} ${errorText}`);
      }

      const newEvent = await response.json();
      console.log('✅ Event created successfully:', newEvent);
      setEvents(prev => [...prev, newEvent]);
      setError(null); // Clear any previous errors
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create event';
      console.error('❌ Error creating event:', errorMessage);
      setError(errorMessage);
    }
  };

  // Update existing event
  const handleEventUpdate = async (id: string, eventData: Partial<NewEvent>) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(prev => prev.map(event => 
        event.id === id ? updatedEvent : event
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
    }
  };

  // Delete event
  const handleEventDelete = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      setEvents(prev => prev.filter(event => event.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    }
  };

  useEffect(() => {
    fetchEvents();
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
                <h1 className="text-2xl font-bold text-gray-900">Triathlon Scheduler</h1>
              </div>
              <div className="hidden sm:flex items-center space-x-1 text-sm text-gray-500">
                <span>🏊‍♂️</span>
                <span>🚴‍♂️</span>
                <span>🏃‍♂️</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {events.length} event{events.length !== 1 ? 's' : ''} scheduled
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

        <Calendar
          events={events}
          onEventCreate={handleEventCreate}
          onEventUpdate={handleEventUpdate}
          onEventDelete={handleEventDelete}
        />
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
