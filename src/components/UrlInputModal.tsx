import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface UrlInputModalProps {
  isVisible: boolean;
  onSubmit: (url: string) => void;
  onCancel: () => void;
}

const UrlInputModal: React.FC<UrlInputModalProps> = ({ isVisible, onSubmit, onCancel }) => {
  const [url, setUrl] = useState('');
  const theme = useTheme();

  if (!isVisible) return null;

  return (
    <Modal transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <Text style={[styles.modalText, { color: theme.colors.text }]}>Entrez l'URL du document à traiter</Text>
          <TextInput
            style={[styles.modalInput, { backgroundColor: theme.colors.inputBackground, color: theme.colors.text }]}
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.com/document.txt"
            placeholderTextColor={theme.colors.text}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={onCancel} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.modalButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onSubmit(url)} style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={styles.modalButtonText}>Valider</Text>
            </TouchableOpacity>
          </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
    maxWidth: 300,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  modalButton: {
    padding: 10,
    borderRadius: 5,
    minWidth: 100,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default UrlInputModal;
