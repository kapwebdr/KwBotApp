import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useTool } from '../hooks/useTool';
import FileUploadConfig from './FileUploadConfig';
import { PendingFile } from './PendingFile';

export const FileManagerTool: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { tool, executeToolAction } = useTool();
  const [pendingFiles, setPendingFiles] = useState<{ name: string; file: File }[]>([]);

  const handleFileSelect = (file: File) => {
    setPendingFiles(prev => [...prev, { name: file.name, file }]);
  };

  const handleClearFiles = () => {
    setPendingFiles([]);
  };

  const handleClearFile = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadPendingFiles = async () => {
    if (pendingFiles.length === 0) return;
    
    try {
      await executeToolAction('upload', {
        files: pendingFiles.map(pf => pf.file),
        currentPath: tool?.config?.currentPath || '/'
      });
      setPendingFiles([]);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  if (!tool) return null;

  return (
    <View style={styles.fileManagerToolContainer}>
      <View style={styles.pendingFilesContainer}>
        {pendingFiles.map((file, index) => (
          <PendingFile
            key={index}
            fileName={file.name}
            onClear={() => handleClearFile(index)}
          />
        ))}
      </View>
      
      <View style={styles.uploadControls}>
        <FileUploadConfig
          tool={{
            ...tool,
            features: {
              ...tool.features,
              fileUpload: {
                accept: ['*/*'],
                multiple: true,
                dragDrop: true
              }
            }
          }}
          onFileSelect={handleFileSelect}
          pendingFiles={pendingFiles}
          onClearFiles={handleClearFiles}
        />
        
        {pendingFiles.length > 0 && (
          <TouchableOpacity
            style={styles.uploadButton}
            onPress={handleUploadPendingFiles}
          >
            <Ionicons name="cloud-upload" size={24} color={theme.colors.primary} />
            <Text style={styles.uploadButtonText}>
              Uploader ({pendingFiles.length} fichiers)
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}; 