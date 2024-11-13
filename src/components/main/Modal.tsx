import React from 'react';
import { Modal as RNModal, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';

interface ModalProps {
  isVisible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  size?: 'small' | 'medium' | 'large';
  showCloseButton?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isVisible,
  onClose,
  title,
  children,
  actions,
  toolbar,
  size = 'medium',
  showCloseButton = true,
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  if (!isVisible) return null;

  const sizeStyles = {
    small: { maxWidth: 400 },
    medium: { maxWidth: 600 },
    large: { maxWidth: 800 },
  };

  return (
    <RNModal
      visible={isVisible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View 
          style={[
            styles.modalContent,
            sizeStyles[size],
            { backgroundColor: theme.colors.background }
          ]}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
              {title}
            </Text>
            {showCloseButton && (
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            )}
          </View>

          {toolbar && (
            <View style={styles.modalToolbar}>
              {toolbar}
            </View>
          )}

          <View style={styles.modalBody}>
            {children}
          </View>

          {actions && (
            <View style={styles.modalActions}>
              {actions}
            </View>
          )}
        </View>
      </View>
    </RNModal>
  );
};

// Composants utilitaires pour les actions
interface ModalActionProps {
  onPress: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger' | 'warning';
}

export const ModalAction: React.FC<ModalActionProps> = ({
  onPress,
  children,
  variant = 'primary'
}) => {
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const variantStyles = {
    primary: { backgroundColor: theme.colors.primary },
    secondary: { backgroundColor: theme.colors.gray200 },
    danger: { backgroundColor: theme.colors.error },
    warning: { backgroundColor: theme.colors.warning },
  };

  const textColor = variant === 'secondary' ? theme.colors.text : theme.colors.background;

  return (
    <TouchableOpacity
      style={[styles.modalButton, variantStyles[variant]]}
      onPress={onPress}
    >
      <Text style={[styles.modalButtonText, { color: textColor }]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}; 