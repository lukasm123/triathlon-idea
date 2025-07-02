/**
 * Triathlon Race Calendar Component
 * 
 * A specialized calendar interface for triathlon race scheduling with automatic
 * recovery period visualization. Helps athletes plan their race calendar by
 * showing recovery periods and detecting scheduling conflicts.
 * 
 * Key Features:
 * - Monthly calendar view with Monday-Sunday week layout
 * - Race display with color coding by distance (Sprint, Olympic, Middle, Long)
 * - Automatic recovery period calculation and visualization
 * - Conflict detection when races overlap with recovery periods
 * - Click-to-create races on any day
 * - Click-to-edit existing races
 * - Recovery period intensity indicators
 * 
 * Recovery Periods:
 * - Sprint: ~3 days
 * - Olympic: ~5-7 days  
 * - Middle: ~10-14 days
 * - Long: ~25-35 days
 * 
 * @component
 * @example
 * <Calendar
 *   races={races}
 *   onRaceCreate={handleCreate}
 *   onRaceUpdate={handleUpdate}
 *   onRaceDelete={handleDelete}
 * />
 */

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, AlertTriangle, Info } from 'lucide-react';
import { TriathlonRace, CalendarDay, SchedulingConflict } from '../types';
import { 
  getCalendarDays, 
  getRaceDistanceColor, 
  getRaceDistanceIcon,
  getRecoveryColor,
  formatRecoveryPeriod,
  detectSchedulingConflicts
} from '../utils/dateUtils';
import EventModal from './EventModal';

/**
 * Props for the Calendar component
 */
interface CalendarProps {
  /** Array of triathlon races to display */
  races: TriathlonRace[];
  /** Callback function when a new race is created */
  onRaceCreate: (race: any) => void;
  /** Callback function when a race is updated */
  onRaceUpdate: (id: string, race: any) => void;
  /** Callback function when a race is deleted */
  onRaceDelete: (id: string) => void;
}

/**
 * Main Calendar Component Implementation
 */
