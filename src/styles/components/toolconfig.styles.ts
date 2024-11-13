import { Theme } from '../../types/themes';

export const createToolConfigStyles = (theme: Theme) => {
  return {
      toolContainer: {
        backgroundColor: theme.colors.background,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
      },
  };
};
