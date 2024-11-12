import { TaskCategory } from '../types/tasks';
import { storageService } from './storageService';
import { notificationService } from './notificationService';

class TaskCategoryService {
  private readonly COLLECTION = 'task_categories';

  async listCategories(): Promise<TaskCategory[]> {
    try {
      const keys = await storageService.list(this.COLLECTION);
      const categories = await Promise.all(
        keys.map(async (key) => {
          const category = await storageService.get(this.COLLECTION, key);
          return { ...category, id: key };
        })
      );
      return categories;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      return [];
    }
  }

  async addCategory(name: string, color: string): Promise<boolean> {
    try {
      const id = `category_${Date.now()}`;
      const category: TaskCategory = {
        id,
        name,
        color,
      };

      const success = await storageService.set({
        key: id,
        value: category,
        collection: this.COLLECTION,
      });

      if (success) {
        notificationService.notify('success', 'Catégorie ajoutée avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la catégorie:', error);
      notificationService.notify('error', 'Erreur lors de l\'ajout de la catégorie');
      return false;
    }
  }

  async updateCategory(category: TaskCategory): Promise<boolean> {
    try {
      const success = await storageService.set({
        key: category.id,
        value: category,
        collection: this.COLLECTION,
      });

      if (success) {
        notificationService.notify('success', 'Catégorie mise à jour avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la catégorie:', error);
      notificationService.notify('error', 'Erreur lors de la mise à jour de la catégorie');
      return false;
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      const success = await storageService.delete(this.COLLECTION, categoryId);
      if (success) {
        notificationService.notify('success', 'Catégorie supprimée avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression de la catégorie:', error);
      notificationService.notify('error', 'Erreur lors de la suppression de la catégorie');
      return false;
    }
  }
}

export const taskCategoryService = new TaskCategoryService(); 