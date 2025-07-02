/**
 * Triathlon Scheduler Backend API
 * 
 * A RESTful API server for managing triathlon events including training sessions,
 * races, recovery activities, and other events. Built with Express.js and SQLite.
 * 
 * Features:
 * - Full CRUD operations for triathlon events
 * - Event categorization (training, race, recovery, other)
 * - SQLite database for lightweight data persistence
 * - CORS enabled for frontend integration
 * - UUID-based event identification
 * 
 * @author Triathlon Scheduler Team
 * @version 1.0.0
 */

const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware Configuration
app.use(cors({
  origin: true, // Allow all origins for development
  credentials: true
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with size limit

// Database Configuration
const dbPath = path.join(__dirname, 'triathlon_events.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('❌ Error opening database:', err.message);
  } else {
    console.log('📊 Connected to SQLite database:', dbPath);
  }
});

// Database Schema Initialization
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,              -- Unique identifier (UUID)
    title TEXT NOT NULL,              -- Event title/name
    date TEXT NOT NULL,               -- Event date (YYYY-MM-DD format)
    time TEXT,                        -- Event time (HH:MM format, optional)
    type TEXT NOT NULL,               -- Event type: training|race|recovery|other
    description TEXT,                 -- Optional event description
    location TEXT,                    -- Optional event location
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Record update timestamp
  )`, (err) => {
    if (err) {
      console.error('❌ Error creating events table:', err.message);
    } else {
      console.log('✅ Events table ready');
    }
  });
});

// API Routes

/**
 * GET /api/events
 * Retrieve all triathlon events ordered by date and time
 * 
 * @returns {Array} Array of event objects
 * @example
 * GET /api/events
 * Response: [
 *   {
 *     "id": "uuid-here",
 *     "title": "Morning Swim",
 *     "date": "2025-07-03",
 *     "time": "07:00",
 *     "type": "training",
 *     "description": "1500m freestyle",
 *     "location": "Local Pool",
 *     "created_at": "2025-07-02T17:00:00.000Z",
 *     "updated_at": "2025-07-02T17:00:00.000Z"
 *   }
 * ]
 */
app.get('/api/events', (req, res) => {
  console.log('📋 Fetching all events');
  
  db.all('SELECT * FROM events ORDER BY date, time', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching events:', err.message);
      res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
      return;
    }
    
    console.log(`✅ Retrieved ${rows.length} events`);
    res.json(rows);
  });
});

// Get events for a specific date range
app.get('/api/events/range', (req, res) => {
  const { start, end } = req.query;
  
  if (!start || !end) {
    res.status(400).json({ error: 'Start and end dates are required' });
    return;
  }

  db.all(
    'SELECT * FROM events WHERE date >= ? AND date <= ? ORDER BY date, time',
    [start, end],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

// Create new event
app.post('/api/events', (req, res) => {
  const { title, date, time, type, description, location } = req.body;
  
  if (!title || !date || !type) {
    res.status(400).json({ error: 'Title, date, and type are required' });
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO events (id, title, date, time, type, description, location, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, date, time, type, description, location, now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created event
      db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.status(201).json(row);
      });
    }
  );
});

// Update event
app.put('/api/events/:id', (req, res) => {
  const { id } = req.params;
  const { title, date, time, type, description, location } = req.body;
  const now = new Date().toISOString();

  db.run(
    `UPDATE events SET title = ?, date = ?, time = ?, type = ?, description = ?, location = ?, updated_at = ?
     WHERE id = ?`,
    [title, date, time, type, description, location, now, id],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      if (this.changes === 0) {
        res.status(404).json({ error: 'Event not found' });
        return;
      }

      // Return the updated event
      db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        res.json(row);
      });
    }
  );
});

// Delete event
app.delete('/api/events/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM events WHERE id = ?', [id], function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    
    if (this.changes === 0) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({ message: 'Event deleted successfully' });
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🏊‍♂️ Triathlon Scheduler API running on port ${PORT}`);
  console.log(`📊 Database: ${dbPath}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  db.close((err) => {
    if (err) {
      console.error('Error closing database:', err.message);
    } else {
      console.log('📊 Database connection closed.');
    }
    process.exit(0);
  });
});
