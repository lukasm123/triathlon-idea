/**
 * Type Definitions for Triathlon Race Scheduler
 * 
 * This application focuses on triathlon race scheduling with automatic recovery period
 * calculation to help athletes plan their race calendar intelligently.
 */

/**
 * Triathlon race distances with their respective recovery periods
 */
export type RaceDistance = 'sprint' | 'olympic' | 'middle' | 'long';

/**
 * Recovery period configuration for each race distance
 */
export interface RecoveryPeriod {
  /** Minimum recovery days */
  min: number;
  /** Maximum recovery days */
  max: number;
  /** Recommended recovery days (used for calculations) */
  recommended: number;
}

/**
 * Race distance configurations with recovery periods
 */
export const RACE_DISTANCES: Record<RaceDistance, {
  label: string;
  description: string;
  recovery: RecoveryPeriod;
  icon: string;
  color: string;
}> = {
  sprint: {
    label: 'Sprint Distance',
    description: '750m swim, 20km bike, 5km run',
    recovery: { min: 2, max: 4, recommended: 3 },
    icon: '🏃‍♂️',
    color: 'bg-green-500'
  },
  olympic: {
    label: 'Olympic Distance',
    description: '1.5km swim, 40km bike, 10km run',
    recovery: { min: 5, max: 7, recommended: 6 },
    icon: '🥇',
    color: 'bg-blue-500'
  },
  middle: {
    label: 'Middle Distance',
    description: '1.9km swim, 90km bike, 21.1km run (70.3)',
    recovery: { min: 10, max: 14, recommended: 12 },
    icon: '💪',
    color: 'bg-orange-500'
  },
  long: {
    label: 'Long Distance',
    description: '3.8km swim, 180km bike, 42.2km run (Ironman)',
    recovery: { min: 25, max: 35, recommended: 30 },
    icon: '🔥',
    color: 'bg-red-500'
  }
};

/**
 * Represents a complete triathlon race event
 * 
 * @interface TriathlonRace
 * @example
 * {
 *   id: "uuid-123",
 *   title: "City Olympic Triathlon",
 *   date: "2025-07-15",
 *   time: "07:00",
 *   distance: "olympic",
 *   location: "City Park",
 *   description: "Annual city championship race",
 *   created_at: "2025-07-02T17:00:00.000Z",
 *   updated_at: "2025-07-02T17:00:00.000Z"
 * }
 */
export interface TriathlonRace {
  /** Unique identifier (UUID) */
  id: string;
  /** Race title/name */
  title: string;
  /** Race date in YYYY-MM-DD format */
  date: string;
  /** Race start time in HH:MM format (24-hour) */
  time?: string;
  /** Race distance category */
  distance: RaceDistance;
  /** Race location */
  location?: string;
  /** Optional race description/notes */
  description?: string;
  /** Database record creation timestamp */
  created_at: string;
  /** Database record last update timestamp */
  updated_at: string;
}

/**
 * Represents race data for creating or updating races
 * (excludes database-generated fields like id, created_at, updated_at)
 */
export interface NewRace {
  /** Race title/name */
  title: string;
  /** Race date in YYYY-MM-DD format */
  date: string;
  /** Race start time in HH:MM format (24-hour) */
  time?: string;
  /** Race distance category */
  distance: RaceDistance;
  /** Race location */
  location?: string;
  /** Optional race description/notes */
  description?: string;
}

/**
 * Represents a recovery period for a specific race
 */
export interface RecoveryPeriodInfo {
  /** The race that requires recovery */
  race: TriathlonRace;
  /** Start date of recovery period (race date) */
  startDate: Date;
  /** End date of recovery period */
  endDate: Date;
  /** Number of recovery days */
  days: number;
  /** Recovery intensity level */
  intensity: 'light' | 'moderate' | 'heavy';
}

/**
 * Represents a single day in the calendar grid with race and recovery information
 */
export interface CalendarDay {
  /** The date object for this calendar day */
  date: Date;
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
  /** Array of races scheduled for this day */
  races: TriathlonRace[];
  /** Array of recovery periods affecting this day */
  recoveryPeriods: RecoveryPeriodInfo[];
  /** Whether this day has any scheduling conflicts */
  hasConflict: boolean;
}

/**
 * Conflict detection result
 */
export interface SchedulingConflict {
  /** The proposed race */
  proposedRace: NewRace | TriathlonRace;
  /** Conflicting recovery periods */
  conflictingRecovery: RecoveryPeriodInfo[];
  /** Severity of the conflict */
  severity: 'warning' | 'error';
  /** Human-readable conflict message */
  message: string;
}

/**
 * API response types
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// Legacy types for backward compatibility (will be removed)
export interface TriathlonEvent extends TriathlonRace {
  type: RaceDistance;
}

export interface NewEvent extends NewRace {
  type: RaceDistance;
}

export type EventType = RaceDistance;
