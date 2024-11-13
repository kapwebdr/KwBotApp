import { Theme } from '../../types/themes';

export const createModalStyles = (theme: Theme) => ({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    maxWidth: 800,
    maxHeight: '90%',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    display: 'flex',
    flexDirection: 'column',
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
  modalToolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalBody: {
    flex: 1,
    overflow: 'auto',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  modalButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
    minWidth: 100,
  },
  modalButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },

  // Styles spécifiques pour ConfirmationModal
  modalIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },

  modalIconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },

  modalConfirmContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },

  modalConfirmTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
    textAlign: 'center',
  },

  modalConfirmText: {
    fontSize: 16,
    color: theme.colors.text,
    opacity: 0.8,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 24,
  },

  modalConfirmActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },

  modalConfirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },

  modalConfirmButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },

  modalConfirmCancel: {
    backgroundColor: theme.colors.gray100,
  },

  modalConfirmDanger: {
    backgroundColor: theme.colors.error,
  },

  modalConfirmWarning: {
    backgroundColor: theme.colors.warning,
  },

  modalConfirmInfo: {
    backgroundColor: theme.colors.primary,
  },
});
