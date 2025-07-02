export interface TriathlonEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD format
  time?: string; // HH:MM format
  type: 'training' | 'race' | 'recovery' | 'other';
  description?: string;
  location?: string;
  created_at: string;
  updated_at: string;
}

export interface NewEvent {
  title: string;
  date: string;
  time?: string;
  type: 'training' | 'race' | 'recovery' | 'other';
  description?: string;
  location?: string;
}

export interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  events: TriathlonEvent[];
}
