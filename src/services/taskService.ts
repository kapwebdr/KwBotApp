import { Task } from '../types/tasks';
import { storageService } from './storageService';
import { notificationService } from './notificationService';
import { StorageResponse } from '../types/storage';
class TaskService {
  private readonly COLLECTION = 'tasks';

  async listTasks(): Promise<Task[]> {
    try {
      const keys = await storageService.list(this.COLLECTION);
      const tasks = await Promise.all(
        keys.map(async (key) => {
          const task = await storageService.get(this.COLLECTION, key);
          return { ...task, id: key };
        })
      );
      return tasks;
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error);
      return [];
    }
  }

  async addTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<StorageResponse> {
    try {
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: `task_${Date.now()}`,
        createdAt: now,
        updatedAt: now,
      };

      const success = await storageService.set({
        key: newTask.id,
        value: newTask,
        collection: this.COLLECTION,
      });

      if (success.status === 'success') {
        notificationService.notify('success', 'Tâche ajoutée avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la tâche:', error);
      notificationService.notify('error', 'Erreur lors de l\'ajout de la tâche');
      return { status: 'error', key: '' };
    }
  }

  async updateTask(task: Task): Promise<boolean> {
    try {
      const updatedTask = {
        ...task,
        updatedAt: new Date().toISOString(),
      };

      const success = await storageService.set({
        key: task.id,
        value: updatedTask,
        collection: this.COLLECTION,
      });

      if (success) {
        notificationService.notify('success', 'Tâche mise à jour avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error);
      notificationService.notify('error', 'Erreur lors de la mise à jour de la tâche');
      return false;
    }
  }

  async deleteTask(taskId: string): Promise<boolean> {
    try {
      const success = await storageService.delete(this.COLLECTION, taskId);
      if (success) {
        notificationService.notify('success', 'Tâche supprimée avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error);
      notificationService.notify('error', 'Erreur lors de la suppression de la tâche');
      return false;
    }
  }
}

export const taskService = new TaskService(); 