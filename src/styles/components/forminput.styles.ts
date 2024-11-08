import { Theme } from '../../types/themes';

export const createFormInputStyles = (theme: Theme) => {
  return {
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
      },
      input: {
        flex: 1,
        backgroundColor: theme.colors.inputBackground,
        borderRadius: 8,
        paddingHorizontal: 15,
        paddingVertical: 10,
        fontSize: theme.fontSizes.medium,
        color: theme.colors.text,
        minHeight: 40,
      },
      inputBarWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      },
      uploadContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: 8,
      },
      inputDisabled: {
        opacity: 0.5,
        backgroundColor: theme.colors.gray100,
        color: theme.colors.gray400,
      },
      selectContainer: {
        flex: 1,
        position: 'relative',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: 4,
        minWidth: 120,
        padding: 4,
      },
      select: {
        width: '100%',
        backgroundColor: theme.colors.inputBackground,
        color: theme.colors.text,
        borderWidth: 0,
        borderRadius: 4,
        paddingVertical: 8,
        paddingHorizontal: 8,
        fontSize: 14,
      },
      selectIcon: {
        position: 'absolute',
        right: '8px',
        top: '50%',
        transform: [{ translateY: -8 }],
        pointerEvents: 'none',
      },
      selectDisabled: {
        opacity: 0.5,
        backgroundColor: theme.colors.gray100,
        color: theme.colors.gray400,
      },
      textInput: {
        backgroundColor: theme.colors.inputBackground,
        color: theme.colors.text,
        borderRadius: 4,
        padding: 8,
        fontSize: 14,
        width: '100%',
        minHeight: 36,
      },

  };
};