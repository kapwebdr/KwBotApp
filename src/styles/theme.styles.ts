import { Theme } from '../types/themes';
import { lightTheme } from './theme';

import { createButtonStyles } from './components/buttons.styles';
import { createContainerStyles } from './components/containers.styles';
import { createSidebarStyles } from './components/sidebar.style';
import { createModalStyles } from './components/modal.styles';
import { createMessagesStyles } from './components/messages.styles';
import { createToolConfigStyles } from './components/toolconfig.styles';
import { createPendingFilesStyles } from './components/pendingfiles.styles';
import { createBottomBarStyles } from './components/bottombar.styles';
import { createSystemStatusStyles } from './components/systemstatus';
import { createFormInputStyles } from './components/forminput.styles';
import { createTopBarStyles } from './components/topbar.styles';
import { createProgressBubbleStyles } from './components/progressbubble.styles';
import { createFileManagerStyles } from './components/fileManager.styles';
import { createNotificationsStyles } from './components/notifications.styles';
import { createFilePreviewStyles } from './components/filePreview.styles';
export const createStyles = (themeContext: { theme: Theme }) => {
  const theme = themeContext?.theme || lightTheme;

  return {
    ...createButtonStyles(theme),
    ...createContainerStyles(theme),
    ...createSidebarStyles(theme),
    ...createModalStyles(theme),
    ...createMessagesStyles(theme),
    ...createToolConfigStyles(theme),
    ...createPendingFilesStyles(theme),
    ...createBottomBarStyles(theme),
    ...createSystemStatusStyles(theme),
    ...createFormInputStyles(theme),
    ...createTopBarStyles(theme),
    ...createProgressBubbleStyles(theme),
    ...createFileManagerStyles(theme),
    ...createNotificationsStyles(theme),
    ...createFilePreviewStyles(theme),
    
  };
};

// Pour les éléments select natifs web
export const getSelectStyle = (themeContext: { theme: Theme }, isDisabled: boolean) => {
  const theme = themeContext?.theme || lightTheme;

  return {
    backgroundColor: theme.colors.inputBackground,
    color: theme.colors.text,
    border: 'none',
    borderRadius: '5px',
    padding: '8px',
    fontSize: '14px',
    outline: 'none',
    cursor: isDisabled ? 'wait' : 'pointer',
    WebkitAppearance: 'none',
    MozAppearance: 'none',
    appearance: 'none',
    opacity: isDisabled ? 0.5 : 1,
    width: '100%',
  };
};
