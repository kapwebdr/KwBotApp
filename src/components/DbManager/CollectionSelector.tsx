import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

interface CollectionSelectorProps {
  currentCollection: string;
  onCollectionChange: (collection: string) => void;
}

const DEFAULT_COLLECTIONS = ['default', 'config', 'cache', 'temp'];

export const CollectionSelector: React.FC<CollectionSelectorProps> = ({
  currentCollection,
  onCollectionChange,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  return (
    <View style={styles.collectionSelector}>
      {DEFAULT_COLLECTIONS.map((collection) => (
        <TouchableOpacity
          key={collection}
          style={[
            styles.collectionItem,
            currentCollection === collection && styles.collectionItemActive,
          ]}
          onPress={() => onCollectionChange(collection)}
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
    </View>
  );
}; 