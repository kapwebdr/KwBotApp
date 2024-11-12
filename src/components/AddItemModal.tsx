import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { useDbManager } from '../contexts/DbManagerContext';

interface AddItemModalProps {
  isVisible: boolean;
  onClose: () => void;
  currentCollection: string;
}

export const AddItemModal: React.FC<AddItemModalProps> = ({
  isVisible,
  onClose,
  currentCollection,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const { saveItem } = useDbManager();
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');

  const handleSave = async () => {
    if (!key.trim()) return;

    try {
      // Tenter de parser la valeur comme JSON si possible
      const parsedValue = value.trim().startsWith('{') || value.trim().startsWith('[')
        ? JSON.parse(value)
        : value;

      const success = await saveItem(key.trim(), parsedValue);
      if (success) {
        setKey('');
        setValue('');
        onClose();
      }
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              Ajouter un élément
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.modalBody}>
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Clé"
              placeholderTextColor={theme.colors.gray400}
              value={key}
              onChangeText={setKey}
            />
            <TextInput
              style={[styles.input, styles.valueInput, { color: theme.colors.text }]}
              placeholder="Valeur (texte ou JSON)"
              placeholderTextColor={theme.colors.gray400}
              value={value}
              onChangeText={setValue}
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleSave}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                Sauvegarder
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}; 