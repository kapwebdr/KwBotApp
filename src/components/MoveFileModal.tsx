import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { FileItem } from '../types/files';
import { fileUploadService } from '../services/fileUploadService';
import { FileList } from './FileList';
import { MoveFileModalProps } from '../types/files';

export const MoveFileModal: React.FC<MoveFileModalProps> = ({
  isVisible,
  onClose,
  onMove,
  currentPath,
  itemToMove,
  directoryOnly = false,
  title,
  confirmText = 'Déplacer ici',
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentModalPath, setCurrentModalPath] = useState(currentPath);
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  const loadDirectory = useCallback(async () => {
    try {
      const response = await fileUploadService.listDirectory(currentModalPath);
      setFiles(response);
    } catch (error) {
      console.error('Erreur lors du chargement du répertoire:', error);
    }
  }, [currentModalPath]);

  useEffect(() => {
    if (isVisible) {
      loadDirectory();
    }
  }, [isVisible, loadDirectory]);

  useEffect(() => {
    setCurrentModalPath(currentPath);
  }, [currentPath]);

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    
    try {
      await fileUploadService.createDirectory(newFolderName.trim(), currentModalPath);
      setNewFolderName('');
      setShowNewFolderInput(false);
      await loadDirectory();
    } catch (error) {
      console.error('Erreur lors de la création du dossier:', error);
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory' && file.path) {
      setCurrentModalPath(file.path);
    }
  };

  const renderBreadcrumb = () => {
    const parts = currentModalPath.split('/').filter(Boolean);
    
    return (
      <View style={styles.breadcrumb}>
        <TouchableOpacity
          style={styles.breadcrumbItem}
          onPress={() => setCurrentModalPath('/')}
        >
          <Ionicons name="home" size={20} color={theme.colors.text} />
        </TouchableOpacity>
        {parts.map((part, index) => {
          const pathUpToHere = '/' + parts.slice(0, index + 1).join('/');
          return (
            <React.Fragment key={index}>
              <Text style={styles.breadcrumbSeparator}>/</Text>
              <TouchableOpacity
                style={styles.breadcrumbItem}
                onPress={() => setCurrentModalPath(pathUpToHere)}
              >
                <Text style={styles.breadcrumbText}>{part}</Text>
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </View>
    );
  };

  const getModalTitle = () => {
    if (title) return title;
    if (!itemToMove) return 'Sélectionner un dossier';
    return `Déplacer ${itemToMove.type === 'directory' ? 'le dossier' : 'le fichier'} "${itemToMove.name}"`;
  };

  if (!isVisible) return null;

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {getModalTitle()}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalToolbar}>
            {renderBreadcrumb()}
            <TouchableOpacity
              style={styles.toolbarButton}
              onPress={() => setShowNewFolderInput(true)}
            >
              <Ionicons name="folder-open" size={20} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          {showNewFolderInput && (
            <View style={styles.newFolderInput}>
              <TextInput
                value={newFolderName}
                onChangeText={setNewFolderName}
                placeholder="Nom du nouveau dossier"
                style={[styles.input, { flex: 1 }]}
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

          <View style={styles.modalBody}>
            <FileList
              files={files}
              currentPath={currentModalPath}
              onFileClick={handleFileClick}
              directoryOnly={directoryOnly}
              showSwipeActions={false}
              showFileInfo={false}
              disabledItems={itemToMove ? [itemToMove.path] : []}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.gray100 }]}
              onPress={onClose}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                Annuler
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={() => onMove(currentModalPath)}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
