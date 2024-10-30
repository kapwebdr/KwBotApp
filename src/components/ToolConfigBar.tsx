import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../ThemeContext';
import { Tool, ToolType } from '../types';
import { createStyles } from '../styles/theme.styles';
import { ChatControls } from './ChatControls';
import { FileUploadConfig } from './FileUploadConfig';

interface ToolConfigBarProps {
  currentTool: ToolType;
  systemMessage?: string;
  updateSystemMessage?: (message: string) => void;
  selectedModel?: string;
  availableModels?: string[];
  isModelLoading?: boolean;
  onModelChange?: (modelName: string) => void;
  handleFileUpload?: () => void;
  handleUrlInput?: () => void;
  pendingFile?: { name: string } | null;
  setPendingFile?: (file: null) => void;
}

export const ToolConfigBar: React.FC<ToolConfigBarProps> = ({
  currentTool,
  ...props
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  const renderToolConfig = () => {
    switch (currentTool) {
      case 'chat':
        return (
          <ChatControls
            systemMessage={props.systemMessage!}
            updateSystemMessage={props.updateSystemMessage!}
            selectedModel={props.selectedModel!}
            availableModels={props.availableModels!}
            isModelLoading={props.isModelLoading!}
            onModelChange={props.onModelChange!}
          />
        );
      case 'ocr':
      case 'image-analysis':
      case 'image-refine':
        return (
          <FileUploadConfig
            handleFileUpload={props.handleFileUpload!}
            handleUrlInput={props.handleUrlInput!}
            pendingFile={props.pendingFile}
            setPendingFile={props.setPendingFile!}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.toolConfigBar}>
      {renderToolConfig()}
    </View>
  );
}; 