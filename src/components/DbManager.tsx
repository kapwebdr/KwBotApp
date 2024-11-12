import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useDbManager } from '../contexts/DbManagerContext';
import { BottomBar } from './BottomBar';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { LoadingBubble } from './LoadingBubble';
import { ItemList } from './ItemList';
import { SearchBar } from './SearchBar';
import { AddItemModal } from './AddItemModal';
import { storageService } from '../services/storageService';
import { useTool } from '../hooks/useTool';
type Backend = 'redis' | 'mongo' | 'chroma';

export const DbManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const bottomPadding = useBottomPadding();
  const {
    currentCollection,
    items,
    isLoading,
    loadItems,
    setCurrentCollection,
  } = useDbManager();

  const [showAddModal, setShowAddModal] = useState(false);
  const [searchPattern, setSearchPattern] = useState('');
  const [selectedBackend, setSelectedBackend] = useState<Backend>('redis');
  const [databases, setDatabases] = useState<string[]>([]);
  const [collections, setCollections] = useState<string[]>([]);
  const [selectedDatabase, setSelectedDatabase] = useState<string>('');
  const [isLoadingMetadata, setIsLoadingMetadata] = useState(true);
  const { setToolHeight } = useTool();
  const loadDatabases = useCallback(async (backend: Backend) => {
    try {
      setIsLoadingMetadata(true);
      const response = await storageService.listDatabases(backend);
      setDatabases(response.databases);
      if (response.databases.length > 0) {
        setSelectedDatabase(response.databases[0]);
      } else {
        setSelectedDatabase('');
        setCollections([]);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des bases de données:', error);
      setDatabases([]);
      setSelectedDatabase('');
      setCollections([]);
    } finally {
      setIsLoadingMetadata(false);
    }
  }, []);

  const loadCollections = useCallback(async (backend: Backend, database: string) => {
    if (!database) return;
    
    try {
      setIsLoadingMetadata(true);
      const response = await storageService.listCollections(backend);
      setCollections(response.collections);
      if (response.collections.length > 0) {
        setCurrentCollection(response.collections[0]);
      } else {
        setCurrentCollection('');
      }
    } catch (error) {
      console.error('Erreur lors du chargement des collections:', error);
      setCollections([]);
      setCurrentCollection('');
    } finally {
      setIsLoadingMetadata(false);
    }
  }, [setCurrentCollection]);

  useEffect(() => {
    loadDatabases(selectedBackend);
    setToolHeight(0);
  }, [selectedBackend, loadDatabases]);

  useEffect(() => {
    if (selectedDatabase) {
      loadCollections(selectedBackend, selectedDatabase);
    }
  }, [selectedBackend, selectedDatabase, loadCollections]);

  useEffect(() => {
    if (currentCollection) {
      loadItems();
    }
  }, [currentCollection, loadItems]);

  const handleBackendChange = (backend: Backend) => {
    setSelectedBackend(backend);
    setSelectedDatabase('');
    setCollections([]);
    setCurrentCollection('');
  };

  const handleDatabaseChange = (database: string) => {
    setSelectedDatabase(database);
    setCollections([]);
    setCurrentCollection('');
  };

  const handleSearch = (pattern: string) => {
    setSearchPattern(pattern);
    loadItems(pattern);
  };

  if (isLoading || isLoadingMetadata) {
    return (
      <View style={styles.dbManagerContainer}>
        <LoadingBubble message="Chargement des données..." />
        <BottomBar />
      </View>
    );
  }

  return (
    <View style={styles.dbManagerContainer}>
      <View style={styles.dbManagerHeader}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.backendSelector}>
          {(['redis', 'mongo', 'chroma'] as Backend[]).map((backend) => (
            <TouchableOpacity
              key={backend}
              style={[
                styles.backendItem,
                selectedBackend === backend && styles.backendItemActive,
              ]}
              onPress={() => handleBackendChange(backend)}
            >
              <Text
                style={[
                  styles.backendText,
                  selectedBackend === backend && styles.backendTextActive,
                  { color: theme.colors.text },
                ]}
              >
                {backend.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.metadataContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.databaseSelector}>
          {databases.map((database) => (
            <TouchableOpacity
              key={database}
              style={[
                styles.databaseItem,
                selectedDatabase === database && styles.databaseItemActive,
              ]}
              onPress={() => handleDatabaseChange(database)}
            >
              <Text
                style={[
                  styles.databaseText,
                  selectedDatabase === database && styles.databaseTextActive,
                  { color: theme.colors.text },
                ]}
              >
                {database}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.collectionSelector}>
          {collections.map((collection) => (
            <TouchableOpacity
              key={collection}
              style={[
                styles.collectionItem,
                currentCollection === collection && styles.collectionItemActive,
              ]}
              onPress={() => setCurrentCollection(collection)}
            >
              <Text
                style={[
                  styles.collectionText,
                  currentCollection === collection && styles.collectionTextActive,
                  { color: theme.colors.text },
                ]}
              >
                {collection}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <SearchBar
        value={searchPattern}
        onSearch={handleSearch}
        placeholder="Rechercher des clés..."
      />

      <View style={[styles.dbManagerContent, { marginBottom: bottomPadding }]}>
        <ItemList
          items={items}
          currentCollection={currentCollection}
        />
      </View>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setShowAddModal(true)}
      >
        <Ionicons name="add" size={24} color={theme.colors.background} />
      </TouchableOpacity>

      <AddItemModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        currentCollection={currentCollection}
        selectedBackend={selectedBackend}
        selectedDatabase={selectedDatabase}
      />

      <BottomBar />
    </View>
  );
};

export default DbManager; 