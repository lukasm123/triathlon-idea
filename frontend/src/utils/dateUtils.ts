/**
 * Date and Calendar Utilities for Triathlon Race Scheduler
 * 
 * Handles date formatting, calendar generation, recovery period calculations,
 * and conflict detection for triathlon race scheduling.
 */

import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  addDays, 
  subDays,
  isSameDay,
  isWithinInterval,
  differenceInDays,
  parseISO
} from 'date-fns';

import { 
  RaceDistance, 
  RACE_DISTANCES, 
  TriathlonRace, 
  RecoveryPeriodInfo, 
  CalendarDay,
  SchedulingConflict,
  NewRace
} from '../types';

// Basic date formatting utilities
export const formatDate = (date: Date): string => {
  return format(date, 'yyyy-MM-dd');
};

export const formatDisplayDate = (date: Date): string => {
  return format(date, 'MMM d, yyyy');
};

export const formatTime = (time: string): string => {
  if (!time) return '';
  const [hours, minutes] = time.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
};

/**
 * Calculate recovery period for a race
 * @param race - The triathlon race
 * @returns Recovery period information
 */
export const calculateRecoveryPeriod = (race: TriathlonRace): RecoveryPeriodInfo => {
  const raceDate = parseISO(race.date);
  const config = RACE_DISTANCES[race.distance];
  const recoveryDays = config.recovery.recommended;
  
  // Recovery starts the day after the race
  const startDate = addDays(raceDate, 1);
  const endDate = addDays(raceDate, recoveryDays);
  
  // Determine recovery intensity based on distance
  let intensity: 'light' | 'moderate' | 'heavy';
  if (race.distance === 'sprint') intensity = 'light';
  else if (race.distance === 'olympic') intensity = 'moderate';
  else intensity = 'heavy';
  
  return {
    race,
    startDate,
    endDate,
    days: recoveryDays,
    intensity
  };
};

/**
 * Check if a date falls within any recovery periods
 * @param date - Date to check
 * @param recoveryPeriods - Array of recovery periods
 * @returns Array of recovery periods that include this date
 */
export const getRecoveryPeriodsForDate = (
  date: Date, 
  recoveryPeriods: RecoveryPeriodInfo[]
): RecoveryPeriodInfo[] => {
  return recoveryPeriods.filter(period => 
    isWithinInterval(date, { start: period.startDate, end: period.endDate })
  );
};

/**
 * Detect scheduling conflicts for a proposed race
 * @param proposedRace - The race being planned
 * @param existingRaces - Currently scheduled races
 * @returns Conflict information
 */
export const detectSchedulingConflicts = (
  proposedRace: NewRace | TriathlonRace,
  existingRaces: TriathlonRace[]
): SchedulingConflict | null => {
  const proposedDate = parseISO(proposedRace.date);
  
  // Calculate recovery periods for all existing races
  const recoveryPeriods = existingRaces.map(calculateRecoveryPeriod);
  
  // Check if proposed race falls within any recovery period
  const conflictingRecovery = getRecoveryPeriodsForDate(proposedDate, recoveryPeriods);
  
  if (conflictingRecovery.length === 0) {
    return null; // No conflicts
  }
  
  // Determine conflict severity
  const hasHeavyRecovery = conflictingRecovery.some(r => r.intensity === 'heavy');
  const severity = hasHeavyRecovery ? 'error' : 'warning';
  
  // Generate conflict message
  const conflictingRaceNames = conflictingRecovery.map(r => r.race.title).join(', ');
  const message = `This date conflicts with recovery period${conflictingRecovery.length > 1 ? 's' : ''} from: ${conflictingRaceNames}`;
  
  return {
    proposedRace,
    conflictingRecovery,
    severity,
    message
  };
};

/**
 * Generate calendar days with race and recovery information
 * @param date - Base date for calendar generation
 * @param races - Array of scheduled races
 * @returns Array of calendar days with race and recovery data
 */
export const getCalendarDays = (date: Date, races: TriathlonRace[] = []): CalendarDay[] => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  // Get 6 weeks to fill the calendar grid
  const calendarStart = subDays(start, start.getDay() === 1 ? 0 : 7);
  const calendarEnd = addDays(end, 42 - ((end.getTime() - calendarStart.getTime()) / (1000 * 60 * 60 * 24)));
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  // Calculate all recovery periods
  const allRecoveryPeriods = races.map(calculateRecoveryPeriod);
  
  return days.map(day => {
    // Find races on this day
    const dayRaces = races.filter(race => isSameDay(parseISO(race.date), day));
    
    // Find recovery periods affecting this day
    const dayRecoveryPeriods = getRecoveryPeriodsForDate(day, allRecoveryPeriods);
    
    // Check for conflicts (race scheduled during recovery)
    const hasConflict = dayRaces.length > 0 && dayRecoveryPeriods.length > 0;
    
    return {
      date: day,
      isCurrentMonth: isSameMonth(day, date),
      races: dayRaces,
      recoveryPeriods: dayRecoveryPeriods,
      hasConflict
    };
  });
};

/**
 * Get race distance configuration
 * @param distance - Race distance
 * @returns Distance configuration
 */
export const getRaceDistanceConfig = (distance: RaceDistance) => {
  return RACE_DISTANCES[distance];
};

/**
 * Get color class for race distance
 * @param distance - Race distance
 * @returns CSS color class
 */
export const getRaceDistanceColor = (distance: RaceDistance): string => {
  return `${RACE_DISTANCES[distance].color} text-white`;
};

/**
 * Get icon for race distance
 * @param distance - Race distance
 * @returns Emoji icon
 */
export const getRaceDistanceIcon = (distance: RaceDistance): string => {
  return RACE_DISTANCES[distance].icon;
};

/**
 * Get recovery period color based on intensity
 * @param intensity - Recovery intensity
 * @returns CSS color class
 */
export const getRecoveryColor = (intensity: 'light' | 'moderate' | 'heavy'): string => {
  switch (intensity) {
    case 'light':
      return 'bg-yellow-100 border-yellow-300 text-yellow-800';
    case 'moderate':
      return 'bg-orange-100 border-orange-300 text-orange-800';
    case 'heavy':
      return 'bg-red-100 border-red-300 text-red-800';
    default:
      return 'bg-gray-100 border-gray-300 text-gray-800';
  }
};

/**
 * Format recovery period display text
 * @param recoveryPeriod - Recovery period info
 * @returns Formatted display text
 */
export const formatRecoveryPeriod = (recoveryPeriod: RecoveryPeriodInfo): string => {
  const raceConfig = RACE_DISTANCES[recoveryPeriod.race.distance];
  return `Recovery: ${recoveryPeriod.race.title} (${raceConfig.label})`;
};

// Legacy functions for backward compatibility
export const getEventTypeColor = (type: string): string => {
  return getRaceDistanceColor(type as RaceDistance);
};

export const getEventTypeIcon = (type: string): string => {
  return getRaceDistanceIcon(type as RaceDistance);
};
