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
    isGenerating
  } = useTool();
  
  const styles = createStyles({ theme });
  const features = getToolFeatures();

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
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
          style={[styles.input, isGenerating && styles.inputDisabled]}
          value={input}
          onChangeText={setInput}
          onKeyPress={handleKeyPress}
          placeholder={features.promptInput?.placeholder || "Tapez votre message..."}
          placeholderTextColor="#999"
          multiline={features.promptInput?.multiline}
          editable={!isGenerating}
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
          style={[styles.sendButton, (!input.trim() || isGenerating) && styles.sendButtonDisabled]}
          onPress={() => handleToolAction('send')}
          disabled={!input.trim() || isGenerating}
        >
          <Ionicons 
            name="send" 
            size={24} 
            color={!input.trim() || isGenerating ? "#999" : theme.colors.primary}
          />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
};