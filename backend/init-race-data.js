/**
 * Initialize sample triathlon race data
 * This script adds sample races to demonstrate the race scheduling and recovery period functionality
 */

const sqlite3 = require('sqlite3').verbose();
const { v4: uuidv4 } = require('uuid');
const path = require('path');

// Database setup
const dbPath = path.join(__dirname, 'triathlon_events.db');
const db = new sqlite3.Database(dbPath);

// Sample race data with different distances and strategic spacing
const sampleRaces = [
  {
    title: 'Spring Sprint Triathlon',
    date: '2025-07-05',
    time: '08:00',
    distance: 'sprint',
    description: 'Season opener - 750m swim, 20km bike, 5km run',
    location: 'City Beach'
  },
  {
    title: 'Olympic Distance Championship',
    date: '2025-07-20',
    time: '07:00',
    distance: 'olympic',
    description: 'Regional championship - 1.5km swim, 40km bike, 10km run',
    location: 'Lake Park'
  },
  {
    title: 'Mid-Season Sprint',
    date: '2025-08-02',
    time: '08:30',
    distance: 'sprint',
    description: 'Fast and fun sprint race',
    location: 'River Course'
  },
  {
    title: 'Half Ironman 70.3',
    date: '2025-08-24',
    time: '06:30',
    distance: 'middle',
    description: 'Challenge yourself - 1.9km swim, 90km bike, 21.1km run',
    location: 'Mountain Resort'
  },
  {
    title: 'Late Season Olympic',
    date: '2025-09-15',
    time: '07:30',
    distance: 'olympic',
    description: 'Perfect weather for a fast race',
    location: 'Coastal Course'
  },
  {
    title: 'Ironman Full Distance',
    date: '2025-10-12',
    time: '06:00',
    distance: 'long',
    description: 'The ultimate challenge - 3.8km swim, 180km bike, 42.2km run',
    location: 'Ironman Village'
  }
];

// Recovery period information for reference
const recoveryInfo = {
  sprint: '~3 days recovery',
  olympic: '~5-7 days recovery',
  middle: '~10-14 days recovery',
  long: '~25-35 days recovery'
};

// Initialize database and insert sample data
db.serialize(() => {
  // Create races table
  db.run(`CREATE TABLE IF NOT EXISTS races (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    time TEXT,
    distance TEXT NOT NULL,
    description TEXT,
    location TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Clear existing race data
  db.run('DELETE FROM races');

  // Insert sample races
  const insertStmt = db.prepare(`
    INSERT INTO races (id, title, date, time, distance, description, location, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const now = new Date().toISOString();

  sampleRaces.forEach(race => {
    const id = uuidv4();
    insertStmt.run([
      id,
      race.title,
      race.date,
      race.time,
      race.distance,
      race.description,
      race.location,
      now,
      now
    ]);
  });

  insertStmt.finalize();

  // Verify data was inserted
  db.all('SELECT COUNT(*) as count FROM races', (err, rows) => {
    if (err) {
      console.error('❌ Error counting races:', err.message);
    } else {
      console.log(`✅ Sample race data initialized: ${rows[0].count} races added`);
    }
  });

  // Display all races with recovery information
  db.all('SELECT * FROM races ORDER BY date, time', (err, rows) => {
    if (err) {
      console.error('❌ Error fetching races:', err.message);
    } else {
      console.log('\n🏁 Sample Races Added:');
      console.log('=====================================');
      
      rows.forEach((race, index) => {
        const distanceIcons = {
          sprint: '🏃‍♂️',
          olympic: '🥇',
          middle: '💪',
          long: '🔥'
        };
        
        const icon = distanceIcons[race.distance] || '🏁';
        const recovery = recoveryInfo[race.distance] || 'Unknown recovery';
        
        console.log(`${icon} ${race.date} ${race.time} - ${race.title}`);
        console.log(`   Distance: ${race.distance.toUpperCase()} (${recovery})`);
        console.log(`   Location: ${race.location}`);
        
        if (index < rows.length - 1) {
          console.log('');
        }
      });
      
      console.log('\n📊 Recovery Period Guide:');
      console.log('========================');
      console.log('🏃‍♂️ Sprint Distance: ~3 days recovery');
      console.log('🥇 Olympic Distance: ~5-7 days recovery');
      console.log('💪 Middle Distance (70.3): ~10-14 days recovery');
      console.log('🔥 Long Distance (Ironman): ~25-35 days recovery');
    }
    
    // Close database connection
    db.close((err) => {
      if (err) {
        console.error('❌ Error closing database:', err.message);
      } else {
        console.log('\n🎉 Race data initialization complete!');
        console.log('💡 The calendar will now show recovery periods for each race.');
      }
    });
  });
});
