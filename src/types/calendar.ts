import { TaskCategory } from './tasks';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  category?: TaskCategory;
  location?: string;
  taskId?: string;
  createdAt: string;
  updatedAt: string;
} 