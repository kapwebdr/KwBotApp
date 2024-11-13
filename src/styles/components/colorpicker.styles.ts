import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createColorPickerStyles = (theme: Theme) => ({
  colorPickerOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  } as ViewStyle,

  colorPickerContent: {
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  } as ViewStyle,

  colorPickerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: 16,
  } as TextStyle,

  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
  } as ViewStyle,

  colorItem: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  } as ViewStyle,

  colorItemSelected: {
    borderColor: theme.colors.text,
  } as ViewStyle,

  colorItemCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  colorItemCheckText: {
    color: theme.colors.text,
    fontWeight: 'bold',
  } as TextStyle,
});
