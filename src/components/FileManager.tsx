import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useTool } from '../contexts/ToolContext';

export const FileManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { toolConfig, updateToolConfig, handleToolAction } = useTool();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);

  const currentPath = toolConfig.currentPath || '/';

  const loadDirectory = async () => {
    setLoading(true);
    try {
      const response = await handleToolAction('execute', {
        handler: 'handleListDirectory',
        currentPath
      });
      setFiles(response);
    } catch (error) {
      console.error('Erreur lors du chargement du répertoire:', error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadDirectory();
  }, [currentPath]);

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      updateToolConfig({
        currentPath: file.path
      });
    } else {
      const isSelected = selectedFiles.includes(file.path);
      setSelectedFiles(isSelected 
        ? selectedFiles.filter(path => path !== file.path)
        : [...selectedFiles, file.path]
      );
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      await handleToolAction('upload', {
        handler: 'handleFileUpload',
        files,
        currentPath
      });
      loadDirectory();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const renderFileItem = (file: FileItem) => {
    const isSelected = selectedFiles.includes(file.path);
    const icon = file.type === 'directory' ? 'folder' : 'document';

    return (
      <TouchableOpacity
        key={file.path}
        style={[styles.fileItem, isSelected && styles.fileItemSelected]}
        onPress={() => handleFileClick(file)}
      >
        <Ionicons name={icon} size={24} color={theme.colors.text} />
        <Text style={styles.fileName}>{file.name}</Text>
        {file.type === 'file' && (
          <Text style={styles.fileSize}>
            {(file.size || 0) / 1024} KB
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <TouchableOpacity
          style={styles.toolbarButton}
          onPress={() => updateToolConfig({ currentPath: '/' })}
        >
          <Ionicons name="home" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.currentPath}>{currentPath}</Text>
      </View>
      
      <ScrollView style={styles.fileList}>
        {loading ? (
          <Text style={styles.loadingText}>Chargement...</Text>
        ) : (
          files.map(renderFileItem)
        )}
      </ScrollView>
    </View>
  );
}; 