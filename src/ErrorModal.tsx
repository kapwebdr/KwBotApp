import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from './ThemeContext';
import { Ionicons } from '@expo/vector-icons';

interface ErrorModalProps {
  isVisible: boolean;
  onRetry: () => void;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isVisible, onRetry, message }) => {
  const theme = useTheme();

  if (!isVisible) return null;

  return (
    <Modal transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <Ionicons name="warning" size={48} color="red" style={styles.icon} />
          <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Erreur de connexion</Text>
          <Text style={[styles.modalText, { color: theme.colors.text }]}>{message}</Text>
          <TouchableOpacity 
            onPress={onRetry} 
            style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="refresh" size={20} color="white" style={styles.buttonIcon} />
            <Text style={styles.modalButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '90%',
    maxWidth: 400,
  },
  icon: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    minWidth: 150,
    justifyContent: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ErrorModal; 