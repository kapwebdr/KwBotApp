import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';

interface PendingFileProps {
  fileName: string;
  onClear: () => void;
}

export const PendingFile: React.FC<PendingFileProps> = ({
  fileName,
  onClear,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClear();
  };

  return (
    <View style={[
      styles.pendingFileContainer,
      { backgroundColor: `${theme.colors.primary}20` }
    ]}>
      <Text 
        style={[
          styles.pendingFileName,
          { color: theme.colors.text }
        ]} 
        numberOfLines={1} 
        ellipsizeMode="middle"
      >
        {fileName}
      </Text>
      <TouchableOpacity 
        style={styles.clearFileButton}
        onPress={handleClear}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="close-circle" 
          size={16} 
          color={theme.colors.text} 
        />
      </TouchableOpacity>
    </View>
  );
};

export default PendingFile; 