const Calendar: React.FC<CalendarProps> = ({ races, onRaceCreate, onRaceUpdate, onRaceDelete }) => {
  // State Management
  const [currentDate, setCurrentDate] = useState(new Date()); // Currently displayed month
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]); // Calendar grid data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Date selected for race creation
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [selectedRace, setSelectedRace] = useState<TriathlonRace | null>(null); // Race selected for editing
  const [schedulingConflict, setSchedulingConflict] = useState<SchedulingConflict | null>(null); // Current conflict

    /**
   * Effect: Update calendar days when current month or races change
   * Generates the calendar grid with races and recovery periods
   */
  useEffect(() => {
    // For now, use simplified calendar generation
    const days = getCalendarDays(startOfMonth(currentDate));
    
    // Associate races with their corresponding calendar days
    const daysWithRaces = days.map(day => ({
      ...day,
      races: races.filter(race => isSameDay(new Date(race.date), day.date)),
      recoveryPeriods: [], // TODO: Implement recovery period calculation
      hasConflict: false
    }));
    
    setCalendarDays(daysWithRaces);
    console.log(`🏁 Calendar updated for ${format(currentDate, 'MMMM yyyy')} with ${races.length} races`);
    }, [currentDate, races]);

  // Event Handlers
  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    console.log('📅 Navigated to:', format(newDate, 'MMMM yyyy'));
  };

  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    console.log('📅 Navigated to:', format(newDate, 'MMMM yyyy'));
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedRace(null);
    setIsModalOpen(true);
    console.log('📅 Day clicked for new race:', format(day.date, 'yyyy-MM-dd'));
  };

  const handleRaceClick = (race: TriathlonRace, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRace(race);
    setSelectedDate(new Date(race.date));
    setIsModalOpen(true);
    console.log('✏️ Race clicked for editing:', race.title);
  };

  const handleAddRace = () => {
    setSelectedDate(new Date());
    setSelectedRace(null);
    setIsModalOpen(true);
    console.log('➕ Add Race button clicked');
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleAddRace}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Race</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`
              min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
              ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
              ${isToday(day.date) ? 'bg-blue-50 border-blue-200' : ''}
            `}
          >
            <div className={`
              text-sm font-medium mb-1
              ${isToday(day.date) ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
            `}>
              {format(day.date, 'd')}
            </div>
            
            {/* Races */}
            <div className="space-y-1">
              {day.races.slice(0, 3).map(race => (
                <div
                  key={race.id}
                  onClick={(e) => handleRaceClick(race, e)}
                  className={`
                    text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity
                    ${getRaceDistanceColor(race.distance)}
                  `}
                  title={`${race.title}${race.time ? ` at ${race.time}` : ''}`}
                >
                  <span className="mr-1">{getRaceDistanceIcon(race.distance)}</span>
                  <span className="truncate">{race.title}</span>
                </div>
              ))}
              
              {day.races.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{day.races.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Modal - Using existing EventModal for compatibility */}
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedRace ? { ...selectedRace, type: selectedRace.distance } : null}
          selectedDate={selectedDate}
          onSave={selectedRace ? 
            (raceData) => onRaceUpdate(selectedRace.id, { ...raceData, distance: raceData.type }) : 
            (raceData) => onRaceCreate({ ...raceData, distance: raceData.type })
          }
          onDelete={selectedRace ? () => onRaceDelete(selectedRace.id) : undefined}
        />
      )}
    </div>
  );
};

    // Event Handlers

  /**
   * Navigate to the previous month
   */
  const handlePrevMonth = () => {
    const newDate = subMonths(currentDate, 1);
    setCurrentDate(newDate);
    console.log('📅 Navigated to:', format(newDate, 'MMMM yyyy'));
  };

  /**
   * Navigate to the next month
   */
  const handleNextMonth = () => {
    const newDate = addMonths(currentDate, 1);
    setCurrentDate(newDate);
    console.log('📅 Navigated to:', format(newDate, 'MMMM yyyy'));
  };

  /**
   * Handle clicking on a calendar day to create a new event
   * @param day - The calendar day that was clicked
   */
  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedEvent(null); // Clear any selected event (we're creating new)
    setIsModalOpen(true);
    console.log('📅 Day clicked for new event:', format(day.date, 'yyyy-MM-dd'));
  };

  /**
   * Handle clicking on an existing event to edit it
   * @param event - The event that was clicked
   * @param e - Mouse event (used to prevent day click propagation)
   */
  const handleEventClick = (event: TriathlonEvent, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering day click
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setIsModalOpen(true);
    console.log('✏️ Event clicked for editing:', event.title);
  };

    /**
   * Handle clicking the "Add Race" button to create a new race for today
   */
  const handleAddRace = () => {
    setSelectedDate(new Date()); // Default to today
    setSelectedRace(null);
    setIsModalOpen(true);
    console.log('➕ Add Race button clicked');
  };

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {format(currentDate, 'MMMM yyyy')}
          </h2>
          <div className="flex items-center space-x-1">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleAddEvent}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Event</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Week day headers */}
        {weekDays.map(day => (
          <div key={day} className="p-3 text-center text-sm font-medium text-gray-500 border-b">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            onClick={() => handleDayClick(day)}
            className={`
              min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
              ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
              ${isToday(day.date) ? 'bg-blue-50 border-blue-200' : ''}
            `}
          >
            <div className={`
              text-sm font-medium mb-1
              ${isToday(day.date) ? 'text-blue-600' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
            `}>
              {format(day.date, 'd')}
            </div>
            
            {/* Events */}
            <div className="space-y-1">
              {day.events.slice(0, 3).map(event => (
                <div
                  key={event.id}
                  onClick={(e) => handleEventClick(event, e)}
                  className={`
                    text-xs px-2 py-1 rounded text-white cursor-pointer hover:opacity-80 transition-opacity
                    ${getEventTypeColor(event.type)}
                  `}
                  title={`${event.title}${event.time ? ` at ${event.time}` : ''}`}
                >
                  <span className="mr-1">{getEventTypeIcon(event.type)}</span>
                  <span className="truncate">{event.title}</span>
                </div>
              ))}
              
              {day.events.length > 3 && (
                <div className="text-xs text-gray-500 px-2">
                  +{day.events.length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Event Modal */}
      {isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          event={selectedEvent}
          selectedDate={selectedDate}
          onSave={selectedEvent ? 
            (eventData) => onEventUpdate(selectedEvent.id, eventData) : 
            onEventCreate
          }
          onDelete={selectedEvent ? () => onEventDelete(selectedEvent.id) : undefined}
        />
      )}
    </div>
  );
};

export default Calendar;
