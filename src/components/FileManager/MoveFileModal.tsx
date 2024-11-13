import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { FileItem } from '../../types/files';
import { fileUploadService } from '../../services/fileUploadService';
import { ListItem } from '../main/ListItem';
import { MoveFileModalProps } from '../../types/files';
import { Modal, ModalAction } from '../main/Modal';
import { Breadcrumb } from '../main/Breadcrumb';

const formatFileSize = (bytes: number | null): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

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
  const [currentModalPath, setCurrentModalPath] = useState(currentPath);
  const [files, setFiles] = useState<FileItem[]>([]);
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
    await fileUploadService.createDirectory(currentModalPath, newFolderName.trim());
    setNewFolderName('');
    setShowNewFolderInput(false);
    loadDirectory();
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'directory') {
      setCurrentModalPath(file.path);
    }
  };

  const renderFileList = () => {
    const customStyles = {
      container: styles.fileItem,
      content: styles.fileItemContent,
      header: styles.fileItemHeader,
      icon: styles.fileItemIcon,
      title: styles.fileName,
      meta: styles.fileItemMeta,
      metaText: styles.fileItemMetaText,
    };

    return (
      <ScrollView style={styles.listContent}>
        {files.map((file) => (
          <ListItem
            key={file.path}
            title={file.name}
            icon="folder"
            iconColor={theme.colors.warning}
            onPress={() => handleFileClick(file)}
            renderMeta={() => (
              <>
                <Text style={styles.fileItemMeta}>
                  {formatFileSize(file.size)}
                </Text>
                <Text style={styles.fileItemMeta}>
                  {new Date(file.modified).toLocaleDateString()}
                </Text>
              </>
            )}
            customStyles={customStyles}
          />
        ))}
      </ScrollView>
    );
  };

  const renderToolbar = () => (
    <View style={styles.fileManagerToolbar}>
      <Breadcrumb
        path={currentModalPath}
        onNavigate={setCurrentModalPath}
        actions={
          <TouchableOpacity
            style={styles.breadcrumbButton}
            onPress={() => setShowNewFolderInput(true)}
          >
            <Ionicons name="folder-open" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        }
      />
    </View>
  );

  const renderActions = () => (
    <>
      <ModalAction variant="secondary" onPress={onClose}>
        Annuler
      </ModalAction>
      <ModalAction variant="primary" onPress={() => onMove(currentModalPath)}>
        {confirmText}
      </ModalAction>
    </>
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onClose}
      title={title || `Déplacer ${itemToMove?.name || ''}`}
      toolbar={renderToolbar()}
      actions={renderActions()}
      size="large"
    >
      {showNewFolderInput && (
        <View style={styles.newFolderInput}>
          <TextInput
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Nom du nouveau dossier"
            style={[styles.formInput, { flex: 1 }]}
            autoFocus
          />
          <TouchableOpacity
            style={styles.formInputButton}
            onPress={handleCreateFolder}
          >
            <Ionicons name="checkmark" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formInputButton}
            onPress={() => {
              setNewFolderName('');
              setShowNewFolderInput(false);
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.listContainer, { flex: 1 }]}>
        {renderFileList()}
      </View>
    </Modal>
  );
};
