import { Theme } from '../../types/themes';

export const createFilePreviewStyles = (theme: Theme) => ({
    fileItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.gray100,
        paddingHorizontal: 16,
        height: '100%',
      },
      fileItemAction: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 60,
        height: '100%',
      },
      fileItemActionDelete: {
        backgroundColor: theme.colors.error,
      },
      fileItemActionDownload: {
        backgroundColor: theme.colors.primary,
      },
      fileItemActionCompress: {
        backgroundColor: theme.colors.info,
      },
      fileItemActionDecompress: {
        backgroundColor: theme.colors.warning,
      },
      fileItemactionIcon: {
        color: theme.colors.background,
      },

    // Styles pour FilePreview
    filePreviewContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        overflow: 'hidden',
        width: '100%',
        height: '100%',
        maxWidth: '90%',
        maxHeight: '90%',
      },
      filePreviewModalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
      },
  
      filePreviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        minHeight: 60,
      },
      filePreviewTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.text,
        flex: 1,
        marginRight: 16,
      },
      filePreviewCloseButton: {
        padding: 8,
      },
      filePreviewContent: {
        flex: 1,
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: 200,
        overflow: 'auto',
      },
      filePreviewLoadingContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      },
      filePreviewErrorContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
      },
      filePreviewErrorText: {
        color: theme.colors.error,
        textAlign: 'center',
        marginTop: 8,
      },
      filePreviewImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'contain',
        minHeight: 200,
      },
      filePreviewVideo: {
        width: '100%',
        height: '100%',
        minHeight: 300,
        maxHeight: '70%',
      },
      filePreviewAudio: {
        width: '100%',
        minWidth: 300,
        padding: 20,
      },
      filePreviewPdf: {
        width: '100%',
        height: '100%',
        minHeight: 500,
        border: 'none',
      },
      filePreviewUnsupportedContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        gap: 16,
      },
      filePreviewUnsupportedText: {
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 16,
      },
      filePreviewTextContainer: {
        width: '100%',
        height: '100%',
        padding: 16,
        backgroundColor: theme.colors.background,
        minHeight: 200,
      },
      filePreviewTextContent: {
        color: theme.colors.text,
        fontFamily: 'monospace',
        fontSize: 14,
        lineHeight: 20,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      },
      filePreviewHeaderActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
      },
      filePreviewHeaderButton: {
        padding: 8,
        borderRadius: 4,
        backgroundColor: theme.colors.gray100,
      },

});
