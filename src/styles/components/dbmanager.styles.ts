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
  } as ViewStyle,

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

  // Styles pour SearchBar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: theme.colors.gray100,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.colors.text,
  } as TextStyle,

  // Styles pour ItemList
  itemList: {
    flex: 1,
  } as ViewStyle,
  itemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  } as ViewStyle,
  itemKey: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  } as TextStyle,
  itemValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.gray100,
    padding: 8,
    borderRadius: 4,
  } as TextStyle,

  // Styles pour les boutons
  addButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  deleteButton: {
    padding: 4,
  } as ViewStyle,

  // Styles pour AddItemModal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  } as ViewStyle,
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  } as ViewStyle,
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  } as ViewStyle,
  modalTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: theme.colors.text,
  } as TextStyle,
  modalBody: {
    padding: 16,
    gap: 12,
  } as ViewStyle,
  input: {
    backgroundColor: theme.colors.gray100,
    borderRadius: 4,
    padding: 8,
    color: theme.colors.text,
    fontSize: 14,
  } as TextStyle,
  valueInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  } as TextStyle,
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  } as ViewStyle,
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  } as ViewStyle,
  modalButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '500',
  } as TextStyle,
}); 