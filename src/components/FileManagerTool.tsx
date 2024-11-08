import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useTool } from '../hooks/useTool';
import { useFileManager } from '../contexts/FileManagerContext';
import FileUploadConfig from './FileUploadConfig';
import { LoadingBubble } from './LoadingBubble';

export const FileManagerTool: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { tool } = useTool();
  const { 
    pendingFiles,
    isUploading,
    handleFileSelect,
    handleUpload,
    clearPendingFiles,
    handleClearFile,
    compressionProgress,
  } = useFileManager();

  const handleUploadPendingFiles = async () => {
    const files = pendingFiles.map(pf => pf.file);
    await handleUpload(files);
  };

  return (
    <View style={styles.fileManagerToolContainer}>
      <View style={styles.uploadControls}>
        <FileUploadConfig
          tool={{
            ...tool,
            features: {
              ...tool?.features,
              fileUpload: {
                accept: ['*/*'],
                multiple: true,
                dragDrop: true
              }
            }
          }}
          onFileSelect={handleFileSelect}
          pendingFiles={pendingFiles}
          onClearFiles={clearPendingFiles}
          onClearFile={handleClearFile}
        />
        
        {pendingFiles.length > 0 && (
          <TouchableOpacity
            style={[
              styles.uploadActionButton,
              isUploading && styles.uploadActionButtonDisabled
            ]}
            onPress={handleUploadPendingFiles}
            disabled={isUploading}
          >
            <Ionicons 
              name="cloud-upload-outline" 
              size={24} 
              color={theme.colors.text} 
            />
            <Text style={styles.uploadActionButtonText}>
              {isUploading ? 'Upload en cours...' : `Uploader (${pendingFiles.length})`}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {compressionProgress && (
        <LoadingBubble
          progress={compressionProgress.progress}
          message={`Compression en cours: ${compressionProgress.file}`}
        />
      )}
    </View>
  );
};
