import { Theme } from '../../types/themes';

export const createContainerStyles = (theme: Theme) => {
  return {
    container: {
        flex: 1,
        // overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.colors.background,
      },

      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 10,
        height: 60,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        zIndex: 900,
      },

      mainContent: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      },

      contentContainer: {
        flex: 1,
        overflow: 'auto',
      },

      bottomNavigation: {
        height: 80,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      },

      // Tous les styles de ChatBot.tsx qui dépendent du thème
      headerContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 10,
      },
  };
};
