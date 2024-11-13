import React from 'react';
import { Text } from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';
import { createStyles } from '../../styles/theme.styles';
import { Modal, ModalAction } from './Modal';

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
  const { theme } = useTheme();
  const styles = createStyles({ theme });

  const renderActions = () => (
    <ModalAction variant="primary" onPress={onRetry}>
      Réessayer
    </ModalAction>
  );

  return (
    <Modal
      isVisible={isVisible}
      onClose={onRetry}
      title="Erreur"
      actions={renderActions()}
      size="small"
    >
      <Text style={[styles.formLabel, { color: theme.colors.text }]}>
        {message}
      </Text>
    </Modal>
  );
};

export default ErrorModal; 