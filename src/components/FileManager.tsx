import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { FileItem } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useToolContext } from '../contexts/ToolContext';

export const FileManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { toolConfig, updateToolConfig, handleToolAction } = useToolContext();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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

  const handleCreateFolder = async () => {
    if (!newFolderName) return;
    try {
      await handleToolAction('execute', {
        handler: 'handleCreateDirectory',
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
        await handleToolAction('execute', {
          handler: 'handleDeleteFile',
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
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Chargement...</Text>
          </View>
        ) : (
          <ScrollView style={styles.fileList}>
            {files.map((file) => (
              <TouchableOpacity
                key={file.path}
                style={[
                  styles.fileItem,
                  selectedFiles.includes(file.path) && styles.fileItemSelected
                ]}
                onPress={() => handleFileClick(file)}
              >
                <Ionicons
                  name={file.type === 'directory' ? 'folder' : getFileIcon(file.extension)}
                  size={24}
                  color={theme.colors.text}
                />
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName}>{file.name}</Text>
                  {file.type === 'file' && (
                    <Text style={styles.fileInfo}>
                      {formatFileSize(file.size)} • {formatDate(file.modified)}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>
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

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (date?: string): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString();
};