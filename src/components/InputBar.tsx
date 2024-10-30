import React from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { TOOLS } from '../types';
import { FileUploadConfig } from './FileUploadConfig';

interface InputBarProps {
  input?: string;
  setInput?: (text: string) => void;
  isGenerating: boolean;
  handleSend: () => void;
  handleStop: () => void;
  handleFileUpload?: () => void;
  handleUrlInput?: () => void;
  pendingFile?: { name: string } | null;
  setPendingFile?: (file: null) => void;
  currentTool: string;
}

export const InputBar: React.FC<InputBarProps> = ({
  input = '',
  setInput = () => {},
  isGenerating,
  handleSend,
  handleStop,
  handleFileUpload,
  handleUrlInput,
  pendingFile,
  setPendingFile,
  currentTool,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);
  const tool = TOOLS.find(t => t.id === currentTool);

  const showInput = tool?.features?.promptInput;
  const showFileUpload = tool?.features?.fileUpload;
  const showUrlInput = tool?.features?.urlInput;

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 60}
      style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}
    >
      {(showFileUpload || showUrlInput) && handleFileUpload && handleUrlInput && setPendingFile && (
        
        <FileUploadConfig
          handleFileUpload={handleFileUpload}
          handleUrlInput={handleUrlInput}
          pendingFile={pendingFile}
          setPendingFile={setPendingFile}
        />
      )}

      {showInput && (
        <TextInput
          style={[
            styles.input,
            isGenerating && styles.inputDisabled
          ]}
          value={input}
          onChangeText={setInput}
          placeholder={tool.features?.promptInput?.placeholder || "Tapez votre message..."}
          placeholderTextColor="#999"
          multiline={tool.features?.promptInput?.multiline}
          editable={!isGenerating}
        />
      )}

      {isGenerating ? (
        <TouchableOpacity 
          style={[styles.sendButton, styles.stopButton]}
          onPress={handleStop}
        >
          <Ionicons 
            name="stop" 
            size={24} 
            color="red"
          />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity 
          style={[
            styles.sendButton,
            (!showInput || (!input.trim() && !pendingFile) || isGenerating) && styles.sendButtonDisabled
          ]}
          onPress={handleSend} 
          disabled={!showInput || (!input.trim() && !pendingFile) || isGenerating}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={!showInput || (!input.trim() && !pendingFile) || isGenerating ? "#999" : theme.colors.primary} 
          />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};