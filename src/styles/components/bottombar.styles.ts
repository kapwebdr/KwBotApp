import { Theme } from '../../types/themes';

export const createBottomBarStyles = (theme: Theme) => {
  return {
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 10,
      },
      bottomBarItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
      },
    //   bottomBarItem: {
    //     alignItems: 'center',
    //     justifyContent: 'center',
    //     paddingVertical: 8,
    //     position: 'relative',
    //   },
      bottomBarLabel: {
        fontSize: 12,
        marginTop: 4,
        textAlign: 'center',
      },
      bottomBarLabelActive: {
        fontWeight: 'bold',
      },
      bottomContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        zIndex: 800,
      },
      toolSubmenu: {
        position: 'absolute',
        zIndex: 1000,
      },
      toolSubmenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 4,
        marginVertical: 2,
      },
      toolSubmenuItemSelected: {
        backgroundColor: `${theme.colors.primary}10`,
      },
      toolSubmenuText: {
        marginLeft: 12,
        fontSize: 14,
        color: theme.colors.text,
        flex: 1,
      },
      toolSubmenuTextSelected: {
        color: theme.colors.primary,
        fontWeight: '500',
      },
      toolDropdownButtonDisabled: {
        opacity: 0.5,
        backgroundColor: theme.colors.gray100,
      },
      toolDropdownButton: {
        padding: 8,
        borderRadius: 6,
        backgroundColor: theme.colors.gray100,
        minWidth: 180,
      },
      toolDropdownButtonActive: {
        backgroundColor: theme.colors.gray150,
      },
      toolDropdownContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
      toolDropdownText: {
        color: theme.colors.text,
        fontSize: 14,
        flex: 1,
      },
      toolDropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 4,
        backgroundColor: theme.colors.background,
        borderRadius: 6,
        padding: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: theme.colors.border,
      },
      toolMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        padding: 8,
        borderRadius: 4,
      },
      toolMenuItemActive: {
        backgroundColor: `${theme.colors.primary}20`,
      },
      toolMenuItemText: {
        color: theme.colors.text,
        fontSize: 14,
      },
      toolMenuItemTextActive: {
        color: theme.colors.primary,
        fontWeight: 'bold',
      },
      iconContainer: {
        alignItems: 'center',
      },
  };
};