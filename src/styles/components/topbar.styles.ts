import { Theme } from '../../types/themes';

export const createTopBarStyles = (theme: Theme) => {
  return {
    themeSelector: {
        position: 'relative',
        zIndex: 1000,
      },
      themeButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: theme.colors.gray100,
        alignItems: 'center',
        justifyContent: 'center',
      },
      themeDropdownMenu: {
        position: 'absolute',
        top: '100%',
        right: 0,
        marginTop: 4,
        backgroundColor: theme.colors.background,
        borderRadius: 6,
        padding: 4,
        minWidth: 180,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
        zIndex: 1001,
      },
      themeMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 4,
      },
      themeMenuItemActive: {
        backgroundColor: `${theme.colors.primary}20`,
      },
      themeMenuItemText: {
        color: theme.colors.text,
        fontSize: 14,
        marginLeft: 8,
      },
      themeMenuItemTextActive: {
        color: theme.colors.primary,
        fontWeight: 'bold',
      },
  };
};
