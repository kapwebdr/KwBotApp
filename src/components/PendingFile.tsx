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
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.pendingFileContainer}>
      <Text style={styles.pendingFileName} numberOfLines={1} ellipsizeMode="middle">
        {fileName}
      </Text>
      <TouchableOpacity 
        style={styles.clearFileButton}
        onPress={onClear}
      >
        <Ionicons name="close-circle" size={16} color={theme.colors.text} />
      </TouchableOpacity>
    </View>
  );
};

export default PendingFile; 