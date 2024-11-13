import React from 'react';
import { Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { Modal, ModalAction } from '../main/Modal';

interface ConfirmationModalProps {
  isVisible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
  type?: 'danger' | 'warning' | 'info';
  icon?: keyof typeof Ionicons.glyphMap;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  onConfirm,
  onCancel,
  title,
  message,
  type = 'danger',
  icon,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const renderActions = () => (
    <>
      <ModalAction variant="secondary" onPress={onCancel}>
        Annuler
      </ModalAction>
      <ModalAction variant={type} onPress={onConfirm}>
        Confirmer
      </ModalAction>
    </>
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onCancel}
      title={title}
      actions={renderActions()}
      size="small"
    >
      <Text style={[styles.formLabel, { color: theme.colors.text }]}>
        {message}
      </Text>
    </Modal>
  );
};

export default ConfirmationModal;
