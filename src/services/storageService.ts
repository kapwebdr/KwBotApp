import { notificationService } from './notificationService';
import { StorageSetParams, StorageResponse, SearchResult, SearchResponse, DatabasesResponse, CollectionsResponse, Backend } from '../types/storage';
class StorageService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${process.env.BASE_API_URL}/storage`;
  }

  async set(params: StorageSetParams): Promise<StorageResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/set`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json() as StorageResponse;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la sauvegarde: ${errorMessage}`);
      return { status: 'error', key: '' };
    }
  }

  async get(collection: string, key: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get/${collection}/${key}`);
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error('Erreur lors de la récupération');
      }
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la récupération: ${errorMessage}`);
      return null;
    }
  }

  async delete(collection: string, key: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/delete/${collection}/${key}`, {
        method: 'DELETE',
      });

      const result = await response.json() as StorageResponse;
      return result.status === 'success';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la suppression: ${errorMessage}`);
      return false;
    }
  }

  async list(collection: string, pattern: string = '*'): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/list/${collection}?pattern=${pattern}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération de la liste');
      }
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la liste: ${errorMessage}`);
      return [];
    }
  }

  async search(params: StorageSearchParams): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      });

      const result = await response.json() as SearchResponse;
      return result.results;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la recherche: ${errorMessage}`);
      return [];
    }
  }

  async listDatabases(backend: Backend): Promise<DatabasesResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/databases?backend=${backend}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des bases de données');
      }
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la liste des bases de données: ${errorMessage}`);
      return { databases: [] };
    }
  }

  async listCollections(backend: Backend): Promise<CollectionsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/collections?backend=${backend}`);
      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des collections');
      }
      return await response.json();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      notificationService.notify('error', `Erreur lors de la liste des collections: ${errorMessage}`);
      return { collections: [] };
    }
  }
}

export const storageService = new StorageService();