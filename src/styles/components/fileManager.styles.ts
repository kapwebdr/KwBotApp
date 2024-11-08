import { Theme } from '../../types/themes';

export const createFileManagerStyles = (theme: Theme) => ({
    fileManager: {
        flex: 1,
        backgroundColor: theme.colors.background,
      },
      loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
      },
      fileListContainer: {
        flex: 1,
        position: 'relative',
        overflow: 'auto',
      },
      fileInfo: {
        color: theme.colors.text,
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
      },
      toolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      toolbarButton: {
        padding: 8,
        borderRadius: 4,
        marginRight: 8,
      },
      currentPath: {
        flex: 1,
        color: theme.colors.text,
        fontSize: 14,
      },
      fileList: {
        flex: 1,
      },
      fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      fileItemSelected: {
        backgroundColor: `${theme.colors.primary}20`,
      },
      fileName: {
        flex: 1,
        marginLeft: 12,
        color: theme.colors.text,
        fontSize: 14,
      },
      fileSize: {
        color: theme.colors.text,
        fontSize: 12,
        opacity: 0.7,
      },
      loadingText: {
        padding: 20,
        textAlign: 'center',
        color: theme.colors.text,
      },
      fileManagerContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        height: '100%',
      },
      fileManagerToolbar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        backgroundColor: theme.colors.gray50,
      },
      breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        flexWrap: 'wrap',
      },
      breadcrumbItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 4,
        borderRadius: 4,
      },
      breadcrumbText: {
        color: theme.colors.text,
        fontSize: 14,
      },
      breadcrumbSeparator: {
        color: theme.colors.text,
        marginHorizontal: 4,
        opacity: 0.5,
      },
      toolbarActions: {
        flexDirection: 'row',
        alignItems: 'center',
      },
    //   toolbarButton: {
    //     padding: 8,
    //     marginLeft: 8,
    //   },
      newFolderInput: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
      },
      fileUploadConfig: {
        padding: 10,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: 10,
      },
      inputButton: {
        padding: 8,
        marginLeft: 8,
      },
    uploadActionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 4,
        marginLeft: 8,
        gap: 8,
      },
      uploadActionButtonDisabled: {
        opacity: 0.5,
      },
      uploadActionButtonText: {
        color: theme.colors.background,
        fontSize: 14,
        fontWeight: '500',
      },
    fileItemDirectory: {
        backgroundColor: `${theme.colors.primary}10`,
      },

      fileItemMove: {
        backgroundColor: theme.colors.primary,
      },
  
      fileItemMoveIcon: {
        color: theme.colors.background,
      },
      fileItemActionPreview: {
        backgroundColor: theme.colors.info,
      },
      fileItemActionRename: {
        backgroundColor: theme.colors.warning,
      },
}); 