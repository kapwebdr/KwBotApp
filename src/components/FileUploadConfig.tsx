import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { Tool } from '../types';
import { PendingFile } from './PendingFile';
import { useTool } from '../hooks/useTool';
interface FileUploadConfigProps {
  tool: Tool;
  onFileSelect: (file: File) => void;
  pendingFile: { name: string; file: File } | null;
  onClearFile: () => void;
}

export const FileUploadConfig: React.FC<FileUploadConfigProps> = ({
  tool,
  onFileSelect,
  pendingFile,
  onClearFile
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { handleToolAction } = useTool();

  const hasFileUpload = !!tool.features?.fileUpload;
  const hasUrlInput = !!tool.features?.urlInput;

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUrlInput = () => {
    handleToolAction('url');
  };

  if (!hasFileUpload && !hasUrlInput) return null;

  return (
    <View style={styles.fileUploadContainer}>
      {hasFileUpload && (
        <>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileChange}
            accept={tool.features?.fileUpload?.accept?.join(',')}
            multiple={tool.features?.fileUpload?.multiple}
          />
          {!pendingFile ? (
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleFileUploadClick}
            >
              <Ionicons 
                name="cloud-upload" 
                size={styles.buttonIcon.size} 
                color={styles.buttonIcon.color} 
              />
            </TouchableOpacity>
          ) : (
            <PendingFile
              fileName={pendingFile.name}
              onClear={onClearFile}
            />
          )}
        </>
      )}

      {hasUrlInput && (
        <TouchableOpacity 
          style={styles.urlButton}
          onPress={handleUrlInput}
        >
          <Ionicons name="link" size={24} color={theme.colors.primary} />
          <Text style={styles.urlButtonText}>URL</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default FileUploadConfig; 