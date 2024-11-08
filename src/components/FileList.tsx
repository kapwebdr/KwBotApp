import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import { FileItem } from '../types/files';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { FileListProps } from '../types/files';

export const FileList: React.FC<FileListProps> = ({
  files,
  selectedFiles = [],
  onFileClick,
  renderActions,
  showSwipeActions = false,
  directoryOnly = false,
  disabledItems = [],
  showFileInfo = true,
  customRenderItem,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const swipeableRefs = useRef<{ [key: string]: Swipeable | null }>({});
  const [activeSwipeKey, setActiveSwipeKey] = useState<string | null>(null);

  const handleSwipeOpen = (key: string) => {
    // Fermer le swipe précédemment ouvert s'il existe et est différent
    if (activeSwipeKey && activeSwipeKey !== key) {
      swipeableRefs.current[activeSwipeKey]?.close();
    }
    setActiveSwipeKey(key);
    setIsSwipeActive(true);
  };

  const handleSwipeClose = () => {
    setActiveSwipeKey(null);
    setIsSwipeActive(false);
  };

  const handleItemPress = (file: FileItem) => {
    // Si un swipe est actif mais que ce n'est pas celui de l'élément cliqué
    if (activeSwipeKey && activeSwipeKey !== file.path) {
      swipeableRefs.current[activeSwipeKey]?.close();
      handleSwipeClose();
    }
    
    // Si aucun swipe n'est actif ou si c'est un autre élément, déclencher le click
    if (!activeSwipeKey || activeSwipeKey !== file.path) {
      onFileClick(file);
    }
  };

  const filteredFiles = files.filter(file => 
    directoryOnly ? file.type === 'directory' : true
  );

  const renderFileItem = (file: FileItem) => {
    if (customRenderItem) {
      return customRenderItem(file);
    }

    return (
      <TouchableOpacity
        style={[
          styles.fileItem,
          file.type === 'directory' && styles.fileItemDirectory,
          selectedFiles.includes(file.path || '') && styles.fileItemSelected,
          disabledItems.includes(file.path || '') && styles.fileItemDisabled
        ]}
        onPress={() => handleItemPress(file)}
        disabled={disabledItems.includes(file.path || '')}
      >
        <Ionicons
          name={file.type === 'directory' ? 'folder' : getFileIcon(file.name.split('.').pop() || '')}
          size={24}
          color={theme.colors.text}
        />
        <View style={styles.fileDetails}>
          <Text style={styles.fileName}>{file.name}</Text>
          {showFileInfo && file.type === 'file' && file.size !== null && (
            <Text style={styles.fileInfo}>
              {formatFileSize(file.size)} • {formatDate(file.modified)}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View 
      style={styles.fileList}
      onTouchStart={(e) => {
        // Vérifier si le touch est en dehors des éléments de la liste
        const target = e.target as HTMLElement;
        const isOutsideListItem = !target.closest('.file-item');
        
        if (activeSwipeKey && isOutsideListItem) {
          swipeableRefs.current[activeSwipeKey]?.close();
          handleSwipeClose();
        }
      }}
    >
      {filteredFiles.map((file) => (
        showSwipeActions && renderActions ? (
          <Swipeable
            key={file.path}
            ref={(ref) => {
              if (ref) {
                swipeableRefs.current[file.path || ''] = ref;
              }
            }}
            renderRightActions={() => renderActions(file)}
            rightThreshold={40}
            onSwipeableWillOpen={() => handleSwipeOpen(file.path || '')}
            onSwipeableWillClose={handleSwipeClose}
          >
            <View className="file-item">
              {renderFileItem(file)}
            </View>
          </Swipeable>
        ) : (
          <React.Fragment key={file.path}>
            {renderFileItem(file)}
          </React.Fragment>
        )
      ))}
    </View>
  );
};

// Fonctions utilitaires
const getFileIcon = (extension: string): string => {
  switch (extension.toLowerCase()) {
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

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString();
};
