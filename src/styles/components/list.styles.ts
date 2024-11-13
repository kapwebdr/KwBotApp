import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createListStyles = (theme: Theme) => ({
  listContainer: {
    flex: 1,
    position: 'relative',
    overflow: 'auto',
  } as ViewStyle,

  listContent: {
    flexGrow: 1,
    padding: 16,
  } as ViewStyle,

  listItem: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: theme.colors.gray100,
    marginBottom: 8,
  } as ViewStyle,

  listItemContent: {
    flex: 1,
  } as ViewStyle,

  listItemTitle: {
    fontSize: 14,
    fontWeight: '500' as const,
    color: theme.colors.text,
  } as TextStyle,

  listItemDescription: {
    fontSize: 12,
    color: theme.colors.text,
    opacity: 0.7,
  } as TextStyle,

  listItemMeta: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  } as ViewStyle,

  listItemActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    backgroundColor: theme.colors.gray100,
    paddingHorizontal: 16,
    height: '100%',
  } as ViewStyle,

  listItemAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  } as ViewStyle,

  listItemActionIcon: {
    fontSize: 20,
    color: theme.colors.background,
  } as TextStyle,

  // Actions spécifiques
  listItemActionDelete: {
    backgroundColor: theme.colors.error,
  } as ViewStyle,

  listItemActionEdit: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,

  listItemActionSchedule: {
    backgroundColor: theme.colors.info,
  } as ViewStyle,

  listItemActionMove: {
    backgroundColor: theme.colors.warning,
  } as ViewStyle,

  listItemActionPreview: {
    backgroundColor: theme.colors.success,
  } as ViewStyle,

  // Swipe
  listItemSwipeableContent: {
    backgroundColor: theme.colors.background,
  } as ViewStyle,

  listItemLeftActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
    gap: 4,
    position: 'absolute',
    left: 0,
    zIndex: 1,
  } as ViewStyle,

  listItemRightActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    height: '100%',
    paddingHorizontal: 8,
    gap: 4,
    position: 'absolute',
    right: 0,
    zIndex: 1,
  } as ViewStyle,

  listItemFixedActions: {
    flexDirection: 'row' as const,
    alignItems: 'center',
    gap: 4,
    paddingRight: 8,
  } as ViewStyle,
}); 