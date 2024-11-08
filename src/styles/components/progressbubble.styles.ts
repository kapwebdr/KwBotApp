import { Theme } from '../../types/themes';

export const createProgressBubbleStyles = (theme: Theme) => {
  return {
    progressBar: {
        width: '100%',
        height: 4,
        backgroundColor: theme.colors.border,
        borderRadius: 2,
        marginTop: 10,
        overflow: 'hidden',
      },
      progressFill: {
        height: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
      },
      loadingBubble: {
        maxWidth: '60%',
      },
      loadingContent: {
        alignItems: 'center',
        gap: 10,
      },
      loadingDots: {
        flexDirection: 'row',
        gap: 4,
      },
      loadingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
      },
      progressContainer: {
        width: '100%',
        alignItems: 'center',
        gap: 4,
      },
      progressText: {
        fontSize: 12,
        color: theme.colors.text,
      },
  };
};