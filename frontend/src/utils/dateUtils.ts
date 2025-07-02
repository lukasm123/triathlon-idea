import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, addDays, subDays } from 'date-fns';

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

export const getWeekDays = (date: Date) => {
  // Start week on Monday (weekStartsOn: 1)
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  return eachDayOfInterval({ start, end });
};

export const getCalendarDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  
  // Get 6 weeks to fill the calendar grid
  const calendarStart = subDays(start, start.getDay() === 1 ? 0 : 7);
  const calendarEnd = addDays(end, 42 - ((end.getTime() - calendarStart.getTime()) / (1000 * 60 * 60 * 24)));
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  return days.map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    events: []
  }));
};

export const getEventTypeColor = (type: string): string => {
  switch (type) {
    case 'race':
      return 'bg-red-500 text-white';
    case 'training':
      return 'bg-blue-500 text-white';
    case 'recovery':
      return 'bg-green-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export const getEventTypeIcon = (type: string): string => {
  switch (type) {
    case 'race':
      return '🏆';
    case 'training':
      return '🏊‍♂️';
    case 'recovery':
      return '🧘‍♂️';
    default:
      return '📅';
  }
};
