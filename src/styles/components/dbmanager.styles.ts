import { Theme } from '../../types/themes';

export const createDbManagerStyles = (theme: Theme) => ({
  // Styles pour DbManager principal
  dbManagerContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  dbManagerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  dbManagerContent: {
    flex: 1,
    overflow: 'auto',
  },
  addButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },

  // Styles pour CollectionSelector
  collectionSelector: {
    flexDirection: 'row',
    gap: 8,
    flex: 1,
  },
  collectionItem: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    backgroundColor: theme.colors.gray100,
  },
  collectionItemActive: {
    backgroundColor: theme.colors.primary,
  },
  collectionText: {
    fontSize: 14,
    color: theme.colors.text,
  },
  collectionTextActive: {
    color: theme.colors.background,
    fontWeight: '500',
  },

  // Styles pour SearchBar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: theme.colors.gray100,
    borderRadius: 4,
    paddingHorizontal: 12,
    fontSize: 14,
    color: theme.colors.text,
  },

  // Styles pour ItemList
  itemList: {
    flex: 1,
  },
  itemContainer: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemKey: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  itemValue: {
    fontSize: 14,
    color: theme.colors.text,
    fontFamily: 'monospace',
    backgroundColor: theme.colors.gray100,
    padding: 8,
    borderRadius: 4,
  },
  deleteButton: {
    padding: 4,
  },

  // Styles pour AddItemModal
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    backgroundColor: theme.colors.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  modalBody: {
    padding: 16,
    gap: 12,
  },
  valueInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: 8,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  modalButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '500',
  },
}); 