import { Theme } from '../../types/themes';

export const createButtonStyles = (theme: Theme) => {
  const baseButton = {
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    width: 44,
    height: 44,
    backgroundColor: theme.colors.inputBackground,
  };
  const baseButtonIcon = {
    size: 24,
    color: theme.colors.primary,
  };

  const baseButtonDisabled = {
    opacity: 0.5,
    backgroundColor: theme.colors.gray100,
  };

  return {
    sendButton: {
    ...baseButton,
    marginLeft: 'auto',
    },
    sendButtonDisabled: {
    ...baseButtonDisabled,
    },
    uploadButton: {
    ...baseButton,
    },
    disabledButton: {
        opacity: 0.5,
        backgroundColor: theme.colors.gray400,
      },
      disabledButtonText: {
        opacity: 0.7,
      },
    stopButton: {
    ...baseButton,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    },
    voiceButton: {
    ...baseButton,
    },
    voiceButtonActive: {
    backgroundColor: theme.colors.primary,
    },
    voiceButtonDisabled: {
    ...baseButtonDisabled,
    },
    buttonIcon: {
    ...baseButtonIcon,
    },
    deleteButton: {
        padding: 5,
      },
    baseButtonIcon,
    baseButton,
    baseButtonDisabled: {
      opacity: 0.5,
      backgroundColor: theme.colors.gray100,
    },
  };
};
