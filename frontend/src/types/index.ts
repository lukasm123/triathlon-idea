/**
 * Type Definitions for Triathlon Scheduler
 * 
 * This file contains all TypeScript interfaces and types used throughout
 * the Triathlon Scheduler application for type safety and better development experience.
 */

/**
 * Represents a complete triathlon event as stored in the database
 * 
 * @interface TriathlonEvent
 * @example
 * {
 *   id: "uuid-123",
 *   title: "Morning Swim Training",
 *   date: "2025-07-03",
 *   time: "07:00",
 *   type: "training",
 *   description: "1500m freestyle practice",
 *   location: "Local Pool",
 *   created_at: "2025-07-02T17:00:00.000Z",
 *   updated_at: "2025-07-02T17:00:00.000Z"
 * }
 */
export interface TriathlonEvent {
  /** Unique identifier (UUID) */
  id: string;
  /** Event title/name */
  title: string;
  /** Event date in YYYY-MM-DD format */
  date: string;
  /** Optional event time in HH:MM format (24-hour) */
  time?: string;
  /** Event category */
  type: 'training' | 'race' | 'recovery' | 'other';
  /** Optional detailed description */
  description?: string;
  /** Optional event location */
  location?: string;
  /** Database record creation timestamp */
  created_at: string;
  /** Database record last update timestamp */
  updated_at: string;
}

/**
 * Represents event data for creating or updating events
 * (excludes database-generated fields like id, created_at, updated_at)
 * 
 * @interface NewEvent
 * @example
 * {
 *   title: "Evening Run",
 *   date: "2025-07-04",
 *   time: "18:30",
 *   type: "training",
 *   description: "5km easy pace",
 *   location: "Park Trail"
 * }
 */
export interface NewEvent {
  /** Event title/name */
  title: string;
  /** Event date in YYYY-MM-DD format */
  date: string;
  /** Optional event time in HH:MM format (24-hour) */
  time?: string;
  /** Event category */
  type: 'training' | 'race' | 'recovery' | 'other';
  /** Optional detailed description */
  description?: string;
  /** Optional event location */
  location?: string;
}

/**
 * Represents a single day in the calendar grid
 * Used for rendering the monthly calendar view
 * 
 * @interface CalendarDay
 * @example
 * {
 *   date: new Date('2025-07-03'),
 *   isCurrentMonth: true,
 *   events: [event1, event2]
 * }
 */
export interface CalendarDay {
  /** The date object for this calendar day */
  date: Date;
  /** Whether this day belongs to the currently displayed month */
  isCurrentMonth: boolean;
  /** Array of events scheduled for this day */
  events: TriathlonEvent[];
}

/**
 * Event type definitions for better type safety
 */
export type EventType = 'training' | 'race' | 'recovery' | 'other';

/**
 * API response types
 */
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Event type display configuration
 */
export interface EventTypeConfig {
  label: string;
  icon: string;
  color: string;
  description: string;
}
