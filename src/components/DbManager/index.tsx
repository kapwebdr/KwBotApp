import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { useDbManager } from '../../contexts/DbManagerContext';
import { useBottomPadding } from '../../hooks/useBottomPadding';
import { LoadingBubble } from '../main/LoadingBubble';
import { ListItem } from '../main/ListItem';
import { AddItemModal } from './AddItemModal';
import { storageService } from '../../services/storageService';
import { useTool } from '../../hooks/useTool';
import { FormInput } from '../form/FormInput';
import { ConfirmationModal } from '../main/ConfirmationModal';

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
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToEdit, setItemToEdit] = useState<StorageItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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

  const handleDeleteItem = async (key: string) => {
    setItemToDelete(key);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      setItemToDelete(null);
      setShowDeleteModal(false);
    }
  };

  const handleEditItem = (item: StorageItem) => {
    setItemToEdit(item);
    setShowEditModal(true);
  };

  const handleEditConfirm = async (key: string, value: any) => {
    await saveItem(key, value);
    setItemToEdit(null);
    setShowEditModal(false);
  };

  const renderItem = (item: StorageItem) => {
    const rightActions = [
      {
        icon: 'trash',
        color: theme.colors.error,
        onPress: () => handleDeleteItem(item.key),
        type: 'delete' as const
      },
      {
        icon: 'create',
        color: theme.colors.primary,
        onPress: () => handleEditItem(item),
        type: 'edit' as const
      }
    ];

    const renderMeta = () => (
      <Text style={styles.itemMeta}>
        {typeof item.value === 'object' 
          ? 'Object'
          : typeof item.value === 'string' && item.value.length > 50
            ? `${item.value.substring(0, 50)}...`
            : String(item.value)
        }
      </Text>
    );

    const customStyles = {
      container: styles.itemContainer,
      content: styles.itemContent,
      title: styles.itemTitle,
      meta: styles.itemMeta,
    };

    return (
      <ListItem
        key={item.key}
        title={item.key}
        rightActions={rightActions}
        renderMeta={renderMeta}
        customStyles={customStyles}
        icon={typeof item.value === 'object' ? 'code' : 'text'}
        iconColor={theme.colors.text}
      />
    );
  };

  const renderSearchBar = () => (
    <FormInput
      label=""
      value={searchPattern}
      onChangeText={handleSearch}
      placeholder="Rechercher des clés..."
      icon="search"
      iconPosition="left"
      containerStyle={{ marginHorizontal: 16, marginBottom: 8 }}
    />
  );

  if (isLoading || isLoadingMetadata) {
    return (
      <View style={styles.dbManagerContainer}>
        <LoadingBubble message="Chargement des données..." />
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

      {renderSearchBar()}

      <View style={[styles.dbManagerContent, { marginBottom: bottomPadding }]}>
        <ScrollView
          style={styles.itemList}
          showsVerticalScrollIndicator={false}
        >
          {items.map(renderItem)}
        </ScrollView>
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
        onAdd={loadItems}
      />

      <AddItemModal
        isVisible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setItemToEdit(null);
        }}
        currentCollection={currentCollection}
        item={itemToEdit}
        onAdd={loadItems}
      />

      <ConfirmationModal
        isVisible={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteModal(false);
          setItemToDelete(null);
        }}
        title="Supprimer l'élément"
        message="Êtes-vous sûr de vouloir supprimer cet élément ?"
        type="danger"
      />
    </View>
  );
};

export default DbManager; 