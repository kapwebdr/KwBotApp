import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';

interface FileUploadConfigProps {
  onFileUpload: () => void;
  onUrlInput: () => void;
}

export const FileUploadConfig: React.FC<FileUploadConfigProps> = ({
  onFileUpload,
  onUrlInput,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  return (
    <View style={styles.fileUploadContainer}>
      <TouchableOpacity 
        style={styles.uploadButton}
        onPress={onFileUpload}
      >
        <Ionicons 
          name="cloud-upload" 
          size={24} 
          color={theme.colors.primary} 
        />
        <Text style={styles.uploadButtonText}>Upload</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.urlButton}
        onPress={onUrlInput}
      >
        <Ionicons 
          name="link" 
          size={24} 
          color={theme.colors.primary} 
        />
        <Text style={styles.urlButtonText}>URL</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FileUploadConfig; 