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
        return theme.colors.warning;
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
        <View style={[styles.modalConfirmContent, { backgroundColor: theme.colors.background }]}>
          <View style={styles.modalIconContainer}>
            {icon && (
              <View style={[styles.modalIcon, { backgroundColor: `${getTypeColor()}20` }]}>
                <Ionicons name={icon as any} size={24} color={getTypeColor()} />
              </View>
            )}
            {title && (
              <Text style={[styles.modalConfirmTitle, { color: theme.colors.text }]}>
                {title}
              </Text>
            )}
          </View>

          <Text style={[styles.modalConfirmText, { color: theme.colors.text }]}>
            {message}
          </Text>

          <View style={styles.modalConfirmActions}>
            <TouchableOpacity
              style={[styles.modalConfirmButton, styles.modalConfirmCancel]}
              onPress={onCancel}
            >
              <Text style={[styles.modalConfirmButtonText, { color: theme.colors.text }]}>
                {cancelText}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.modalConfirmButton,
                type === 'danger' && styles.modalConfirmDanger,
                type === 'warning' && styles.modalConfirmWarning,
                type === 'info' && styles.modalConfirmInfo,
              ]}
              onPress={onConfirm}
            >
              <Text style={[styles.modalConfirmButtonText, { color: theme.colors.background }]}>
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
