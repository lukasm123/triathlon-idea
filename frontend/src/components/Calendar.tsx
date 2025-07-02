import React, { useState, useEffect } from 'react';
import { format, addMonths, subMonths, startOfMonth, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TriathlonEvent, CalendarDay } from '../types';
import { getCalendarDays, getEventTypeColor, getEventTypeIcon } from '../utils/dateUtils';
import EventModal from './EventModal';

interface CalendarProps {
  events: TriathlonEvent[];
  onEventCreate: (event: any) => void;
  onEventUpdate: (id: string, event: any) => void;
  onEventDelete: (id: string) => void;
}

const Calendar: React.FC<CalendarProps> = ({ events, onEventCreate, onEventUpdate, onEventDelete }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<CalendarDay[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TriathlonEvent | null>(null);

  useEffect(() => {
    const days = getCalendarDays(startOfMonth(currentDate));
    
    // Add events to calendar days
    const daysWithEvents = days.map(day => ({
      ...day,
      events: events.filter(event => isSameDay(new Date(event.date), day.date))
    }));
    
    setCalendarDays(daysWithEvents);
  }, [currentDate, events]);

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDate(day.date);
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: TriathlonEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setSelectedDate(new Date(event.date));
    setIsModalOpen(true);
  };

  const handleAddEvent = () => {
    setSelectedDate(new Date());
    setSelectedEvent(null);
    setIsModalOpen(true);
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
