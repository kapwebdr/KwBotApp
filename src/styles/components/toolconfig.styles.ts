import { Theme } from '../../types/themes';

export const createToolConfigStyles = (theme: Theme) => {
  return {
    toolBarContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
      },
      toolConfigBar: {
        width: '100%',
        padding: 10,
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      },
      toolsSection: {
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        paddingBottom: 10,
      },
      toolItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        gap: 10,
      },
      toolItemActive: {
        backgroundColor: `${theme.colors.primary}20`,
      },
      toolItemText: {
        color: theme.colors.text,
        fontSize: 14,
      },
      toolItemTextActive: {
        color: theme.colors.primary,
        fontWeight: 'bold',
      },
      toolOptionsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        paddingVertical: 8,
        paddingHorizontal: 16,
        position: 'relative',
      },
      toolButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        borderRadius: 8,
      },
      toolButtonActive: {
        backgroundColor: `${theme.colors.primary}10`,
      },
      toolButtonSelected: {
        backgroundColor: `${theme.colors.primary}20`,
      },
      toolButtonText: {
        fontSize: 12,
        color: theme.colors.text,
        marginTop: 4,
      },
      toolButtonTextActive: {
        color: theme.colors.primary,
      },
      toolContainer: {
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      },
      toolConfigContent: {
        padding: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
      },
      toolControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginTop: 10,
        width: '100%',
      },
      toolSelector: {
        position: 'relative',
        zIndex: 100,
        minWidth: 180,
        maxWidth: 180,
      },
      configFields: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 10,
      },
      configField: {
        flex: 1,
        minWidth: 200,
        marginBottom: 8,
      },
      configLabel: {
        color: theme.colors.text,
        fontSize: 14,
        marginBottom: 4,
      },

    configRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        width: '100%',
      },
      configColumn: {
        flex: 1,
        minWidth: 200,
        marginBottom: 8,
      },
      configFieldError: {
        borderColor: theme.colors.error,
      },
  
      configLabelError: {
        color: theme.colors.error,
      },
  
      textInputError: {
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: `${theme.colors.error}10`,
      },
  
      selectContainerError: {
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: `${theme.colors.error}10`,
      },
  
      errorText: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
      },
  
      requiredStar: {
        color: theme.colors.error,
        marginLeft: 4,
      },
  };
};