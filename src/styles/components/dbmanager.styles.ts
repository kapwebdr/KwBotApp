import { Theme } from '../../types/themes';
import { ViewStyle, TextStyle } from 'react-native';

export const createDbManagerStyles = (theme: Theme) => ({
  // Styles pour DbManager principal
  dbManagerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  } as ViewStyle,
  dbManagerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  dbManagerContent: {
    flex: 1,
    overflow: 'auto',
  },

  // Styles pour les backends
  backendSelector: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  backendItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.gray100,
  } as ViewStyle,
  backendItemActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  backendText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  backendTextActive: {
    color: theme.colors.background,
    fontWeight: '500',
  } as TextStyle,

  // Styles pour les bases de données et collections
  metadataContainer: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  databaseSelector: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  } as ViewStyle,
  databaseItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.gray100,
  } as ViewStyle,
  databaseItemActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  databaseText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  databaseTextActive: {
    color: theme.colors.background,
    fontWeight: '500',
  } as TextStyle,

  // Styles pour CollectionSelector
  collectionSelector: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
  } as ViewStyle,
  collectionItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.gray100,
  } as ViewStyle,
  collectionItemActive: {
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  collectionText: {
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,
  collectionTextActive: {
    color: theme.colors.background,
    fontWeight: '500',
  } as TextStyle,
});
