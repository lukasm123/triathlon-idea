/**
 * App Component Tests
 * 
 * Basic tests to ensure the App component renders without errors
 * and key functionality works as expected.
 */

import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch for API calls
global.fetch = jest.fn();

const mockFetch = fetch as jest.MockedFunction<typeof fetch>;

describe('App Component', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('renders without crashing', async () => {
    // Mock successful API response
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Loading your triathlon schedule/)).not.toBeInTheDocument();
    });
  });

  test('displays app title', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('Triathlon Race Scheduler')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    mockFetch.mockImplementationOnce(() => new Promise(() => {})); // Never resolves

    render(<App />);
    
    expect(screen.getByText(/Loading your triathlon schedule/)).toBeInTheDocument();
  });

  test('displays race count when races are loaded', async () => {
    const mockRaces = [
      {
        id: '1',
        title: 'Test Race',
        date: '2025-07-15',
        distance: 'olympic',
        created_at: '2025-07-02T17:00:00.000Z',
        updated_at: '2025-07-02T17:00:00.000Z'
      }
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRaces,
    } as Response);

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText('1 race scheduled')).toBeInTheDocument();
    });
  });

  test('handles API error gracefully', async () => {
    mockFetch.mockRejectedValueOnce(new Error('API Error'));

    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByText(/Unable to connect to the backend API/)).toBeInTheDocument();
    });
  });

  test('displays calendar component', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => [],
    } as Response);

    render(<App />);
    
    await waitFor(() => {
      // Check for calendar navigation elements
      expect(screen.getByRole('button', { name: /Add Race/ })).toBeInTheDocument();
    });
  });
});
