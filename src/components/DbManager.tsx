import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useDbManager } from '../contexts/DbManagerContext';
import { BottomBar } from './BottomBar';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { LoadingBubble } from './LoadingBubble';
import { CollectionSelector } from './CollectionSelector';
import { ItemList } from './ItemList';
import { SearchBar } from './SearchBar';
import { AddItemModal } from './AddItemModal';

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

  useEffect(() => {
    loadItems();
  }, [currentCollection, loadItems]);

  const handleSearch = (pattern: string) => {
    setSearchPattern(pattern);
    loadItems(pattern);
  };

  if (isLoading) {
    return (
      <View style={styles.dbManagerContainer}>
        <LoadingBubble message="Chargement des données..." />
      </View>
    );
  }

  return (
    <View style={styles.dbManagerContainer}>
      <View style={styles.dbManagerHeader}>
        <CollectionSelector
          currentCollection={currentCollection}
          onCollectionChange={setCurrentCollection}
        />
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddModal(true)}
        >
          <Ionicons name="add" size={24} color={theme.colors.text} />
        </TouchableOpacity>
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

      <AddItemModal
        isVisible={showAddModal}
        onClose={() => setShowAddModal(false)}
        currentCollection={currentCollection}
      />

      <BottomBar />
    </View>
  );
};

export default DbManager; 