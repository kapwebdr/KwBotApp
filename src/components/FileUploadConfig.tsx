import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { PendingFile } from './PendingFile';

interface FileUploadConfigProps {
  handleFileUpload: () => void;
  handleUrlInput: () => void;
  pendingFile: { name: string } | null;
  setPendingFile: (file: null) => void;
}

export const FileUploadConfig: React.FC<FileUploadConfigProps> = ({
  handleFileUpload,
  handleUrlInput,
  pendingFile,
  setPendingFile,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  return (
    <View style={styles.fileUploadConfig}>
      <View style={[styles.uploadButtons, pendingFile ? { marginBottom: 10 } : null]}>
        <TouchableOpacity style={styles.uploadButton} onPress={handleFileUpload}>
          <Ionicons name="document-attach" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.uploadButton} onPress={handleUrlInput}>
          <Ionicons name="link" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
      {pendingFile && (
        <PendingFile
          fileName={pendingFile.name}
          onClear={() => setPendingFile(null)}
        />
      )}
    </View>
  );
};

export default FileUploadConfig; 