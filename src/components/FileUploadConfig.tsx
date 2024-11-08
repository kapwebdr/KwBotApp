import React, { useRef } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { PendingFile } from './PendingFile';
import { FileUploadConfigProps  } from '../types/files';

export const FileUploadConfig: React.FC<FileUploadConfigProps> = ({
  tool,
  onFileSelect,
  pendingFiles,
  onClearFiles,
  onClearFile,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const hasFileUpload = !!tool.features?.fileUpload;
  const isMultiple = tool.features?.fileUpload?.multiple ?? false;
  const acceptedTypes = tool.features?.fileUpload?.accept?.join(',') || '*/*';
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length > 0) {
      if (isMultiple) {
        onFileSelect(files);
      } else {
        onFileSelect([files[0]]);
        if (pendingFiles.length > 0) {
          onClearFiles();
        }
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileUploadClick = () => {
    if (!isMultiple && pendingFiles.length > 0) {
      onClearFiles();
    }
    fileInputRef.current?.click();
  };

  if (!hasFileUpload) return null;

  return (
    <View style={styles.fileUploadContainer}>
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        onChange={handleFileChange}
        accept={acceptedTypes}
        multiple={isMultiple}
      />
      <View style={styles.uploadSection}>
        <TouchableOpacity 
          style={styles.uploadButton}
          onPress={handleFileUploadClick}
        >
          <Ionicons 
            name="cloud-upload" 
            size={24} 
            color={theme.colors.primary} 
          />
        </TouchableOpacity>

        {pendingFiles.length > 0 && (
          <View style={styles.pendingFilesContainer}>
            {pendingFiles.map((file, index) => (
              <PendingFile
                key={`${file.name}-${index}`}
                fileName={`${file.name}-${index}`}
                onClear={() => {
                  if (onClearFile) {
                    console.log(file);
                    onClearFile(file.id);
                  }
                }}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

export default FileUploadConfig;