import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useBottomPadding } from '../hooks/useBottomPadding';
import { BottomBar } from './BottomBar';
import { FileManagerTool } from './FileManagerTool';
import { useFileManager } from '../contexts/FileManagerContext';
import { MoveFileModal } from './MoveFileModal';
import { ConfirmationModal } from './ConfirmationModal';
import { FileList } from './FileList';
import { FilePreview } from './FilePreview';
import { FileItem } from '../types/files';

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
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [fileToRename, setFileToRename] = useState<FileItem | null>(null);
  const [showRenameInput, setShowRenameInput] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateFolderSubmit = async () => {
    if (!newFolderName.trim()) return;
    
    const success = await handleCreateFolder(newFolderName.trim());
    if (success) {
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

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

  const renderFileActions = (file: FileItem) => {
    const actions = [];

    if (file.type === 'file') {
      actions.push(
        <TouchableOpacity
          key="preview"
          style={[styles.fileItemAction, styles.fileItemActionPreview]}
          onPress={() => setPreviewFile(file)}
        >
          <Ionicons name="eye" size={24} style={styles.actionIcon} />
        </TouchableOpacity>
      );
    }

    actions.push(
      <TouchableOpacity
        key="delete"
        style={[styles.fileItemAction, styles.fileItemActionDelete]}
        onPress={() => initiateDelete(file)}
      >
        <Ionicons name="trash" size={24} style={styles.actionIcon} />
      </TouchableOpacity>
    );

    actions.push(
      <TouchableOpacity
        key="move"
        style={[styles.fileItemAction, styles.fileItemMove]}
        onPress={() => initiateMove(file)}
      >
        <Ionicons name="arrow-forward" size={24} style={styles.actionIcon} />
      </TouchableOpacity>
    );

    if (file.type === 'file') {
      actions.push(
        <TouchableOpacity
          key="download"
          style={[styles.fileItemAction, styles.fileItemActionDownload]}
          onPress={() => handleDownloadFile(file.path)}
        >
          <Ionicons name="download" size={24} style={styles.actionIcon} />
        </TouchableOpacity>
      );

      if (!file.name.toLowerCase().endsWith('.zip')) {
        actions.push(
          <TouchableOpacity
            key="compress"
            style={[styles.fileItemAction, styles.fileItemActionCompress]}
            onPress={() => handleCompressFile(file.path)}
          >
            <Ionicons name="archive" size={24} style={styles.actionIcon} />
          </TouchableOpacity>
        );
      } else {
        actions.push(
          <TouchableOpacity
            key="decompress"
            style={[styles.fileItemAction, styles.fileItemActionDecompress]}
            onPress={() => handleDecompressFile(file.path)}
          >
            <Ionicons name="folder-open" size={24} style={styles.actionIcon} />
          </TouchableOpacity>
        );
      }
    }

    actions.push(
      <TouchableOpacity
        key="rename"
        style={[styles.fileItemAction, styles.fileItemActionRename]}
        onPress={() => initiateRename(file)}
      >
        <Ionicons name="pencil" size={24} style={styles.actionIcon} />
      </TouchableOpacity>
    );

    return (
      <View style={styles.fileItemActions}>
        {actions}
      </View>
    );
  };

  return (
    <View style={styles.fileManagerContainer}>
      <View style={styles.fileManagerToolbar}>
        <View style={styles.breadcrumb}>
          <TouchableOpacity
            style={styles.breadcrumbItem}
            onPress={() => handleFileClick({ type: 'directory', path: '/', name: '/' })}
          >
            <Ionicons name="home" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          {currentPath.split('/').filter(Boolean).map((part, index, parts) => {
            const pathUpToHere = '/' + parts.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={index}>
                <Text style={styles.breadcrumbSeparator}>/</Text>
                <TouchableOpacity
                  style={styles.breadcrumbItem}
                  onPress={() => handleFileClick({ type: 'directory', path: pathUpToHere, name: part })}
                >
                  <Text style={styles.breadcrumbText}>{part}</Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
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
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity
            style={styles.inputButton}
            onPress={handleCreateFolderSubmit}
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

      {showRenameInput && fileToRename && (
        <View style={styles.newFolderInput}>
          <TextInput
            value={newFileName}
            onChangeText={setNewFileName}
            placeholder="Nouveau nom"
            style={styles.input}
            autoFocus
          />
          <TouchableOpacity
            style={styles.inputButton}
            onPress={handleRenameSubmit}
          >
            <Ionicons name="checkmark" size={20} color={theme.colors.text} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.inputButton}
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

      <View style={[
        styles.fileListContainer,
        { marginBottom: bottomPadding }
      ]}>
        <FileList
          files={files}
          currentPath={currentPath}
          selectedFiles={selectedFiles}
          onFileClick={handleFileClick}
          renderActions={renderFileActions}
          showSwipeActions={true}
          showFileInfo={true}
          onSwipeOpen={(swipeable, file) => {
            if (swipeableRefs.current[file.path] !== swipeable) {
              Object.values(swipeableRefs.current).forEach(ref => ref?.close());
            }
          }}
          swipeableRefs={swipeableRefs}
        />
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
      <BottomBar
        ToolComponent={FileManagerTool}
      />
    </View>
  );
};
