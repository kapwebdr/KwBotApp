import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileItem } from '../types/files';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useTool } from '../hooks/useTool';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { Swipeable } from 'react-native-gesture-handler';
import { BottomBar } from './BottomBar';
import { FileManagerTool } from './FileManagerTool';

export const FileManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { 
    toolStates, 
    currentTool,
    executeToolAction,
    updateToolConfig,
    loading: { isLoading }
  } = useTool();
  const bottomPadding = useBottomPadding();

  const [files, setFiles] = useState<FileItem[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const currentPath = toolStates[currentTool]?.config?.currentPath || '/';

  const loadDirectory = async () => {
    try {
      const response = await executeToolAction('list_directory', {
        currentPath
      });
      
      if (response && response.status === 'success') {
        const itemsWithPath = response.items.map(item => ({
          ...item,
          path: `${response.path}${response.path.endsWith('/') ? '' : '/'}${item.name}`
        }));
        setFiles(itemsWithPath);
      }
    } catch (error) {
      console.error('Erreur lors du chargement du répertoire:', error);
    }
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

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await executeToolAction('create_directory', {
        directoryName: newFolderName,
        currentPath
      });
      setNewFolderName('');
      setShowNewFolderInput(false);
      loadDirectory();
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
    }
  };

  const handleDeleteSelected = async () => {
    for (const filePath of selectedFiles) {
      try {
        await executeToolAction('delete_file', {
          filePath
        });
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
      }
    }
    setSelectedFiles([]);
    loadDirectory();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleUpload(droppedFiles);
    }
  };

  const handleUpload = async (files: File[]) => {
    try {
      await executeToolAction('upload', {
        files,
        currentPath
      });
      loadDirectory();
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
    }
  };

  const renderBreadcrumb = () => {
    const parts = currentPath.split('/').filter(Boolean);
    return (
      <View style={styles.breadcrumb}>
        <TouchableOpacity
          style={styles.breadcrumbItem}
          onPress={() => updateToolConfig({ currentPath: '/' })}
        >
          <Ionicons name="home" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        {parts.map((part, index) => (
          <React.Fragment key={index}>
            <Text style={styles.breadcrumbSeparator}>/</Text>
            <TouchableOpacity
              style={styles.breadcrumbItem}
              onPress={() => {
                const newPath = '/' + parts.slice(0, index + 1).join('/');
                updateToolConfig({ currentPath: newPath });
              }}
            >
              <Text style={styles.breadcrumbText}>{part}</Text>
            </TouchableOpacity>
          </React.Fragment>
        ))}
      </View>
    );
  };

  const handleDeleteFile = async (filePath: string) => {
    try {
      await executeToolAction('delete_file', {
        filePath
      });
      loadDirectory();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  const renderRightActions = (filePath: string) => (
    <TouchableOpacity
      style={styles.deleteButton}
      onPress={() => handleDeleteFile(filePath)}
    >
      <Ionicons name="trash" size={24} color="white" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.fileManagerContainer}>
      <View style={styles.fileManagerToolbar}>
        {renderBreadcrumb()}
        <View style={styles.toolbarActions}>
          <TouchableOpacity
            style={styles.toolbarButton}
            onPress={() => setShowNewFolderInput(true)}
          >
            <Ionicons name="folder-open" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          {selectedFiles.length > 0 && (
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={handleDeleteSelected}
            >
              <Ionicons name="trash" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {showNewFolderInput && (
        <View style={styles.newFolderInput}>
          <TextInput
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Nom du nouveau dossier"
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity
            style={styles.inputButton}
            onPress={handleCreateFolder}
          >
            <Ionicons name="checkmark" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inputButton}
            onPress={() => {
              setNewFolderName('');
              setShowNewFolderInput(false);
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <View 
        style={[
          styles.fileListContainer,
          { paddingBottom: bottomPadding },
          dragOver && styles.dragOver
        ]}
        onDragOver={Platform.OS === 'web' ? (e) => {
          e.preventDefault();
          setDragOver(true);
        } : undefined}
        onDragLeave={Platform.OS === 'web' ? (e) => {
          e.preventDefault();
          setDragOver(false);
        } : undefined}
        onDrop={Platform.OS === 'web' ? handleDrop : undefined}
      >
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.fileList}>
            {files.map((file) => (
              <Swipeable
                key={file.path}
                renderRightActions={() => renderRightActions(file.path)}
              >
                <TouchableOpacity
                  style={[
                    styles.fileItem,
                    selectedFiles.includes(file.path || '') && styles.fileItemSelected
                  ]}
                  onPress={() => handleFileClick(file)}
                >
                  <Ionicons
                    name={file.type === 'directory' ? 'folder' : getFileIcon(file.name.split('.').pop())}
                    size={24}
                    color={theme.colors.text}
                  />
                  <View style={styles.fileDetails}>
                    <Text style={styles.fileName}>{file.name}</Text>
                    {file.type === 'file' && file.size !== null && (
                      <Text style={styles.fileInfo}>
                        {formatFileSize(file.size)} • {formatDate(file.modified)}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </ScrollView>
        )}
      </View>
      <BottomBar ToolComponent={FileManagerTool} />
    </View>
  );
};

// Fonctions utilitaires
const getFileIcon = (extension?: string): string => {
  switch (extension?.toLowerCase()) {
    case 'pdf': return 'document-text';
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif': return 'image';
    case 'mp3':
    case 'wav': return 'musical-notes';
    case 'mp4':
    case 'mov': return 'videocam';
    default: return 'document';
  }
};

const formatFileSize = (bytes: number | null): string => {
  if (bytes === null || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};