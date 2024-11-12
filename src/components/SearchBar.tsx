import React from 'react';
import { View, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';

interface SearchBarProps {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onSearch,
  placeholder = 'Rechercher...',
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  return (
    <View style={styles.searchContainer}>
      <Ionicons name="search" size={20} color={theme.colors.text} />
      <TextInput
        style={[styles.searchInput, { color: theme.colors.text }]}
        value={value}
        onChangeText={onSearch}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.gray400}
      />
    </View>
  );
}; 