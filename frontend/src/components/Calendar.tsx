/**
 * Calendar Component
 * 
 * A comprehensive calendar interface for managing triathlon events.
 * Features a monthly view with Monday-Sunday week layout, event creation,
 * editing, and deletion capabilities.
 * 
 * Key Features:
 * - Monthly calendar view with proper week layout (Monday start)
 * - Event display with color coding by type
 * - Click-to-create events on any day
 * - Click-to-edit existing events
 * - Responsive design for all screen sizes
 * - Today highlighting and month navigation
 * 
 * @component
 * @example
 * <Calendar
 *   events={events}
 *   onEventCreate={handleCreate}
 *   onEventUpdate={handleUpdate}
 *   onEventDelete={handleDelete}
 * />
 */

import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TriathlonEvent, CalendarDay } from '../types';
import { getCalendarDays, getEventTypeColor, getEventTypeIcon } from '../utils/dateUtils';
import EventModal from './EventModal';

/**
 * Props for the Calendar component
 */
interface CalendarProps {
  /** Array of triathlon events to display */
  events: TriathlonEvent[];
  /** Callback function when a new event is created */
  onEventCreate: (event: any) => void;
  /** Callback function when an event is updated */
  onEventUpdate: (id: string, event: any) => void;
  /** Callback function when an event is deleted */
  onEventDelete: (id: string) => void;
}

/**
 * Main Calendar Component Implementation
 */
const Calendar: React.FC<CalendarProps> = ({ events, onEventCreate, onEventUpdate, onEventDelete }) => {
  // State Management
  const [currentDate, setCurrentDate] = useState(new Date()); // Currently displayed month
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]); // Calendar grid data
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Date selected for event creation
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [selectedEvent, setSelectedEvent] = useState<TriathlonEvent | null>(null); // Event selected for editing

  /**
   * Effect: Update calendar days when current month or events change
   * Generates the calendar grid and associates events with their respective days
   */
  useEffect(() => {
    // Generate calendar grid for the current month
    const days = getCalendarDays(startOfMonth(currentDate));
    
    // Associate events with their corresponding calendar days
    const daysWithEvents = days.map(day => ({
      ...day,
      events: events.filter(event => isSameDay(new Date(event.date), day.date))
    }));
    
    setCalendarDays(daysWithEvents);
    console.log(`📅 Calendar updated for ${format(currentDate, 'MMMM yyyy')} with ${events.length} events`);
  }, [currentDate, events]);

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
   * Handle clicking the "Add Event" button to create a new event for today
   */
  const handleAddEvent = () => {
    setSelectedDate(new Date()); // Default to today
    setSelectedEvent(null);
    setIsModalOpen(true);
    console.log('➕ Add Event button clicked');
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
