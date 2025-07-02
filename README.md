# 🏊‍♂️🚴‍♂️🏃‍♂️ Triathlon Race Scheduler

A specialized web application for intelligent triathlon race scheduling with automatic recovery period calculation and conflict detection. Helps athletes plan their race calendar by visualizing recovery periods and preventing scheduling conflicts.

## ✨ Key Features

### 🏁 **Intelligent Race Scheduling**
- **Race Distance Categories**: Sprint, Olympic, Middle Distance (70.3), Long Distance (Ironman)
- **Automatic Recovery Calculation**: Science-based recovery periods for each distance
- **Conflict Detection**: Warns when races overlap with recovery periods
- **Visual Recovery Periods**: See recovery zones directly in the calendar

### 📊 **Recovery Period System**
- **🏃‍♂️ Sprint Distance**: ~3 days recovery (750m swim, 20km bike, 5km run)
- **🥇 Olympic Distance**: ~5-7 days recovery (1.5km swim, 40km bike, 10km run)
- **💪 Middle Distance (70.3)**: ~10-14 days recovery (1.9km swim, 90km bike, 21.1km run)
- **🔥 Long Distance (Ironman)**: ~25-35 days recovery (3.8km swim, 180km bike, 42.2km run)

### 🎨 **Modern Interface**
- **Clean Calendar View**: Monthly layout with Monday-Sunday week structure
- **Color-Coded Races**: Visual distinction between race distances
- **Recovery Visualization**: Clear indicators for recovery periods
- **Conflict Warnings**: Smart alerts for scheduling conflicts
- **Responsive Design**: Works perfectly on all devices

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Database**: SQLite with race-specific schema
- **API**: RESTful design with race distance support
- **Testing**: Jest + React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm

### Quick Start

1. **Clone and Setup**:
   ```bash
   git clone https://github.com/lukasm123/triathlon-idea.git
   cd triathlon-idea
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   node init-race-data.js  # Initialize sample data
   npm start              # Starts on port 3001
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   npm start             # Starts on port 3000
   ```

4. **Access Application**:
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001/api

## 📅 How to Use

### 🏁 **Race Planning**
1. **Add Races**: Click "Add Race" or click any calendar day
2. **Select Distance**: Choose Sprint, Olympic, Middle, or Long distance
3. **View Recovery**: Automatic recovery period calculation and display
4. **Conflict Detection**: Get warnings for races scheduled during recovery

### 📊 **Recovery Management**
- **Visual Indicators**: Recovery periods shown as colored overlays
- **Intensity Levels**: Light, moderate, and heavy recovery visualization
- **Smart Warnings**: Conflict alerts with severity levels
- **Planning Assistance**: Optimal race spacing recommendations

## 🛠️ Development

### Project Structure

```
triathlon-idea/
├── backend/                    # Node.js API server
│   ├── server.js              # Main server with race endpoints
│   ├── init-race-data.js      # Sample data initialization
│   └── package.json           # Backend dependencies
├── frontend/                   # React application
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── Calendar.tsx   # Main calendar component
│   │   │   ├── EventModal.tsx # Race creation/editing modal
│   │   │   └── *.test.tsx     # Component tests
│   │   ├── types/             # TypeScript definitions
│   │   ├── utils/             # Date and recovery utilities
│   │   └── App.tsx            # Main application
│   ├── validate.js            # Frontend validation script
│   └── package.json           # Frontend dependencies
└── .gitpod/                   # Development environment
```

### 🧪 **Testing & Quality Assurance**

```bash
# Frontend testing
cd frontend
npm test                # Run all tests
npm run test:coverage   # Run with coverage
npm run validate        # Full validation (type-check + lint + test)

# Type checking
npm run type-check      # TypeScript validation

# Build validation
npm run build          # Ensure no compilation errors
```

### 🔧 **API Endpoints**

#### Race Management
- `GET /api/races` - Get all races
- `POST /api/races` - Create new race
- `PUT /api/races/:id` - Update race
- `DELETE /api/races/:id` - Delete race
- `GET /api/races/range?start=YYYY-MM-DD&end=YYYY-MM-DD` - Get races by date range

#### Legacy Compatibility
- `GET /api/events` - Legacy endpoint (maps to races)
- `POST /api/events` - Legacy race creation

#### System
- `GET /api/health` - Health check

### 📊 **Sample Data**

The application includes strategically spaced sample races:

1. **Spring Sprint Triathlon** (July 5) - Demonstrates sprint recovery
2. **Olympic Distance Championship** (July 20) - Shows Olympic spacing
3. **Mid-Season Sprint** (August 2) - Quick turnaround example
4. **Half Ironman 70.3** (August 24) - Middle distance recovery
5. **Late Season Olympic** (September 15) - Optimal spacing
6. **Ironman Full Distance** (October 12) - Long distance planning

## 🎯 **Recovery Science**

The application uses evidence-based recovery periods:

- **Sprint**: Minimal impact, quick recovery (2-4 days)
- **Olympic**: Moderate stress, standard recovery (5-7 days)
- **Middle**: Significant stress, extended recovery (10-14 days)
- **Long**: Maximum stress, extensive recovery (25-35 days)

## 🚧 **Quality Assurance**

### Automated Testing
- **Unit Tests**: Component and utility function testing
- **Integration Tests**: API endpoint validation
- **Type Safety**: Full TypeScript coverage
- **Build Validation**: Compilation error prevention

### Pre-Commit Validation
```bash
cd frontend && npm run validate
```

This runs:
1. TypeScript type checking
2. ESLint code quality checks
3. Jest unit tests
4. Build compilation test

## 🎯 **Future Enhancements**

- **Advanced Recovery Visualization**: Heat maps and intensity indicators
- **Training Integration**: Connect with training plans
- **Performance Tracking**: Race result analysis
- **Multi-Athlete Support**: Team and coach features
- **Mobile App**: Native iOS/Android applications
- **Wearable Integration**: Garmin, Polar, Suunto connectivity

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Run validation: `cd frontend && npm run validate`
4. Make your changes with tests
5. Ensure all tests pass
6. Submit a pull request

## 📄 **License**

This project is open source and available under the [MIT License](LICENSE).

---

**Intelligent race planning for serious triathletes!** 🏊‍♂️🚴‍♂️🏃‍♂️

*Plan smarter, race better, recover properly.*
