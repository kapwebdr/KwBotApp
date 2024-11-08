import { Theme } from '../../types/themes';

export const createPendingFilesStyles = (theme: Theme) => {
  return {
    clearFileButton: {
      marginLeft: 4,
      padding: 2,
    },

    pendingFileContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 2,
        marginLeft: 4,
      },
      pendingFileName: {
        color: theme.colors.text,
        fontSize: 12,
        maxWidth: 120,
      },
  };
};