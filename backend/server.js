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

// Database Schema Initialization for Triathlon Race Scheduler
db.serialize(() => {
  // First, check if we need to migrate from old schema
  db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='events'", (err, row) => {
    if (row) {
      // Table exists, check if it has the new schema
      db.get("PRAGMA table_info(events)", (err, info) => {
        // For simplicity, we'll create a new races table
        db.run(`CREATE TABLE IF NOT EXISTS races (
          id TEXT PRIMARY KEY,              -- Unique identifier (UUID)
          title TEXT NOT NULL,              -- Race title/name
          date TEXT NOT NULL,               -- Race date (YYYY-MM-DD format)
          time TEXT,                        -- Race start time (HH:MM format, optional)
          distance TEXT NOT NULL,           -- Race distance: sprint|olympic|middle|long
          description TEXT,                 -- Optional race description
          location TEXT,                    -- Optional race location
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Record update timestamp
        )`, (err) => {
          if (err) {
            console.error('❌ Error creating races table:', err.message);
          } else {
            console.log('✅ Races table ready');
          }
        });
      });
    } else {
      // Create new races table
      db.run(`CREATE TABLE IF NOT EXISTS races (
        id TEXT PRIMARY KEY,              -- Unique identifier (UUID)
        title TEXT NOT NULL,              -- Race title/name
        date TEXT NOT NULL,               -- Race date (YYYY-MM-DD format)
        time TEXT,                        -- Race start time (HH:MM format, optional)
        distance TEXT NOT NULL,           -- Race distance: sprint|olympic|middle|long
        description TEXT,                 -- Optional race description
        location TEXT,                    -- Optional race location
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- Record creation timestamp
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Record update timestamp
      )`, (err) => {
        if (err) {
          console.error('❌ Error creating races table:', err.message);
        } else {
          console.log('✅ Races table ready');
        }
      });
    }
  });
});

// API Routes

/**
 * GET /api/races
 * Retrieve all triathlon races ordered by date and time
 * 
 * @returns {Array} Array of race objects
 * @example
 * GET /api/races
 * Response: [
 *   {
 *     "id": "uuid-here",
 *     "title": "City Olympic Triathlon",
 *     "date": "2025-07-15",
 *     "time": "07:00",
 *     "distance": "olympic",
 *     "description": "Annual city championship",
 *     "location": "City Park",
 *     "created_at": "2025-07-02T17:00:00.000Z",
 *     "updated_at": "2025-07-02T17:00:00.000Z"
 *   }
 * ]
 */
app.get('/api/races', (req, res) => {
  console.log('🏁 Fetching all races');
  
  db.all('SELECT * FROM races ORDER BY date, time', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching races:', err.message);
      res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
      return;
    }
    
    console.log(`✅ Retrieved ${rows.length} races`);
    res.json(rows);
  });
});

// Legacy endpoint for backward compatibility
app.get('/api/events', (req, res) => {
  console.log('📋 Legacy events endpoint - redirecting to races');
  
  db.all('SELECT * FROM races ORDER BY date, time', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching races:', err.message);
      res.status(500).json({ 
        error: 'Database error', 
        message: err.message 
      });
      return;
    }
    
    // Transform races to legacy event format
    const events = rows.map(race => ({
      ...race,
      type: race.distance // Map distance to type for backward compatibility
    }));
    
    console.log(`✅ Retrieved ${events.length} races (legacy format)`);
    res.json(events);
  });
});

/**
 * GET /api/races/range
 * Get races for a specific date range
 */
app.get('/api/races/range', (req, res) => {
  const { start, end } = req.query;
  
  if (!start || !end) {
    res.status(400).json({ error: 'Start and end dates are required' });
    return;
  }

  console.log(`🗓️ Fetching races from ${start} to ${end}`);

  db.all(
    'SELECT * FROM races WHERE date >= ? AND date <= ? ORDER BY date, time',
    [start, end],
    (err, rows) => {
      if (err) {
        console.error('❌ Error fetching races by range:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      console.log(`✅ Retrieved ${rows.length} races in date range`);
      res.json(rows);
    }
  );
});

/**
 * POST /api/races
 * Create new triathlon race
 * 
 * @body {Object} Race data
 * @example
 * POST /api/races
 * Body: {
 *   "title": "City Sprint Triathlon",
 *   "date": "2025-08-15",
 *   "time": "08:00",
 *   "distance": "sprint",
 *   "location": "City Beach",
 *   "description": "Annual sprint race"
 * }
 */
app.post('/api/races', (req, res) => {
  const { title, date, time, distance, description, location } = req.body;
  
  // Validate required fields
  if (!title || !date || !distance) {
    res.status(400).json({ error: 'Title, date, and distance are required' });
    return;
  }

  // Validate distance
  const validDistances = ['sprint', 'olympic', 'middle', 'long'];
  if (!validDistances.includes(distance)) {
    res.status(400).json({ 
      error: 'Invalid distance. Must be one of: sprint, olympic, middle, long' 
    });
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  console.log('🏁 Creating new race:', { title, date, distance });

  db.run(
    `INSERT INTO races (id, title, date, time, distance, description, location, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, title, date, time, distance, description, location, now, now],
    function(err) {
      if (err) {
        console.error('❌ Error creating race:', err.message);
        res.status(500).json({ error: err.message });
        return;
      }
      
      // Return the created race
      db.get('SELECT * FROM races WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('❌ Error fetching created race:', err.message);
          res.status(500).json({ error: err.message });
          return;
        }
        console.log('✅ Race created successfully:', row.title);
        res.status(201).json(row);
      });
    }
  );
});

// Legacy event creation endpoint
app.post('/api/events', (req, res) => {
  const { title, date, time, type, description, location } = req.body;
  
  console.log('📋 Legacy event creation - converting to race');
  
  // Map legacy type to distance
  const distance = type || 'sprint';
  
  // Forward to race creation
  req.body.distance = distance;
  delete req.body.type;
  
  // Call race creation logic
  const { title: raceTitle, date: raceDate, time: raceTime, distance: raceDistance, description: raceDesc, location: raceLoc } = req.body;
  
  if (!raceTitle || !raceDate || !raceDistance) {
    res.status(400).json({ error: 'Title, date, and distance are required' });
    return;
  }

  const id = uuidv4();
  const now = new Date().toISOString();

  db.run(
    `INSERT INTO races (id, title, date, time, distance, description, location, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, raceTitle, raceDate, raceTime, raceDistance, raceDesc, raceLoc, now, now],
    function(err) {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      
      db.get('SELECT * FROM races WHERE id = ?', [id], (err, row) => {
        if (err) {
          res.status(500).json({ error: err.message });
          return;
        }
        // Return in legacy format
        const event = { ...row, type: row.distance };
        res.status(201).json(event);
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
