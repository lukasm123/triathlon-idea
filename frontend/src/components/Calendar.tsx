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
import { format, addMonths, subMonths, startOfMonth, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { TriathlonRace, CalendarDay } from '../types';
import { 
  getCalendarDays, 
  getRaceDistanceColor, 
  getRaceDistanceIcon,
  getRecoveryDayStyle,
  getRecoveryTooltip
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

    /**
   * Effect: Update calendar days when current month or races change
   * Generates the calendar grid with races and recovery periods
   */
  useEffect(() => {
    // Generate calendar grid with full recovery period calculation
    const days = getCalendarDays(startOfMonth(currentDate), races);
    
    setCalendarDays(days);
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
        {calendarDays.map((day, index) => {
          const recoveryStyle = getRecoveryDayStyle(day.recoveryPeriods);
          const recoveryTooltip = getRecoveryTooltip(day.recoveryPeriods);
          
          return (
            <div
              key={index}
              onClick={() => handleDayClick(day)}
              className={`
                min-h-[120px] p-2 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors
                ${!day.isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''}
                ${isToday(day.date) ? 'bg-blue-50 border-blue-200' : ''}
                ${recoveryStyle}
                ${day.hasConflict ? 'bg-red-50 border-red-300' : ''}
              `}
              title={recoveryTooltip || `${format(day.date, 'MMMM d, yyyy')}`}
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
          );
        })}
      </div>

      {/* Recovery Period Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Recovery Period Legend</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 bg-yellow-400 rounded"></div>
            <span className="text-gray-700">Light Recovery (Sprint: ~3 days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 bg-orange-500 rounded"></div>
            <span className="text-gray-700">Moderate Recovery (Olympic: ~5-7 days)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-1 bg-red-500 rounded"></div>
            <span className="text-gray-700">Heavy Recovery (Middle/Long: 10-35 days)</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Recovery periods are shown as colored underlines on calendar days. 
          Red background indicates scheduling conflicts.
        </p>
      </div>

      {/* Event Modal */}
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

export default Calendar;
