import { Theme } from '../../types/themes';

export const createSidebarStyles = (theme: Theme) => {
  return {
    sidebarOverlay: {
        position: 'absolute',
        top: 60,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 999,
      },
      newConversationButton: {
        padding: 10,
        backgroundColor: theme.colors.primary,
        borderRadius: 8,
        margin: 10,
      },
      newConversationButtonText: {
        color: theme.colors.background,
        textAlign: 'center',
        fontWeight: 'bold',
      },
  };
};