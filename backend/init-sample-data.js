/**
 * Initialize sample data for the Triathlon Scheduler
 * This script adds sample events to demonstrate the application functionality
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'triathlon_events.db');
const db = new sqlite3.Database(dbPath);

// Sample events data
const sampleEvents = [
  {
    title: 'Morning Swim Training',
    date: '2025-07-03',
    time: '07:00',
    type: 'training',
    description: '1500m freestyle practice - focus on technique and breathing',
    location: 'Local Swimming Pool'
  },
  {
    title: 'Olympic Triathlon Race',
    date: '2025-07-06',
    time: '08:00',
    type: 'race',
    description: '1.5km swim, 40km bike, 10km run - Season opener!',
    location: 'City Park Triathlon Course'
  },
  {
    title: 'Bike Training - Hill Repeats',
    date: '2025-07-04',
    time: '18:00',
    type: 'training',
    description: '8x 3min hill repeats with 2min recovery',
    location: 'Mountain Road'
  },
  {
    title: 'Recovery Yoga Session',
    date: '2025-07-05',
    time: '10:00',
    type: 'recovery',
    description: 'Gentle yoga and stretching for recovery',
    location: 'Home Studio'
  },
  {
    title: 'Brick Workout',
    date: '2025-07-07',
    time: '09:00',
    type: 'training',
    description: '45min bike + 20min run transition practice',
    location: 'Training Center'
  },
  {
    title: 'Sprint Triathlon',
    date: '2025-07-13',
    time: '07:30',
    type: 'race',
    description: '750m swim, 20km bike, 5km run',
    location: 'Lakeside Sports Complex'
  }
];

// Initialize database and insert sample data
db.serialize(() => {
  // Create table if it doesn't exist
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

  // Clear existing data (optional - remove this line if you want to keep existing events)
  db.run('DELETE FROM events');

  // Insert sample events
  const insertStmt = db.prepare(`
    INSERT INTO events (id, title, date, time, type, description, location, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  sampleEvents.forEach(event => {
    const id = uuidv4();
    insertStmt.run([
      id,
      event.title,
      event.date,
      event.time,
      event.type,
      event.description,
      event.location,
      now,
      now
    ]);
  });

  insertStmt.finalize();

  // Verify data was inserted
  db.all('SELECT COUNT(*) as count FROM events', (err, rows) => {
    if (err) {
      console.error('❌ Error counting events:', err.message);
    } else {
      console.log(`✅ Sample data initialized: ${rows[0].count} events added`);
    }
  });

  // Display all events
  db.all('SELECT * FROM events ORDER BY date, time', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching events:', err.message);
    } else {
      console.log('\n📅 Sample Events Added:');
      rows.forEach(event => {
        const eventIcon = event.type === 'race' ? '🏆' : 
                         event.type === 'training' ? '🏊‍♂️' : 
                         event.type === 'recovery' ? '🧘‍♂️' : '📅';
        console.log(`${eventIcon} ${event.date} ${event.time || ''} - ${event.title}`);
      });
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('\n🎉 Sample data initialization complete!');
      }
    });
  });
});
