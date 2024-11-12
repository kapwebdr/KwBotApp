import React, { createContext, useContext, useState, useCallback } from 'react';
import { storageService } from '../services/storageService';
import { DbManagerContextType, StorageItem, SearchResult } from '../types/storage';
import { notificationService } from '../services/notificationService';

const DbManagerContext = createContext<DbManagerContextType | null>(null);

export const useDbManager = () => {
  const context = useContext(DbManagerContext);
  if (!context) {
    throw new Error('useDbManager must be used within DbManagerProvider');
  }
  return context;
};

export const DbManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentCollection, setCurrentCollection] = useState('default');
  const [items, setItems] = useState<StorageItem[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadItems = useCallback(async (pattern?: string) => {
    try {
      setIsLoading(true);
      const keys = await storageService.list(currentCollection, pattern);
      const loadedItems = await Promise.all(
        keys.map(async (key) => {
          const value = await storageService.get(currentCollection, key);
          return { key, value, collection: currentCollection };
        })
      );
      setItems(loadedItems);
    } catch (error) {
      console.error('Erreur lors du chargement des items:', error);
      notificationService.notify('error', 'Erreur lors du chargement des données');
    } finally {
      setIsLoading(false);
    }
  }, [currentCollection]);

  const saveItem = useCallback(async (key: string, value: any) => {
    try {
      const success = await storageService.set({
        key,
        value,
        collection: currentCollection
      });
      if (success) {
        await loadItems();
        notificationService.notify('success', 'Données sauvegardées avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      notificationService.notify('error', 'Erreur lors de la sauvegarde');
      return false;
    }
  }, [currentCollection, loadItems]);

  const deleteItem = useCallback(async (key: string) => {
    try {
      const success = await storageService.delete(currentCollection, key);
      if (success) {
        await loadItems();
        notificationService.notify('success', 'Données supprimées avec succès');
      }
      return success;
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      notificationService.notify('error', 'Erreur lors de la suppression');
      return false;
    }
  }, [currentCollection, loadItems]);

  const searchItems = useCallback(async (query: string, n_results?: number) => {
    try {
      setIsLoading(true);
      const results = await storageService.search({
        query,
        collection: currentCollection,
        n_results
      });
      setSearchResults(results);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      notificationService.notify('error', 'Erreur lors de la recherche');
    } finally {
      setIsLoading(false);
    }
  }, [currentCollection]);

  const value = {
    currentCollection,
    items,
    searchResults,
    isLoading,
    setCurrentCollection,
    loadItems,
    saveItem,
    deleteItem,
    searchItems,
  };

  return (
    <DbManagerContext.Provider value={value}>
      {children}
    </DbManagerContext.Provider>
  );
}; 