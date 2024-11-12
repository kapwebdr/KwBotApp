export interface Task {
  id: string;
  title: string;
  description?: string;
  category?: string;
  status: 'todo' | 'done';
  priority: 'low' | 'medium' | 'high';
  eventId?: string;
  scheduledDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskCategory {
  id: string;
  name: string;
  color: string;
}