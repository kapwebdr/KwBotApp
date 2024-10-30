import React from 'react';
import { View } from 'react-native';
import { InputBar } from './InputBar';
import { ToolConfigComponent } from './ToolConfig';
import { createStyles } from '../styles/theme.styles';
import { useTheme } from '../ThemeContext';
import { TOOLS, Tool as ToolType, ToolConfig } from '../types';

interface ToolProps {
  toolId: ToolType['id'];
  config: ToolConfig;
  onConfigChange: (config: ToolConfig) => void;
  input: string;
  setInput: (text: string) => void;
  isGenerating: boolean;
  handleSend: () => void;
  handleStop: () => void;
  handleFileUpload?: () => void;
  handleUrlInput?: () => void;
  pendingFile?: { name: string } | null;
  setPendingFile?: (file: null) => void;
}

export const ToolComponent: React.FC<ToolProps> = ({
  toolId,
  config,
  onConfigChange,
  input,
  setInput,
  isGenerating,
  handleSend,
  handleStop,
  handleFileUpload,
  handleUrlInput,
  pendingFile,
  setPendingFile,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const tool = TOOLS.find(t => t.id === toolId);

  if (!tool) return null;

  const showInput = tool.features?.promptInput;
  const showFileUpload = tool.features?.fileUpload;
  const showUrlInput = tool.features?.urlInput;

  const effectiveFileUploadHandler = showFileUpload ? handleFileUpload : undefined;
  const effectiveUrlInputHandler = showUrlInput ? handleUrlInput : undefined;

  return (
    <View style={styles.toolContainer}>
      {/* Configuration de l'outil */}
      {tool.configFields && (
        <ToolConfigComponent
          tool={tool}
          config={config}
          onConfigChange={onConfigChange}
        />
      )}

      {/* Barre d'entrée avec gestion conditionnelle des fonctionnalités */}
      <InputBar
        currentTool={toolId}
        input={input}
        setInput={setInput}
        isGenerating={isGenerating}
        handleSend={handleSend}
        handleStop={handleStop}
        handleFileUpload={effectiveFileUploadHandler}
        handleUrlInput={effectiveUrlInputHandler}
        pendingFile={pendingFile}
        setPendingFile={setPendingFile}
        showInput={showInput}
        showFileUpload={showFileUpload}
        showUrlInput={showUrlInput}
      />
    </View>
  );
};

export default ToolComponent; 