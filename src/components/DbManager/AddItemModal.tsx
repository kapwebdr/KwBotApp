import React, { useState } from 'react';
import { View } from 'react-native';
import { useDbManager } from '../../contexts/DbManagerContext';
import { Modal, ModalAction } from '../main/Modal';
import { FormInput } from '../form/FormInput';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

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
  const [key, setKey] = useState('');
  const [value, setValue] = useState('');
  const { saveItem } = useDbManager();
  const { theme } = useTheme();
  const styles = createStyles({ theme });
  const handleSave = async () => {
    if (!key.trim()) return;

    try {
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

  const renderActions = () => (
    <>
      <ModalAction variant="secondary" onPress={onClose}>
        Annuler
      </ModalAction>
      <ModalAction variant="primary" onPress={handleSave}>
        Sauvegarder
      </ModalAction>
    </>
  );

  return (
    <Modal
      visible={isVisible}
      onClose={onClose}
      title="Ajouter un élément"
      actions={renderActions()}
      size="medium"
    >
      <View style={styles.modalBody}>
        <FormInput
          label="Clé"
          value={key}
          onChangeText={setKey}
          placeholder="Clé"
          required
        />
        <FormInput
          label="Valeur"
          value={value}
          onChangeText={setValue}
          placeholder="Valeur (texte ou JSON)"
          multiline
          numberOfLines={4}
        />
      </View>
    </Modal>
  );
}; 