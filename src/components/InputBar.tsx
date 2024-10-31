import React from 'react';
import { View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { FileUploadConfig } from './FileUploadConfig';
import { useTool } from '../hooks/useTool';

export const InputBar: React.FC = () => {
  const { theme } = useTheme();
  const { 
    tool,
    handleToolAction,
    isFeatureEnabled,
    getToolFeatures,
    input,
    setInput,
    isGenerating,
    isModelLoaded,
    isModelLoading,
    modelLoadingStatus,
    toolConfig
  } = useTool();
  
  const styles = createStyles({ theme });
  const features = getToolFeatures();

  const isInputDisabled = !toolConfig.model || !isModelLoaded || isModelLoading || isGenerating;
  const placeholderText = !toolConfig.model 
    ? "Veuillez sélectionner un modèle..."
    : isModelLoading 
      ? modelLoadingStatus 
      : !isModelLoaded 
        ? "Veuillez attendre le chargement du modèle..." 
        : features.promptInput?.placeholder || "Tapez votre message...";

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && !isInputDisabled) {
      e.preventDefault();
      handleToolAction('send');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 60}
      style={[styles.inputContainer, { backgroundColor: theme.colors.background }]}
    >
      {(isFeatureEnabled('fileUpload') || isFeatureEnabled('urlInput')) && (
        <FileUploadConfig
          onFileUpload={() => handleToolAction('upload')}
          onUrlInput={() => handleToolAction('url')}
        />
      )}

      {isFeatureEnabled('promptInput') && (
        <TextInput
          style={[styles.input, isInputDisabled && styles.inputDisabled]}
          value={input}
          onChangeText={setInput}
          onKeyPress={handleKeyPress}
          placeholder={placeholderText}
          placeholderTextColor="#999"
          multiline={features.promptInput?.multiline}
          editable={!isInputDisabled}
        />
      )}

      {isGenerating ? (
        <TouchableOpacity 
          style={[styles.sendButton, styles.stopButton]}
          onPress={() => handleToolAction('stop')}
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
            (!input.trim() || isInputDisabled) && styles.sendButtonDisabled
          ]}
          onPress={() => handleToolAction('send')}
          disabled={!input.trim() || isInputDisabled}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={!input.trim() || isInputDisabled ? "#999" : theme.colors.primary}
          />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};