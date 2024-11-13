import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createBreadcrumbStyles = (theme: Theme) => ({
  breadcrumbContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.gray50,
  } as ViewStyle,

  breadcrumbContent: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  } as ViewStyle,

  breadcrumbItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: 4,
    borderRadius: 4,
  } as ViewStyle,

  breadcrumbItemActive: {
    backgroundColor: `${theme.colors.primary}20`,
  } as ViewStyle,

  breadcrumbItemClickable: {
    cursor: 'pointer',
  } as ViewStyle,

  breadcrumbText: {
    color: theme.colors.text,
    fontSize: 14,
  } as TextStyle,

  breadcrumbTextActive: {
    color: theme.colors.primary,
    fontWeight: '500' as const,
  } as TextStyle,

  breadcrumbSeparator: {
    color: theme.colors.text,
    marginHorizontal: 4,
    opacity: 0.5,
  } as TextStyle,

  breadcrumbActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
  } as ViewStyle,

  breadcrumbButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.gray100,
  } as ViewStyle,

  breadcrumbButtonActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,

  breadcrumbButtonText: {
    color: theme.colors.text,
    fontSize: 14,
  } as TextStyle,

  breadcrumbButtonTextActive: {
    color: theme.colors.background,
  } as TextStyle,
});
