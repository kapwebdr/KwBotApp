import AsyncStorage from '@react-native-async-storage/async-storage';
import { ToolConfig, ToolType, Conversation } from '../types';

interface StorageItem<T> {
  data: T;
  timestamp: number;
}

export class StorageService<T> {
  private key: string;
  private defaultValue: T;

  constructor(key: string, defaultValue: T) {
    this.key = key;
    this.defaultValue = defaultValue;
  }

  async save(data: T): Promise<void> {
    try {
      const item: StorageItem<T> = {
        data,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(this.key, JSON.stringify(item));
      console.log(`[Storage] Sauvegarde pour ${this.key}:`, data);
    } catch (error) {
      console.error(`[Storage] Erreur lors de la sauvegarde pour ${this.key}:`, error);
      throw error;
    }
  }

  async load(): Promise<T> {
    try {
      const storedData = await AsyncStorage.getItem(this.key);
      if (!storedData) {
        console.log(`[Storage] Aucune donnée pour ${this.key}, utilisation de la valeur par défaut`);
        return this.defaultValue;
      }

      const item: StorageItem<T> = JSON.parse(storedData);
      if (Array.isArray(this.defaultValue) && !Array.isArray(item.data)) {
        console.warn(`[Storage] Données invalides pour ${this.key}, utilisation de la valeur par défaut`);
        return this.defaultValue;
      }
      
      console.log(`[Storage] Chargement pour ${this.key}:`, item.data);
      return item.data;
    } catch (error) {
      console.error(`[Storage] Erreur lors du chargement pour ${this.key}:`, error);
      return this.defaultValue;
    }
  }

  async update(updateFn: (currentData: T) => T): Promise<void> {
    try {
      const currentData = await this.load();
      const updatedData = updateFn(currentData);
      await this.save(updatedData);
    } catch (error) {
      console.error(`[Storage] Erreur lors de la mise à jour pour ${this.key}:`, error);
      throw error;
    }
  }

  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.key);
      console.log(`[Storage] Suppression pour ${this.key}`);
    } catch (error) {
      console.error(`[Storage] Erreur lors de la suppression pour ${this.key}:`, error);
      throw error;
    }
  }
}

export const storageKeys = {
  TOOL_CONFIGS: 'tool_configs',
  CONVERSATIONS: 'conversations',
  THEME: 'app_theme',
  SESSION: 'session_id'
} as const;

export const toolConfigsStorage = new StorageService<Record<string, ToolConfig>>(
  storageKeys.TOOL_CONFIGS,
  {}
);

export const conversationsStorage = new StorageService<Conversation[]>(
  storageKeys.CONVERSATIONS,
  []
);

export const themeStorage = new StorageService<'light' | 'dark'>(
  storageKeys.THEME,
  'light'
);

export const sessionStorage = new StorageService<string | null>(
  storageKeys.SESSION,
  null
); 