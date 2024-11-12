import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { StorageItem } from '../types/storage';
import { useDbManager } from '../contexts/DbManagerContext';

interface ItemListProps {
  items: StorageItem[];
  currentCollection: string;
}

export const ItemList: React.FC<ItemListProps> = ({
  items,
  currentCollection,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { deleteItem } = useDbManager();

  const renderValue = (value: any) => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <ScrollView style={styles.itemList}>
      {items.map((item) => (
        <View key={item.key} style={styles.itemContainer}>
          <View style={styles.itemHeader}>
            <Text style={[styles.itemKey, { color: theme.colors.text }]}>
              {item.key}
            </Text>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => deleteItem(item.key)}
            >
              <Ionicons name="trash" size={20} color={theme.colors.error} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.itemValue, { color: theme.colors.text }]}>
            {renderValue(item.value)}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}; 