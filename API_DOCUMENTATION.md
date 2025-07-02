# 🏊‍♂️🚴‍♂️🏃‍♂️ Triathlon Scheduler API Documentation

## Overview

The Triathlon Scheduler API is a RESTful service built with Node.js and Express that manages triathlon events including training sessions, races, recovery activities, and other events. Data is stored in a lightweight SQLite database.

## Base URL

- **Development**: `http://localhost:3001/api`
- **Gitpod**: `https://3001--{environment-id}.us01.gitpod.dev/api`

## Authentication

Currently, no authentication is required. This is a development version suitable for personal use.

## Data Models

### Event Object

```typescript
interface TriathlonEvent {
  id: string;              // UUID identifier
  title: string;           // Event name
  date: string;            // Date in YYYY-MM-DD format
  time?: string;           // Time in HH:MM format (optional)
  type: EventType;         // Event category
  description?: string;    // Optional description
  location?: string;       // Optional location
  created_at: string;      // ISO timestamp
  updated_at: string;      // ISO timestamp
}
```

### Event Types

- `training` 🏊‍♂️ - Training sessions (swim, bike, run, brick workouts)
- `race` 🏆 - Competition events (triathlons, races)
- `recovery` 🧘‍♂️ - Recovery activities (yoga, massage, rest days)
- `other` 📅 - General events (meetings, equipment maintenance)

## API Endpoints

### 1. Health Check

**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2025-07-02T17:34:09.031Z"
}
```

### 2. Get All Events

**GET** `/api/events`

Retrieve all triathlon events ordered by date and time.

**Response:**
```json
[
  {
    "id": "uuid-123",
    "title": "Morning Swim Training",
    "date": "2025-07-03",
    "time": "07:00",
    "type": "training",
    "description": "1500m freestyle practice",
    "location": "Local Pool",
    "created_at": "2025-07-02T17:00:00.000Z",
    "updated_at": "2025-07-02T17:00:00.000Z"
  }
]
```

### 3. Get Events by Date Range

**GET** `/api/events/range?start=YYYY-MM-DD&end=YYYY-MM-DD`

Retrieve events within a specific date range.

**Query Parameters:**
- `start` (required): Start date in YYYY-MM-DD format
- `end` (required): End date in YYYY-MM-DD format

**Example:**
```
GET /api/events/range?start=2025-07-01&end=2025-07-31
```

### 4. Create New Event

**POST** `/api/events`

Create a new triathlon event.

**Request Body:**
```json
{
  "title": "Evening Run",
  "date": "2025-07-04",
  "time": "18:30",
  "type": "training",
  "description": "5km easy pace",
  "location": "Park Trail"
}
```

**Required Fields:**
- `title` (string): Event name
- `date` (string): Date in YYYY-MM-DD format
- `type` (string): One of: training, race, recovery, other

**Optional Fields:**
- `time` (string): Time in HH:MM format
- `description` (string): Event description
- `location` (string): Event location

**Response:**
```json
{
  "id": "uuid-456",
  "title": "Evening Run",
  "date": "2025-07-04",
  "time": "18:30",
  "type": "training",
  "description": "5km easy pace",
  "location": "Park Trail",
  "created_at": "2025-07-02T17:35:00.000Z",
  "updated_at": "2025-07-02T17:35:00.000Z"
}
```

### 5. Update Event

**PUT** `/api/events/{id}`

Update an existing event.

**Path Parameters:**
- `id` (string): Event UUID

**Request Body:**
```json
{
  "title": "Updated Event Title",
  "date": "2025-07-05",
  "time": "19:00",
  "type": "race",
  "description": "Updated description",
  "location": "New Location"
}
```

**Response:**
Returns the updated event object.

### 6. Delete Event

**DELETE** `/api/events/{id}`

Delete an event.

**Path Parameters:**
- `id` (string): Event UUID

**Response:**
```json
{
  "message": "Event deleted successfully"
}
```

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

### 400 Bad Request
```json
{
  "error": "Title, date, and type are required"
}
```

### 404 Not Found
```json
{
  "error": "Event not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database error",
  "message": "Detailed error message"
}
```

## Sample Data

The API comes with sample data including:

- **Morning Swim Training** (2025-07-03 07:00) - Training
- **Bike Training - Hill Repeats** (2025-07-04 18:00) - Training
- **Recovery Yoga Session** (2025-07-05 10:00) - Recovery
- **Olympic Triathlon Race** (2025-07-06 08:00) - Race
- **Brick Workout** (2025-07-07 09:00) - Training
- **Sprint Triathlon** (2025-07-13 07:30) - Race

## Usage Examples

### JavaScript/Fetch

```javascript
// Get all events
const events = await fetch('/api/events').then(r => r.json());

// Create new event
const newEvent = await fetch('/api/events', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: 'Morning Swim',
    date: '2025-07-10',
    time: '06:30',
    type: 'training',
    location: 'Pool'
  })
}).then(r => r.json());

// Update event
const updated = await fetch(`/api/events/${eventId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Updated Title' })
}).then(r => r.json());

// Delete event
await fetch(`/api/events/${eventId}`, { method: 'DELETE' });
```

### cURL

```bash
# Get all events
curl https://3001--{env-id}.us01.gitpod.dev/api/events

# Create event
curl -X POST https://3001--{env-id}.us01.gitpod.dev/api/events \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Event","date":"2025-07-10","type":"training"}'

# Update event
curl -X PUT https://3001--{env-id}.us01.gitpod.dev/api/events/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'

# Delete event
curl -X DELETE https://3001--{env-id}.us01.gitpod.dev/api/events/{id}
```

## Database Schema

```sql
CREATE TABLE events (
  id TEXT PRIMARY KEY,              -- UUID identifier
  title TEXT NOT NULL,              -- Event title
  date TEXT NOT NULL,               -- Event date (YYYY-MM-DD)
  time TEXT,                        -- Event time (HH:MM, optional)
  type TEXT NOT NULL,               -- Event type
  description TEXT,                 -- Optional description
  location TEXT,                    -- Optional location
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## Development

### Initialize Sample Data

```bash
cd backend
node init-sample-data.js
```

### Start Development Server

```bash
cd backend
npm run dev  # Uses nodemon for auto-restart
# or
npm start    # Standard start
```

## Rate Limiting

Currently no rate limiting is implemented. In production, consider implementing rate limiting for API protection.

## CORS

CORS is enabled for all origins in development. Configure appropriately for production use.
