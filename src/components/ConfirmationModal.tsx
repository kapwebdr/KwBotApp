import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { createStyles } from '../styles/theme.styles';
import { Ionicons } from '@expo/vector-icons';

interface ConfirmationModalProps {
  isVisible: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: 'danger' | 'warning' | 'info';
  icon?: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isVisible,
  title,
  message,
  confirmText = 'Confirmer',
  cancelText = 'Annuler',
  onConfirm,
  onCancel,
  type = 'danger',
  icon,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const getTypeColor = () => {
    switch (type) {
      case 'danger':
        return theme.colors.error;
      case 'warning':
        return theme.colors.gray400;
      case 'info':
        return theme.colors.primary;
      default:
        return theme.colors.primary;
    }
  };

  return (
    <Modal
      visible={isVisible}
      transparent
      animationType="fade"
      onRequestClose={onCancel}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.background }]}>
          {icon && (
            <View style={[styles.modalIcon, { backgroundColor: `${getTypeColor()}20` }]}>
              <Ionicons name={icon as any} size={24} color={getTypeColor()} />
            </View>
          )}
          {title && <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>}
          <Text style={[styles.modalText, { color: theme.colors.text }]}>{message}</Text>
          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: theme.colors.gray100 }]}
              onPress={onCancel}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: getTypeColor() }]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalButtonText, { color: theme.colors.background }]}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ConfirmationModal;
