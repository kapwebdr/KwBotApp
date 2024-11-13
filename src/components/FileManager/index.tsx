import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { useBottomPadding } from '../../hooks/useBottomPadding';
import { FileManagerTool } from './FileManagerTool';
import { useFileManager } from '../../contexts/FileManagerContext';
import { MoveFileModal } from './MoveFileModal';
import { ConfirmationModal } from '../main/ConfirmationModal';
import { FilePreview } from './FilePreview';
import { FileItem } from '../../types/files';
import { useTool } from '../../hooks/useTool';
import { ListItem } from '../main/ListItem';
import { Breadcrumb } from '../main/Breadcrumb';

const formatFileSize = (bytes: number): string => {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};

export const FileManager: React.FC = () => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const bottomPadding = useBottomPadding();
  const {
    files,
    currentPath,
    selectedFiles,
    handleFileClick,
    handleCreateFolder,
    handleDeleteFiles,
    handleDownloadFile,
    handleCompressFile,
    handleDecompressFile,
    handleMoveFiles,
    handleRenameFile,
  } = useFileManager();

  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [moveModalVisible, setMoveModalVisible] = useState(false);
  const [fileToMove, setFileToMove] = useState<FileItem | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<FileItem | null>(null);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const { setToolHeight } = useTool();
  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    const success = await handleCreateFolder(newFolderName.trim());
    if (success) {
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  useEffect(() => {
    setToolHeight(70);
  }, [setToolHeight]);
  const handleMoveFile = async (destination: string) => {
    if (!fileToMove?.path) return;
    
    const success = await handleMoveFiles([fileToMove.path], destination);
    if (success) {
      setMoveModalVisible(false);
      setFileToMove(null);
    }
  };

  const initiateMove = (file: FileItem) => {
    setFileToMove(file);
    setMoveModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (fileToDelete?.path) {
      await handleDeleteFiles([fileToDelete.path]);
      setDeleteModalVisible(false);
      setFileToDelete(null);
    }
  };

  const initiateDelete = (file: FileItem) => {
    setFileToDelete(file);
    setDeleteModalVisible(true);
  };

  const initiateRename = (file: FileItem) => {
    setFileToRename(file);
    setNewFileName(file.name);
    setShowRenameInput(true);
  };

  const handleRenameSubmit = async () => {
    if (!fileToRename?.path || !newFileName.trim()) return;

    const success = await handleRenameFile(fileToRename.path, newFileName.trim());
    if (success) {
      setShowRenameInput(false);
      setFileToRename(null);
      setNewFileName('');
    }
  };

  const getFileIcon = (type: string, name: string): keyof typeof Ionicons.glyphMap => {
    if (type === 'directory') return 'folder';
    
    const extension = name.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return 'image';
      case 'mp4':
      case 'avi':
      case 'mov':
        return 'videocam';
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'musical-notes';
      case 'pdf':
        return 'document-text';
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive';
      case 'txt':
      case 'md':
        return 'document';
      default:
        return 'document-outline';
    }
  };

  const renderFileItem = (file: FileItem) => {
    const isDirectory = file.type === 'directory';
    
    const leftActions = [
      {
        icon: 'eye',
        color: theme.colors.success,
        onPress: () => setPreviewFile(file),
        type: 'preview' as const
      }
    ];

    const rightActions = [
      {
        icon: 'pencil',
        color: theme.colors.primary,
        onPress: () => initiateRename(file),
        type: 'edit' as const
      },
      {
        icon: 'trash',
        color: theme.colors.error,
        onPress: () => initiateDelete(file),
        type: 'delete' as const
      },
      {
        icon: 'arrow-forward',
        color: theme.colors.warning,
        onPress: () => initiateMove(file),
        type: 'move' as const
      }
    ];

    if (!isDirectory) {
      rightActions.unshift({
        icon: 'download',
        color: theme.colors.primary,
        onPress: () => handleDownloadFile(file.path),
        type: 'download' as const
      });

      if (file.name.endsWith('.zip')) {
        rightActions.unshift({
          icon: 'folder-open',
          color: theme.colors.info,
          onPress: () => handleDecompressFile(file.path),
          type: 'decompress' as const
        });
      } else {
        rightActions.unshift({
          icon: 'archive',
          color: theme.colors.info,
          onPress: () => handleCompressFile(file.path),
          type: 'compress' as const
        });
      }
    }

    const customStyles = {
      container: styles.fileItem,
      content: styles.fileItemContent,
      header: styles.fileItemHeader,
      icon: styles.fileItemIcon,
      title: styles.fileName,
      meta: styles.fileItemMeta,
      metaText: styles.fileItemMetaText,
    };
    const renderMeta = () => (
      <>
        <Text style={styles.fileItemMeta}>
          {formatFileSize(file.size)}
        </Text>
        <Text style={styles.fileItemMeta}>
          {formatDate(file.modified)}
        </Text>
      </>
    );
    return (
      <ListItem
        key={file.path}
        title={file.name}
        type={file.type}
        icon={getFileIcon(file.type, file.name)}
        iconColor={file.type === 'directory' ? theme.colors.warning : theme.colors.primary}
        leftActions={leftActions}
        rightActions={rightActions}
        onPress={() => file.type === 'directory' && handleFileClick(file)}
        renderMeta={renderMeta}
        customStyles={customStyles}
      />
    );
  };

  const renderBreadcrumbActions = () => (
    <TouchableOpacity
      style={styles.breadcrumbButton}
      onPress={() => setShowNewFolderInput(true)}
    >
      <Ionicons name="folder-open" size={20} color={theme.colors.text} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.fileManagerContainer}>
      <View style={styles.fileManagerToolbar}>
        <Breadcrumb
          path={currentPath}
          onNavigate={(path) => handleFileClick({ 
            type: 'directory', 
            path, 
            name: path.split('/').pop() || '/',
            size: null,
            modified: new Date().toISOString()
          })}
          actions={renderBreadcrumbActions()}
        />
      </View>

      {showNewFolderInput && (
        <View style={styles.newFolderInput}>
          <TextInput
            value={newFolderName}
            onChangeText={setNewFolderName}
            placeholder="Nom du nouveau dossier"
            style={styles.formInput}
            autoFocus
          />
          <TouchableOpacity
            style={styles.formInputButton}
            onPress={handleCreateFolderSubmit}
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

      {showRenameInput && fileToRename && (
        <View style={styles.newFolderInput}>
          <TextInput
            value={newFileName}
            onChangeText={setNewFileName}
            placeholder="Nouveau nom"
            style={styles.formInput}
            autoFocus
          />
          <TouchableOpacity
            style={styles.formInputButton}
            onPress={handleRenameSubmit}
          >
            <Ionicons name="checkmark" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.formInputButton}
            onPress={() => {
              setShowRenameInput(false);
              setFileToRename(null);
              setNewFileName('');
            }}
          >
            <Ionicons name="close" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.listContainer, { marginBottom: bottomPadding }]}>
        <ScrollView 
          style={styles.listContent}
          showsVerticalScrollIndicator={false}
        >
          {files.map(renderFileItem)}
        </ScrollView>
      </View>

      <MoveFileModal
        isVisible={moveModalVisible}
        onClose={() => {
          setMoveModalVisible(false);
          setFileToMove(null);
        }}
        onMove={handleMoveFile}
        currentPath={currentPath}
        itemToMove={fileToMove}
        directoryOnly={true}
      />

      {fileToDelete && (
        <ConfirmationModal
          isVisible={deleteModalVisible}
          onConfirm={handleDeleteConfirm}
          onCancel={() => {
            setDeleteModalVisible(false);
            setFileToDelete(null);
          }}
          message={`Êtes-vous sûr de vouloir supprimer ${fileToDelete.type === 'directory' ? 'le dossier' : 'le fichier'} "${fileToDelete.name}" ?`}
        />
      )}

      {previewFile && (
        <FilePreview
          file={previewFile}
          isModal={true}
          onClose={() => setPreviewFile(null)}
          onDownload={() => previewFile.path && handleDownloadFile(previewFile.path)}
        />
      )}
    </View>
  );
};
