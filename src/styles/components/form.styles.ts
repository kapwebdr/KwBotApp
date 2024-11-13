import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createFormStyles = (theme: Theme) => ({
    formPromptInputContainer:
    {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        width: '100%',
    },
    formInputBarWrapper: {
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
    },
    formInputDisabled: {
        opacity: 0.5,
        backgroundColor: theme.colors.gray100,
    } as ViewStyle,

    formGroup: {
        marginBottom: 16,
    } as ViewStyle,

    formLabel: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.text,
        marginBottom: 8,
    } as TextStyle,
    formLabelError: {
        color: theme.colors.error,
    } as TextStyle,
    formInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: theme.colors.text,
        minHeight: 40,
    } as TextStyle,

    formTextArea: {
        minHeight: 100,
        textAlignVertical: 'top',
        paddingTop: 12,
    } as TextStyle,

    formSelect: {
        backgroundColor: 'transparent',
        color: theme.colors.text,
        fontSize: 14,
        paddingRight: 40,
        minHeight: 40,
        width: '100%',
    } as TextStyle,

    formSelectContainer: {
        position: 'relative',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    } as ViewStyle,
    formSelectContainerError: {
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: `${theme.colors.error}10`,
      },
    formRow: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        width: '100%',
    } as ViewStyle,

    formColumn: {
        flex: 1,
        minWidth: 200,
        marginBottom: 8,
    } as ViewStyle,

    formActions: {
        flexDirection: 'row' as const,
        justifyContent: 'flex-end',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        gap: 8,
    } as ViewStyle,

    formButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 4,
        backgroundColor: theme.colors.primary,
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
    } as ViewStyle,

    formButtonText: {
        color: theme.colors.background,
        fontSize: 14,
        fontWeight: '500',
    } as TextStyle,

    formButtonSecondary: {
        backgroundColor: theme.colors.gray200,
    } as ViewStyle,

    formButtonSecondaryText: {
        color: theme.colors.text,
    } as TextStyle,

    formError: {
        color: theme.colors.error,
        fontSize: 12,
        marginTop: 4,
    } as TextStyle,

    formInputError: {
        borderWidth: 1,
        borderColor: theme.colors.error,
        backgroundColor: `${theme.colors.error}10`,
    } as ViewStyle,

    formRequired: {
        color: theme.colors.error,
        marginLeft: 4,
    } as TextStyle,

    formSwitch: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    } as ViewStyle,

    formSwitchLabel: {
        fontSize: 14,
        color: theme.colors.text,
    } as TextStyle,

    formDatePicker: {
        backgroundColor: theme.colors.gray100,
        borderRadius: 4,
        padding: 8,
        flexDirection: 'row' as const,
        alignItems: 'center',
        justifyContent: 'space-between',
    } as ViewStyle,

    formDatePickerText: {
        fontSize: 14,
        color: theme.colors.text,
    } as TextStyle,

    formCheckbox: {
        flexDirection: 'row' as const,
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    } as ViewStyle,

    formCheckboxInput: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: theme.colors.text,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    formCheckboxLabel: {
        fontSize: 14,
        color: theme.colors.text,
    } as TextStyle,

    formSection: {
        marginBottom: 24,
    } as ViewStyle,

    formSectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
        marginBottom: 16,
    } as TextStyle,

    formHint: {
        fontSize: 12,
        color: theme.colors.gray400,
        marginTop: 4,
    } as TextStyle,
    formRequiredStar: {
        color: theme.colors.error,
        marginLeft: 4,
      },
    formInputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.inputBackground,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    } as ViewStyle,

    formInput: {
        flex: 1,
        paddingHorizontal: 12,
        paddingVertical: 8,
        fontSize: 14,
        color: theme.colors.text,
        minHeight: 40,
    } as TextStyle,

    formInputWithLeftIcon: {
        paddingLeft: 40,
    } as TextStyle,

    formInputWithRightIcon: {
        paddingRight: 40,
    } as TextStyle,

    formInputIcon: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    } as ViewStyle,

    formHelper: {
        fontSize: 12,
        color: theme.colors.gray400,
        marginTop: 4,
    } as TextStyle,

    formSelectIcon: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 40,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    } as ViewStyle,
});
