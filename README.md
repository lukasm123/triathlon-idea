# 🏊‍♂️🚴‍♂️🏃‍♂️ Triathlon Scheduler

A modern, clean web application for scheduling and managing your triathlon training and events.

## ✨ Features

- **Clean Calendar Interface**: Monthly view with Monday-Sunday week layout
- **Event Management**: Create, edit, and delete triathlon events
- **Event Types**: Categorize events as Training 🏊‍♂️, Race 🏆, Recovery 🧘‍♂️, or Other 📅
- **Event Details**: Track time, location, and descriptions
- **Responsive Design**: Works beautifully on desktop and mobile
- **Modern UI**: Clean, professional interface following design best practices

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + SQLite
- **Database**: SQLite for lightweight, local data persistence
- **API**: RESTful API design with full CRUD operations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Development Setup

1. **Install Dependencies**:
   ```bash
   # Backend
   cd backend && npm install
   
   # Frontend
   cd ../frontend && npm install
   ```

2. **Start the Backend** (Port 3001):
   ```bash
   cd backend
   npm start
   ```

3. **Start the Frontend** (Port 3000):
   ```bash
   cd frontend
   npm start
   ```

4. **Access the Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001/api

## 📅 Usage

1. **View Calendar**: See your monthly schedule with all events
2. **Add Events**: Click "Add Event" or click on any day
3. **Edit Events**: Click on existing events to modify them
4. **Event Types**:
   - 🏊‍♂️ **Training**: Regular training sessions
   - 🏆 **Race**: Competition events
   - 🧘‍♂️ **Recovery**: Rest and recovery activities
   - 📅 **Other**: General events

## 🛠️ Development

### Project Structure

```
triathlon-idea/
├── backend/           # Node.js API server
│   ├── server.js     # Main server file
│   └── package.json  # Backend dependencies
├── frontend/         # React application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── types/      # TypeScript types
│   │   ├── utils/      # Utility functions
│   │   └── App.tsx     # Main app component
│   └── package.json    # Frontend dependencies
└── .gitpod/          # Development environment config
```

### API Endpoints

- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event
- `GET /api/health` - Health check

## 🎯 Future Enhancements

- Training plan templates
- Performance tracking
- Calendar export/import
- Multi-user support
- Mobile app
- Integration with fitness trackers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Ready to plan your triathlon journey!** 🏊‍♂️🚴‍♂️🏃‍♂️
