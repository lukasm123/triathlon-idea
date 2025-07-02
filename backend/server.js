const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = path.join(__dirname, 'triathlon_events.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    type TEXT NOT NULL,
    description TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);
});

// Routes

// Get all events
app.get('/api/events', (req, res) => {
  db.all('SELECT * FROM events ORDER BY date, time', (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
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
