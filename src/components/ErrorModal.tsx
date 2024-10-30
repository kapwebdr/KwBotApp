import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../ThemeContext';
import { createStyles } from '../styles/theme.styles';

interface ErrorModalProps {
  isVisible: boolean;
  onRetry: () => void;
  message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isVisible,
  onRetry,
  message,
}) => {
  const theme = useTheme();
  const styles = createStyles(theme);

  if (!isVisible) return null;

  return (
    <Modal transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.modalText, { color: theme.colors.text }]}>{message}</Text>
          <TouchableOpacity 
            style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
            onPress={onRetry}
          >
            <Text style={styles.modalButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default ErrorModal; 